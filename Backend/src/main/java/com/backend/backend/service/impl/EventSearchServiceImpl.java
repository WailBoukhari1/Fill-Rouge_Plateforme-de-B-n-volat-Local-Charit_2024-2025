package com.backend.backend.service.impl;

import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.model.Event;
import com.backend.backend.model.EventStatus;
import com.backend.backend.model.RegistrationStatus;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.interfaces.EventSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventSearchServiceImpl implements EventSearchService {
    
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${app.search.max-radius:50}")
    private double maxSearchRadius; // Maximum search radius in kilometers

    @Value("${app.search.default-radius:10}")
    private double defaultSearchRadius; // Default search radius in kilometers

    @Value("${app.search.popular-events-cache-ttl:3600}") // 1 hour default
    private int popularEventsCacheTTL;

    @Value("${app.nominatim.url:https://nominatim.openstreetmap.org}")
    private String nominatimUrl;

    @Override
    public Page<EventResponse> searchEvents(
            String query,
            String location,
            Double radius,
            Set<String> categories,
            Boolean includeFullEvents,
            Boolean includePastEvents,
            Pageable pageable) {
        
        try {
            // Validate and process radius
            double searchRadius = processRadius(radius);
            
            // Get coordinates if location is provided
            final LatLng coordinates = StringUtils.hasText(location) ? getCoordinates(location) : null;
            final String currentUserId = getCurrentUserId();
            final LocalDateTime now = LocalDateTime.now();

            // Build and execute search
            return eventRepository.searchEvents(
                StringUtils.hasText(query) ? query : "",
                coordinates != null ? coordinates.lat : null,
                coordinates != null ? coordinates.lng : null,
                searchRadius * 1000, // Convert to meters
                categories,
                includeFullEvents != null ? includeFullEvents : false,
                includePastEvents != null ? includePastEvents : false,
                now,
                EventStatus.PUBLISHED,
                pageable
            ).map(event -> mapToEventResponse(event, coordinates, currentUserId));

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error during event search", e);
            throw new CustomException("Failed to process event search", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public List<EventResponse> findNearbyEvents(String location, Double radius) {
        try {
            double searchRadius = processRadius(radius);
            final LatLng coordinates = getCoordinates(location);
            final String currentUserId = getCurrentUserId();

            return eventRepository.findNearbyEvents(
                coordinates.lat,
                coordinates.lng,
                searchRadius * 1000,
                EventStatus.PUBLISHED,
                LocalDateTime.now()
            ).stream()
            .map(event -> mapToEventResponse(event, coordinates, currentUserId))
            .toList();

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error finding nearby events", e);
            throw new CustomException("Failed to find nearby events", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Cacheable(value = "upcomingEvents", key = "#days")
    public List<EventResponse> findUpcomingEvents(int days) {
        LocalDateTime endDate = LocalDateTime.now().plusDays(days);
        final String currentUserId = getCurrentUserId();
        
        return eventRepository.findUpcomingEvents(LocalDateTime.now(), endDate, EventStatus.PUBLISHED)
            .stream()
            .map(event -> mapToEventResponse(event, null, currentUserId))
            .toList();
    }

    @Override
    @Cacheable(value = "popularEvents", key = "#limit")
    public List<EventResponse> findPopularEvents(int limit) {
        final String currentUserId = getCurrentUserId();
        
        return eventRepository.findPopularEvents(
                EventStatus.PUBLISHED,
                LocalDateTime.now(),
                PageRequest.of(0, limit)
            ).stream()
            .map(event -> mapToEventResponse(event, null, currentUserId))
            .toList();
    }

    private LatLng getCoordinates(String location) {
        try {
            String encodedLocation = java.net.URLEncoder.encode(location, "UTF-8");
            String url = String.format("%s/search?format=json&q=%s&limit=1", nominatimUrl, encodedLocation);
            
            NominatimResponse[] responses = restTemplate.getForObject(url, NominatimResponse[].class);
            
            if (responses != null && responses.length > 0) {
                NominatimResponse result = responses[0];
                return new LatLng(
                    Double.parseDouble(result.lat),
                    Double.parseDouble(result.lon)
                );
            }
            throw new CustomException("Location not found", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error geocoding location: {}", location, e);
            throw new CustomException("Failed to process location", HttpStatus.BAD_REQUEST);
        }
    }

    private double processRadius(Double radius) {
        if (radius == null) {
            return defaultSearchRadius;
        }
        if (radius <= 0 || radius > maxSearchRadius) {
            throw new CustomException(
                String.format("Radius must be between 0 and %s kilometers", maxSearchRadius),
                HttpStatus.BAD_REQUEST
            );
        }
        return radius;
    }

    private EventResponse mapToEventResponse(Event event, LatLng searchCoordinates, String currentUserId) {
        // Calculate distance if search coordinates are provided
        Double distance = null;
        if (searchCoordinates != null && event.getLatitude() != null && event.getLongitude() != null) {
            distance = calculateDistance(
                searchCoordinates.lat,
                searchCoordinates.lng,
                event.getLatitude(),
                event.getLongitude()
            );
        }

        // Get registration count
        final long registrationCount = registrationRepository.countByEventIdAndStatusIn(
            event.getId(),
            List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
        );

        // Check if event is full
        final boolean isFull = event.getMaxParticipants() != null && 
                        registrationCount >= event.getMaxParticipants();

        // Check if current user is registered
        final boolean isRegistered = currentUserId != null && 
                             registrationRepository.existsByEventIdAndVolunteerIdAndStatusIn(
                                 event.getId(),
                                 currentUserId,
                                 List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
                             );

        // Calculate available spots
        final int availableSpots = event.getMaxParticipants() != null ? 
                            event.getMaxParticipants() - (int)registrationCount : 
                            Integer.MAX_VALUE;

        // Get organization details if available
        String organizationName = null;
        String organizationLogo = null;
        if (event.getOrganizationId() != null) {
            final var organization = userRepository.findById(event.getOrganizationId());
            if (organization.isPresent()) {
                organizationName = organization.get().getFirstName();
                organizationLogo = organization.get().getProfilePicture();
            }
        }

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .location(event.getLocation())
                .category(event.getCategory())
                .organizationId(event.getOrganizationId())
                .organizationName(organizationName)
                .organizationLogo(organizationLogo)
                .imageUrl(event.getImageUrl())
                .maxParticipants(event.getMaxParticipants())
                .registrationDeadline(event.getRegistrationDeadline())
                .requiresApproval(event.isRequiresApproval())
                .status(event.getStatus())
                .distance(distance)
                .registrationCount(registrationCount)
                .isFull(isFull)
                .isRegistered(isRegistered)
                .availableSpots(availableSpots)
                .build();
    }

    private Double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Leaflet's haversine formula implementation
        double R = 6371; // Earth's radius in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private String getCurrentUserId() {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.debug("No authenticated user found");
        }
        return null;
    }

    // Inner classes for Nominatim response
    private static class NominatimResponse {
        public String lat;
        public String lon;
    }

    private static class LatLng {
        public final double lat;
        public final double lng;

        public LatLng(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }
}