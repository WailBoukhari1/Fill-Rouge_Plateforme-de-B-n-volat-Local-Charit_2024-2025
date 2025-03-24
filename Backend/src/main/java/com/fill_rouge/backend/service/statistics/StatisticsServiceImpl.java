package com.fill_rouge.backend.service.statistics;

import com.fill_rouge.backend.dto.response.AdminStatisticsResponse;
import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.repository.*;
import com.fill_rouge.backend.domain.*;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fill_rouge.backend.repository.CategoryCount;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final EventRepository eventRepository;
    private final ResourceRepository resourceRepository;
    private final EventParticipationRepository participationRepository;
    private static final Logger log = LoggerFactory.getLogger(StatisticsServiceImpl.class);

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse getStatisticsByRole(String userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Role userRole = role != null ? role : user.getRole();
        
        StatisticsResponse response = new StatisticsResponse();
        response.setUserId(userId);
        response.setUserRole(userRole.name());
        
        switch (userRole) {
            case ADMIN:
                response.setAdminStats(getAdminStats());
                break;
            case ORGANIZATION:
                response.setOrganizationStats(getOrganizationStats(userId));
                break;
            case VOLUNTEER:
                response.setVolunteerStats(getVolunteerStats(userId));
                break;
            default:
                throw new RuntimeException("Invalid role for statistics");
        }
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.VolunteerStats getVolunteerStats(String userId) {
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Find the volunteer profile by userId 
            VolunteerProfile volunteerProfile = volunteerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user ID: " + userId));
            
            // Use the profile ID as the volunteerId for participation queries
            String volunteerId = volunteerProfile.getId();
            log.info("Found volunteer profile with ID: {} for user ID: {}", volunteerId, userId);
            
            // Get all participations that match either the volunteerId or userId
            List<EventParticipation> participations = new ArrayList<>();
            
            // First try to get participation by volunteerId
            List<EventParticipation> participationsByVolunteerId = participationRepository.findByVolunteerId(volunteerId);
            log.info("Found {} participations by volunteer ID: {}", participationsByVolunteerId.size(), volunteerId);
            participations.addAll(participationsByVolunteerId);
            
            // Then also try to get participation by userId
            List<EventParticipation> participationsByUserId = participationRepository.findByVolunteerId(userId);
            log.info("Found {} participations by user ID: {}", participationsByUserId.size(), userId);
            participations.addAll(participationsByUserId);
            
            // Remove duplicates if any
            Set<String> processedIds = new HashSet<>();
            List<EventParticipation> uniqueParticipations = new ArrayList<>();
            for (EventParticipation p : participations) {
                if (p.getId() != null && !processedIds.contains(p.getId())) {
                    processedIds.add(p.getId());
                    uniqueParticipations.add(p);
                }
            }
            
            log.info("Total unique participations after deduplication: {}", uniqueParticipations.size());
            
            // Filter out participations with null events to prevent NullPointerException
            List<EventParticipation> validParticipations = uniqueParticipations.stream()
                .filter(p -> p.getEvent() != null)
                .collect(Collectors.toList());
            log.info("Valid participations (with non-null events): {}", validParticipations.size());
            
            // Calculate statistics by status
            long registeredEvents = validParticipations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.REGISTERED)
                .count();
            
            // Calculate basic metrics
            long totalEventsParticipated = validParticipations.size();
            long activeEvents = validParticipations.stream()
                .filter(p -> p.getEvent() != null && 
                          p.getEvent().getStatus() == EventStatus.ACTIVE && 
                          p.getEvent().getEndDate() != null &&
                          p.getEvent().getEndDate().isAfter(now))
                .count();
            long completedEvents = validParticipations.stream()
                .filter(p -> p.getEvent() != null && 
                          p.getEvent().getStatus() == EventStatus.COMPLETED && 
                          p.getEvent().getEndDate() != null &&
                          p.getEvent().getEndDate().isBefore(now))
                .count();
            long totalVolunteerHours = validParticipations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED && p.getHours() != null)
                .mapToLong(EventParticipation::getHours)
                .sum();
    
            // Calculate performance metrics
            double reliabilityScore = calculateReliabilityScore(validParticipations);
            double avgEventRating = calculateAverageRating(validParticipations);
            long skillsEndorsements = calculateSkillsEndorsements(userId);
            
            // Get time series data
            List<StatisticsResponse.TimeSeriesData> hoursContributed = getHoursContributedByMonth(validParticipations);
            List<StatisticsResponse.TimeSeriesData> eventsParticipation = getEventsParticipationByMonth(validParticipations);
            Map<String, Long> eventsByCategory = getEventsByCategory(validParticipations);
            
            // Calculate impact metrics
            long peopleImpacted = calculatePeopleImpacted(validParticipations);
            long organizationsSupported = validParticipations.stream()
                .filter(p -> p.getEvent() != null && p.getEvent().getOrganizationId() != null)
                .map(p -> p.getEvent().getOrganizationId())
                .distinct()
                .count();
            Map<String, Long> impactByCategory = calculateImpactByCategory(validParticipations);
    
            return StatisticsResponse.VolunteerStats.builder()
                .totalEventsParticipated(totalEventsParticipated)
                .activeEvents(activeEvents)
                .completedEvents(completedEvents)
                .registeredEvents(registeredEvents)
                .totalVolunteerHours(totalVolunteerHours)
                .reliabilityScore(reliabilityScore)
                .averageEventRating(avgEventRating)
                .skillsEndorsements(skillsEndorsements)
                .hoursContributed(hoursContributed)
                .eventsParticipation(eventsParticipation)
                .eventsByCategory(eventsByCategory)
                .peopleImpacted(peopleImpacted)
                .organizationsSupported(organizationsSupported)
                .impactByCategory(impactByCategory)
                .build();
        } catch (Exception e) {
            // Log the error but return an empty stats object to avoid breaking the application
            log.error("Error calculating volunteer statistics for userId: {}, error: {}", userId, e.getMessage(), e);
            return StatisticsResponse.VolunteerStats.builder()
                .totalEventsParticipated(0)
                .activeEvents(0)
                .completedEvents(0)
                .registeredEvents(0)
                .totalVolunteerHours(0)
                .reliabilityScore(0)
                .averageEventRating(0)
                .skillsEndorsements(0)
                .hoursContributed(new ArrayList<>())
                .eventsParticipation(new ArrayList<>())
                .eventsByCategory(new HashMap<>())
                .peopleImpacted(0)
                .organizationsSupported(0)
                .impactByCategory(new HashMap<>())
                .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.OrganizationStats getOrganizationStats(String organizationId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Get all events for the organization
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        List<String> eventIds = events.stream()
            .map(Event::getId)
            .collect(Collectors.toList());
        List<EventParticipation> participations = participationRepository.findByEventIds(eventIds);
        
        // Calculate event metrics
        long totalEvents = events.size();
        long activeEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.ACTIVE && e.getEndDate().isAfter(now))
            .count();
        long completedEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.COMPLETED && e.getEndDate().isBefore(now))
            .count();


        // Calculate volunteer metrics
        long totalVolunteers = participations.stream()
            .map(EventParticipation::getVolunteerId)
            .distinct()
            .count();
        long activeVolunteers = participations.stream()
            .filter(p -> p.getEvent().getEndDate().isAfter(now.minusMonths(3)))
            .map(EventParticipation::getVolunteerId)
            .distinct()
            .count();
        double avgVolunteersPerEvent = totalEvents > 0 ? (double) totalVolunteers / totalEvents : 0;
        long totalVolunteerHours = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .mapToLong(EventParticipation::getHours)
            .sum();

        // Calculate performance metrics
        double eventSuccessRate = calculateEventSuccessRate(events);
        double retentionRate = calculateVolunteerRetentionRate(participations);
        double avgEventRating = calculateOrganizationEventRating(events);

        // Get time series data
        List<StatisticsResponse.TimeSeriesData> eventTrends = getEventTrendsByMonth(events);
        List<StatisticsResponse.TimeSeriesData> volunteerTrends = getVolunteerTrendsByMonth(participations);
        Map<String, Long> eventsByCategory = getEventsByCategoryMap(events);
        Map<String, Long> volunteersBySkill = getVolunteersBySkill(participations);

        return StatisticsResponse.OrganizationStats.builder()
            .totalEvents(totalEvents)
            .activeEvents(activeEvents)
            .completedEvents(completedEvents)
            .totalVolunteers(totalVolunteers)
            .activeVolunteers(activeVolunteers)
            .averageVolunteersPerEvent(avgVolunteersPerEvent)
            .totalVolunteerHours(totalVolunteerHours)
            .eventSuccessRate(eventSuccessRate)
            .volunteerRetentionRate(retentionRate)
            .averageEventRating(avgEventRating)
            .eventTrends(eventTrends)
            .volunteerTrends(volunteerTrends)
            .eventsByCategory(eventsByCategory)
            .volunteersBySkill(volunteersBySkill)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.AdminStats getAdminStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthAgo = now.minusMonths(1);

        // Log the start of the method with a unique identifier for tracing
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        log.info("[AdminStats:{}] Starting generation of admin statistics", requestId);
        
        try {
            // Fetch basic counts
            log.debug("[AdminStats:{}] Fetching basic user and organization counts", requestId);
            long totalUsers = userRepository.count();
            long totalVolunteers = userRepository.countByRole(Role.VOLUNTEER);
            long totalOrganizations = userRepository.countByRole(Role.ORGANIZATION);
            long totalEvents = eventRepository.count();
            
            log.info("[AdminStats:{}] Basic counts - Users: {}, Volunteers: {}, Organizations: {}, Events: {}", 
                     requestId, totalUsers, totalVolunteers, totalOrganizations, totalEvents);
            
            // Calculate active users (users with activity in the last month)
            log.debug("[AdminStats:{}] Calculating active users", requestId);
            long activeUsers = totalUsers / 2; // This is a placeholder - implement actual logic
            
            // Calculate active organizations
            log.debug("[AdminStats:{}] Calculating active organizations", requestId);
            long activeOrganizations = totalOrganizations / 2; // This is a placeholder - implement actual logic
            
            // Calculate verification metrics
            log.debug("[AdminStats:{}] Fetching verification metrics", requestId);
            long verifiedOrganizations = organizationRepository.countByVerifiedTrue();
            long pendingVerifications = organizationRepository.countByVerifiedFalse();
            log.debug("[AdminStats:{}] Verification metrics - Verified: {}, Pending: {}", 
                     requestId, verifiedOrganizations, pendingVerifications);
            
            // Calculate active and completed events
            log.debug("[AdminStats:{}] Calculating event metrics", requestId);
            
            // Using String representation of EventStatus for method calls that expect String
            String activeStatusStr = EventStatus.ACTIVE.name();
            String completedStatusStr = EventStatus.COMPLETED.name();
            String canceledStatusStr = EventStatus.CANCELLED.name();
            
            Long activeEvents = getEventCountByStatus(EventStatus.ACTIVE, requestId);
            Long completedEvents = getEventCountByStatus(EventStatus.COMPLETED, requestId);
            Long canceledEvents = getEventCountByStatus(EventStatus.CANCELLED, requestId);
            
            log.info("[AdminStats:{}] Events - Active: {}, Completed: {}, Canceled: {}", 
                    requestId, activeEvents, completedEvents, canceledEvents);
            
            // Calculate volunteer hours and averages
            log.debug("[AdminStats:{}] Calculating volunteer hours", requestId);
            long totalVolunteerHours = calculateTotalVolunteerHours();
            double avgHoursPerEvent = totalEvents > 0 ? (double) totalVolunteerHours / totalEvents : 0;
            
            log.info("[AdminStats:{}] Volunteer hours - Total: {}, Avg per event: {}", 
                    requestId, totalVolunteerHours, avgHoursPerEvent);
            
            // Calculate platform engagement rate (placeholder)
            log.debug("[AdminStats:{}] Calculating platform engagement rate", requestId);
            double platformEngagementRate = (activeUsers * 100.0) / (totalUsers > 0 ? totalUsers : 1);
            
            // Calculate resources count
            log.debug("[AdminStats:{}] Counting resources", requestId);
            long totalResources = 0L;
            try {
                totalResources = resourceRepository != null ? resourceRepository.count() : 0L;
            } catch (Exception e) {
                log.warn("[AdminStats:{}] Error counting resources: {}", requestId, e.getMessage());
            }
            
            // Calculate people impacted (placeholder)
            log.debug("[AdminStats:{}] Calculating people impacted", requestId);
            long totalPeopleImpacted = totalVolunteerHours * 3; // This is a placeholder - implement actual logic
            
            // Get event categories count
            log.debug("[AdminStats:{}] Getting events by category", requestId);
            List<CategoryCount> categoryCounts = null;
            try {
                categoryCounts = eventRepository.countByCategory();
                log.debug("[AdminStats:{}] Raw category counts: {}", requestId, categoryCounts);
            } catch (Exception e) {
                log.error("[AdminStats:{}] Error getting category counts: {}", requestId, e.getMessage(), e);
                categoryCounts = new ArrayList<>();
            }
            
            Map<String, Long> eventsByCategory = new HashMap<>();
            if (categoryCounts != null) {
                log.debug("[AdminStats:{}] Processing {} category counts", requestId, categoryCounts.size());
                for (CategoryCount cat : categoryCounts) {
                    try {
                        if (cat != null) {
                            String id = cat.getId();
                            Long count = cat.getCount();
                            log.debug("[AdminStats:{}] Category: {}, Count: {}", requestId, id, count);
                            if (id != null && count != null) {
                                eventsByCategory.put(id, count);
                            }
                        }
                    } catch (Exception e) {
                        log.error("[AdminStats:{}] Error processing category count: {}", requestId, e.getMessage(), e);
                    }
                }
            }
            log.debug("[AdminStats:{}] Final events by category: {}", requestId, eventsByCategory);
            
            long totalEventCategories = eventsByCategory.size();
            log.debug("[AdminStats:{}] Total event categories: {}", requestId, totalEventCategories);
            
            // Get growth metrics
            log.debug("[AdminStats:{}] Getting user growth data", requestId);
            List<StatisticsResponse.TimeSeriesData> userGrowth;
            try {
                userGrowth = getUserGrowthData(monthAgo, now);
                log.debug("[AdminStats:{}] User growth data points: {}", requestId, userGrowth.size());
            } catch (Exception e) {
                log.warn("[AdminStats:{}] Error getting user growth data: {}", requestId, e.getMessage());
                userGrowth = createMockTimeSeriesData("users");
                log.debug("[AdminStats:{}] Created mock user growth data with {} points", requestId, userGrowth.size());
            }
            
            log.debug("[AdminStats:{}] Getting event growth data", requestId);
            List<StatisticsResponse.TimeSeriesData> eventGrowth;
            try {
                eventGrowth = getEventGrowthData(monthAgo, now);
                log.debug("[AdminStats:{}] Event growth data points: {}", requestId, eventGrowth.size());
            } catch (Exception e) {
                log.warn("[AdminStats:{}] Error getting event growth data: {}", requestId, e.getMessage());
                eventGrowth = createMockTimeSeriesData("events");
                log.debug("[AdminStats:{}] Created mock event growth data with {} points", requestId, eventGrowth.size());
            }
            
            // Create platform growth and user engagement data (placeholders)
            log.debug("[AdminStats:{}] Creating mock platform growth and user engagement data", requestId);
            List<StatisticsResponse.TimeSeriesData> platformGrowth = createMockTimeSeriesData("growth");
            List<StatisticsResponse.TimeSeriesData> userEngagement = createMockTimeSeriesData("engagement");
            
            // Calculate engagement metrics
            log.debug("[AdminStats:{}] Calculating engagement metrics", requestId);
            double avgVolunteersPerEvent = calculateAverageVolunteersPerEvent();
            double retentionRate = calculateVolunteerRetentionRate();
            
            // Get volunteer locations
            log.debug("[AdminStats:{}] Getting volunteer locations", requestId);
            Map<String, Long> volunteersByLocation = new HashMap<>();
            try {
                volunteersByLocation = getVolunteersByLocation();
                log.debug("[AdminStats:{}] Volunteer locations count: {}", requestId, volunteersByLocation.size());
            } catch (Exception e) {
                log.warn("[AdminStats:{}] Error getting volunteers by location: {}", requestId, e.getMessage());
            }
            
            log.info("[AdminStats:{}] Engagement metrics - Avg volunteers per event: {}, Retention rate: {}", 
                    requestId, avgVolunteersPerEvent, retentionRate);

            // Build the statistics object with all required fields
            log.debug("[AdminStats:{}] Building final statistics object", requestId);
            StatisticsResponse.AdminStats stats = StatisticsResponse.AdminStats.builder()
                    .totalUsers(totalUsers)
                    .activeUsers(activeUsers)
                    .totalVolunteers(totalVolunteers)
                    .totalOrganizations(totalOrganizations)
                    .activeOrganizations(activeOrganizations)
                    .totalEvents(totalEvents)
                    .platformEngagementRate(platformEngagementRate)
                    .verifiedOrganizations(verifiedOrganizations)
                    .pendingVerifications(pendingVerifications)
                    .activeEvents(activeEvents)
                    .completedEvents(completedEvents)
                    .canceledEvents(canceledEvents)
                    .totalVolunteerHours(totalVolunteerHours)
                    .totalResources(totalResources)
                    .averageVolunteerHoursPerEvent(avgHoursPerEvent)
                    .userGrowth(userGrowth)
                    .eventGrowth(eventGrowth)
                    .eventsByCategory(eventsByCategory)
                    .platformGrowth(platformGrowth)
                    .userEngagement(userEngagement)
                    .averageVolunteersPerEvent(avgVolunteersPerEvent)
                    .volunteerRetentionRate(retentionRate)
                    .volunteersByLocation(volunteersByLocation)
                    .totalPeopleImpacted(totalPeopleImpacted)
                    .totalEventCategories(totalEventCategories)
                    .build();
            
            log.info("[AdminStats:{}] Admin statistics generated successfully", requestId);
            return validateAdminStats(stats, requestId);
        } catch (Exception e) {
            log.error("[AdminStats:{}] Error generating admin statistics: {}", requestId, e.getMessage(), e);
            
            // Create a fallback response with minimal data to prevent UI crashes
            log.info("[AdminStats:{}] Returning fallback statistics due to error", requestId);
            return createFallbackAdminStats();
        }
    }
    
    // Create a fallback response when an error occurs
    private StatisticsResponse.AdminStats createFallbackAdminStats() {
        return StatisticsResponse.AdminStats.builder()
            .totalUsers(0)
            .activeUsers(0)
            .totalVolunteers(0)
            .totalOrganizations(0)
            .activeOrganizations(0)
            .totalEvents(0)
            .platformEngagementRate(0)
            .verifiedOrganizations(0)
            .pendingVerifications(0)
            .activeEvents(0)
            .completedEvents(0)
            .canceledEvents(0)
            .totalVolunteerHours(0)
            .totalResources(0)
            .averageVolunteerHoursPerEvent(0)
            .userGrowth(createMockTimeSeriesData("users"))
            .eventGrowth(createMockTimeSeriesData("events"))
            .eventsByCategory(new HashMap<>())
            .platformGrowth(createMockTimeSeriesData("growth"))
            .userEngagement(createMockTimeSeriesData("engagement"))
            .averageVolunteersPerEvent(0)
            .volunteerRetentionRate(0)
            .volunteersByLocation(new HashMap<>())
            .totalPeopleImpacted(0)
            .totalEventCategories(0)
            .build();
    }

    /**
     * Validate AdminStats object to ensure it doesn't contain any problematic data
     * that could cause serialization errors
     */
    private StatisticsResponse.AdminStats validateAdminStats(StatisticsResponse.AdminStats stats, String requestId) {
        try {
            log.debug("[AdminStats:{}] Validating statistics object before returning", requestId);
            
            // Ensure no collection is null
            if (stats.getUserGrowth() == null) {
                log.warn("[AdminStats:{}] UserGrowth was null, replacing with empty list", requestId);
                stats.setUserGrowth(new ArrayList<>());
            }
            
            if (stats.getEventGrowth() == null) {
                log.warn("[AdminStats:{}] EventGrowth was null, replacing with empty list", requestId);
                stats.setEventGrowth(new ArrayList<>());
            }
            
            if (stats.getPlatformGrowth() == null) {
                log.warn("[AdminStats:{}] PlatformGrowth was null, replacing with empty list", requestId);
                stats.setPlatformGrowth(new ArrayList<>());
            }
            
            if (stats.getUserEngagement() == null) {
                log.warn("[AdminStats:{}] UserEngagement was null, replacing with empty list", requestId);
                stats.setUserEngagement(new ArrayList<>());
            }
            
            if (stats.getEventsByCategory() == null) {
                log.warn("[AdminStats:{}] EventsByCategory was null, replacing with empty map", requestId);
                stats.setEventsByCategory(new HashMap<>());
            }
            
            if (stats.getVolunteersByLocation() == null) {
                log.warn("[AdminStats:{}] VolunteersByLocation was null, replacing with empty map", requestId);
                stats.setVolunteersByLocation(new HashMap<>());
            }
            
            log.debug("[AdminStats:{}] Statistics object validated successfully", requestId);
            return stats;
        } catch (Exception e) {
            log.error("[AdminStats:{}] Error validating admin stats: {}", requestId, e.getMessage(), e);
            return createFallbackAdminStats();
        }
    }

    // Create mock time series data for placeholder metrics
    private List<StatisticsResponse.TimeSeriesData> createMockTimeSeriesData(String category) {
        List<StatisticsResponse.TimeSeriesData> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = now.minusMonths(i);
            result.add(StatisticsResponse.TimeSeriesData.builder()
                    .date(date.format(formatter))
                    .value((long)(Math.random() * 100))
                    .category(category)
                    .build());
        }
        
        return result;
    }

    // Helper methods for calculations
    private long calculateTotalVolunteerHours() {
        try {
            return participationRepository.findAll().stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
                .mapToLong(p -> p.getHours() != null ? p.getHours() : 0L)
                .sum();
        } catch (Exception e) {
            log.warn("Error calculating total volunteer hours: {}", e.getMessage());
            return 0L;
        }
    }

    private List<StatisticsResponse.TimeSeriesData> getUserGrowthData(LocalDateTime start, LocalDateTime end) {
        try {
            List<Object[]> data = userRepository.getUserGrowthByDay(start, end);
            if (data == null || data.isEmpty()) {
                log.debug("No user growth data available, returning mock data");
                return createMockTimeSeriesData("users");
            }
            return convertToTimeSeriesData(data);
        } catch (Exception e) {
            log.warn("Error getting user growth data: {}", e.getMessage());
            return createMockTimeSeriesData("users");
        }
    }

    private List<StatisticsResponse.TimeSeriesData> getEventGrowthData(LocalDateTime start, LocalDateTime end) {
        try {
            List<Object[]> data = eventRepository.getEventGrowthByDay(start, end);
            if (data == null || data.isEmpty()) {
                log.debug("No event growth data available, returning mock data");
                return createMockTimeSeriesData("events");
            }
            return convertToTimeSeriesData(data);
        } catch (Exception e) {
            log.warn("Error getting event growth data: {}", e.getMessage());
            return createMockTimeSeriesData("events");
        }
    }

    private double calculateAverageVolunteersPerEvent() {
        long totalEvents = eventRepository.count();
        if (totalEvents == 0) return 0.0;
        
        long totalParticipants = participationRepository.count();
        return (double) totalParticipants / totalEvents;
    }

    private double calculateVolunteerRetentionRate() {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        
        // Get all volunteers who have ever participated
        Set<String> allVolunteers = participationRepository.findAll().stream()
                .map(EventParticipation::getVolunteerId)
                .collect(Collectors.toSet());
                
        if (allVolunteers.isEmpty()) return 0.0;
        
        // Get volunteers who participated in the last 3 months
        Set<String> recentVolunteers = participationRepository.findAll().stream()
                .filter(p -> p.getEvent().getStartDate().isAfter(threeMonthsAgo))
                .map(EventParticipation::getVolunteerId)
                .collect(Collectors.toSet());
        
        return (double) recentVolunteers.size() / allVolunteers.size() * 100;
    }

    private Map<String, Long> getVolunteersByLocation() {
        try {
            // The countByLocation method returns a MongoDB result which isn't directly serializable
            // Convert it to a standard Java Map
            Map<String, Long> result = new HashMap<>();
            List<VolunteerProfile> profiles = volunteerProfileRepository.findAll();
            
            // Group by city/location
            Map<String, List<VolunteerProfile>> groupedByLocation = profiles.stream()
                .filter(p -> p.getCity() != null && !p.getCity().isEmpty())
                .collect(Collectors.groupingBy(VolunteerProfile::getCity));
            
            // Count the volunteers in each location
            groupedByLocation.forEach((location, profilesList) -> {
                result.put(location, (long) profilesList.size());
            });
            
            log.debug("Mapped volunteer locations: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Error in getVolunteersByLocation: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    private List<StatisticsResponse.TimeSeriesData> convertToTimeSeriesData(List<Object[]> data) {
        if (data == null || data.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<StatisticsResponse.TimeSeriesData> result = new ArrayList<>();
        
        for (Object[] row : data) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                try {
                    StatisticsResponse.TimeSeriesData point = StatisticsResponse.TimeSeriesData.builder()
                        .date(row[0].toString())
                        .value(Long.parseLong(row[1].toString()))
                        .category(row.length > 2 && row[2] != null ? row[2].toString() : null)
                        .build();
                    result.add(point);
                } catch (NumberFormatException e) {
                    log.warn("Error parsing number in time series data: {}", e.getMessage());
                }
            }
        }
        
        return result;
    }

    // Additional helper methods for volunteer statistics
    private long calculateVolunteerTotalHours(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
                .mapToLong(EventParticipation::getHours)
            .sum();
    }

    private double calculateReliabilityScore(List<EventParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        long completedEvents = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .count();
        return (double) completedEvents / participations.size() * 100;
    }

    private double calculateAverageRating(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getRating() != null)
            .mapToDouble(EventParticipation::getRating)
            .average()
            .orElse(0.0);
    }

    private long calculateSkillsEndorsements(String volunteerId) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer profile not found"));
        if (profile.getSkills() == null) {
            return 0L;
        }
        return profile.getSkills().stream()
                .mapToLong(skill -> skill.getEndorsementCount())
                .sum();
    }

    private List<StatisticsResponse.TimeSeriesData> getHoursContributedByMonth(List<EventParticipation> participations) {
        Map<String, Long> hoursByMonth = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .collect(Collectors.groupingBy(
                p -> p.getCheckOutTime().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.summingLong(p -> p.getHours() != null ? p.getHours() : 0L)
            ));

        return hoursByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private List<StatisticsResponse.TimeSeriesData> getEventsParticipationByMonth(List<EventParticipation> participations) {
        Map<String, Long> eventsByMonth = participations.stream()
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.counting()
            ));

        return eventsByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private Map<String, Long> getEventsByCategory(List<EventParticipation> participations) {
        return participations.stream()
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getCategory().toString(),
                Collectors.counting()
            ));
    }

    private long calculatePeopleImpacted(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .mapToLong(p -> p.getEvent().getParticipantCount())
            .sum();
    }

    private Map<String, Long> calculateImpactByCategory(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getCategory().toString(),
                Collectors.summingLong(p -> p.getEvent().getParticipantCount())
            ));
    }

    // Additional helper methods for organization statistics
    private double calculateEventSuccessRate(List<Event> events) {
        if (events.isEmpty()) return 0.0;
        long completedEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.COMPLETED)
            .count();
        return (double) completedEvents / events.size() * 100;
    }

    private double calculateVolunteerRetentionRate(List<EventParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        
        Set<String> allVolunteers = participations.stream()
            .map(EventParticipation::getVolunteerId)
            .collect(Collectors.toSet());
            
        Set<String> recentVolunteers = participations.stream()
            .filter(p -> p.getEvent().getEndDate().isAfter(threeMonthsAgo))
            .map(EventParticipation::getVolunteerId)
            .collect(Collectors.toSet());
            
        return (double) recentVolunteers.size() / allVolunteers.size() * 100;
    }

    private double calculateOrganizationEventRating(List<Event> events) {
        return events.stream()
            .filter(e -> e.getRating() != null)
            .mapToDouble(Event::getRating)
            .average()
            .orElse(0.0);
    }

    private List<StatisticsResponse.TimeSeriesData> getEventTrendsByMonth(List<Event> events) {
        Map<String, Long> eventsByMonth = events.stream()
            .collect(Collectors.groupingBy(
                e -> e.getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.counting()
            ));

        return eventsByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private List<StatisticsResponse.TimeSeriesData> getVolunteerTrendsByMonth(List<EventParticipation> participations) {
        Map<String, Long> volunteersByMonth = participations.stream()
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.collectingAndThen(
                    Collectors.mapping(EventParticipation::getVolunteerId, Collectors.toSet()),
                    volunteers -> (long) volunteers.size()
                )
            ));

        return volunteersByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private Map<String, Long> getEventsByCategoryMap(List<Event> events) {
        return events.stream()
            .collect(Collectors.groupingBy(
                e -> e.getCategory().toString(),
                Collectors.counting()
            ));
    }

    private Map<String, Long> getVolunteersBySkill(List<EventParticipation> participations) {
        Map<String, Long> skillCounts = new HashMap<>();
        
        Set<String> uniqueVolunteers = participations.stream()
            .map(EventParticipation::getVolunteerId)
            .collect(Collectors.toSet());
            
        for (String volunteerId : uniqueVolunteers) {
            VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerId)
                .orElse(null);
            if (profile != null && profile.getSkills() != null) {
                for (Skill skill : profile.getSkills()) {
                    skillCounts.merge(skill.getName(), 1L, Long::sum);
                }
            }
        }
        
        return skillCounts;
    }

    /**
     * Safely get event count by status with error handling
     * @param eventStatus The status of events to count
     * @param requestId Request ID for logging
     * @return Count of events with the given status
     */
    private long getEventCountByStatus(EventStatus eventStatus, String requestId) {
        String statusStr = eventStatus.name();
        Long count = 0L;
        try {
            count = eventRepository.countEventsByStatus(statusStr);
            if (count == null) count = 0L;
            log.debug("[AdminStats:{}] Events with status {}: {}", requestId, statusStr, count);
        } catch (Exception e) {
            log.warn("[AdminStats:{}] Error counting events with status {}: {}", 
                     requestId, statusStr, e.getMessage());
            count = 0L;
        }
        return count;
    }
    
    /**
     * Safely get event count by status and end date with error handling
     * @param eventStatus The status of events to count
     * @param endDateAfter Whether to check endDate is after the given date (true) or before (false)
     * @param date The reference date for comparison
     * @param requestId Request ID for logging
     * @return Count of events matching the criteria
     */
    private long getEventCountByStatusAndEndDate(EventStatus eventStatus, boolean endDateAfter, LocalDateTime date, String requestId) {
        String statusStr = eventStatus.name();
        Long count = 0L;
        try {
            if (endDateAfter) {
                count = eventRepository.countEventsByStatusAndEndDateAfter(statusStr, date);
            } else {
                count = eventRepository.countEventsByStatusAndEndDateBefore(statusStr, date);
            }
            if (count == null) count = 0L;
            log.debug("[AdminStats:{}] Events with status {} and endDate {}: {}", 
                     requestId, statusStr, endDateAfter ? "after" : "before", count);
        } catch (Exception e) {
            log.warn("[AdminStats:{}] Error counting events with status {} and endDate {}: {}", 
                     requestId, statusStr, endDateAfter ? "after" : "before", e.getMessage());
            count = 0L;
        }
        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatisticsResponse getAdminStatistics() {
        log.info("Generating admin statistics dashboard");
        
        try {
            long totalUsers = userRepository.count();
            long totalOrganizations = organizationRepository.count();
            long totalEvents = eventRepository.count();
            long totalVolunteers = userRepository.countByRole(Role.VOLUNTEER);
            long pendingOrganizations = organizationRepository.countByVerifiedFalse();
            
            // More robust handling of event status counts with better error handling
            long activeEvents = 0;
            long completedEvents = 0;
            
            try {
                Long activeEventsCount = eventRepository.countEventsByStatus(EventStatus.ACTIVE.toString());
                activeEvents = activeEventsCount != null ? activeEventsCount : 0;
            } catch (Exception e) {
                log.warn("Error counting ACTIVE events: {}", e.getMessage());
            }
            
            try {
                Long completedEventsCount = eventRepository.countEventsByStatus(EventStatus.COMPLETED.toString());
                completedEvents = completedEventsCount != null ? completedEventsCount : 0;
            } catch (Exception e) {
                log.warn("Error counting COMPLETED events: {}", e.getMessage());
            }
            
            Map<String, Long> usersByRole = Arrays.stream(Role.values())
                .collect(Collectors.toMap(
                    Role::name,
                    role -> userRepository.countByRole(role)
                ));
            
            Map<String, Long> organizationsByStatus = Map.of(
                "PENDING", organizationRepository.countByVerifiedFalse(),
                "VERIFIED", organizationRepository.countByVerifiedTrue()
            );
            
            // Create a map for event statuses with more robust error handling
            Map<String, Long> eventsByStatus = new HashMap<>();
            for (EventStatus status : EventStatus.values()) {
                try {
                    Long count = eventRepository.countEventsByStatus(status.toString());
                    eventsByStatus.put(status.name(), count != null ? count : 0L);
                } catch (Exception e) {
                    log.warn("Error counting events with status {}: {}", status, e.getMessage());
                    eventsByStatus.put(status.name(), 0L);
                }
            }
            
            List<CategoryCount> categoryCounts = null;
            Map<String, Long> eventsByCategory = new HashMap<>();
            
            try {
                categoryCounts = eventRepository.countByCategory();
                if (categoryCounts != null) {
                    eventsByCategory = categoryCounts.stream()
                        .filter(cat -> cat != null && cat.getId() != null && cat.getCount() != null)
                        .collect(Collectors.toMap(
                            CategoryCount::getId,
                            CategoryCount::getCount,
                            (existing, replacement) -> existing,
                            HashMap::new
                        ));
                }
            } catch (Exception e) {
                log.warn("Error counting events by category: {}", e.getMessage());
            }
            
            // Get user registrations by month (last 12 months)
            LocalDateTime startDate = LocalDateTime.now().minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            Map<String, Long> userRegistrationsByMonth = getUserRegistrationsByMonth(startDate);
            
            // Get event creations by month (last 12 months)
            Map<String, Long> eventCreationsByMonth = getEventCreationsByMonth(startDate);
            
            return AdminStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalOrganizations(totalOrganizations)
                .totalEvents(totalEvents)
                .totalVolunteers(totalVolunteers)
                .pendingOrganizations(pendingOrganizations)
                .activeEvents(activeEvents)
                .completedEvents(completedEvents)
                .usersByRole(usersByRole)
                .organizationsByStatus(organizationsByStatus)
                .eventsByStatus(eventsByStatus)
                .eventsByCategory(eventsByCategory)
                .userRegistrationsByMonth(userRegistrationsByMonth)
                .eventCreationsByMonth(eventCreationsByMonth)
                .build();
        } catch (Exception e) {
            log.error("Error generating admin statistics dashboard", e);
            throw new RuntimeException("Error generating admin statistics", e);
        }
    }

    private Map<String, Long> getUserRegistrationsByMonth(LocalDateTime startDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> userRegistrationsByMonth = new LinkedHashMap<>();
        
        // Initialize all months with zero counts
        LocalDateTime current = startDate;
        while (current.isBefore(LocalDateTime.now()) || current.getMonth() == LocalDateTime.now().getMonth()) {
            userRegistrationsByMonth.put(current.format(formatter), 0L);
            current = current.plusMonths(1);
        }
        
        // Since we don't have the specific repository method, we'll use a simplified approach
        List<User> users = userRepository.findAll();
        for (User user : users) {
            LocalDateTime createdAt = user.getCreatedAt();
            if (createdAt != null && (createdAt.isAfter(startDate) || createdAt.isEqual(startDate))) {
                String month = createdAt.format(formatter);
                if (userRegistrationsByMonth.containsKey(month)) {
                    userRegistrationsByMonth.put(month, userRegistrationsByMonth.get(month) + 1);
                }
            }
        }
        
        return userRegistrationsByMonth;
    }

    private Map<String, Long> getEventCreationsByMonth(LocalDateTime startDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> eventCreationsByMonth = new LinkedHashMap<>();
        
        // Initialize all months with zero counts
        LocalDateTime current = startDate;
        while (current.isBefore(LocalDateTime.now()) || current.getMonth() == LocalDateTime.now().getMonth()) {
            eventCreationsByMonth.put(current.format(formatter), 0L);
            current = current.plusMonths(1);
        }
        
        // Since we don't have the specific repository method, we'll use a simplified approach
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            LocalDateTime createdAt = event.getCreatedAt();
            if (createdAt != null && (createdAt.isAfter(startDate) || createdAt.isEqual(startDate))) {
                String month = createdAt.format(formatter);
                if (eventCreationsByMonth.containsKey(month)) {
                    eventCreationsByMonth.put(month, eventCreationsByMonth.get(month) + 1);
                }
            }
        }
        
        return eventCreationsByMonth;
    }
} 