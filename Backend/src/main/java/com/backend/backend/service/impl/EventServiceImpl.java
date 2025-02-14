package com.backend.backend.service.impl;

import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.EventStatsResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.model.Event;
import com.backend.backend.model.EventStatus;
import com.backend.backend.model.RegistrationStatus;
import com.backend.backend.model.User;
import com.backend.backend.model.UserRole;
import com.backend.backend.model.EventRegistration;
import com.backend.backend.mapper.EventMapper;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.service.interfaces.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Set;
import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventMapper eventMapper;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Override
    public EventResponse createEvent(EventRequest request, String organizationId) {
        Event event = eventMapper.toEntity(request);
        event.setOrganizationId(organizationId);
        event.setStatus(EventStatus.DRAFT);
        event.setActive(true);
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(String id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        Event oldEvent = new Event();
        // Copy old values for comparison
        eventMapper.updateEventFromRequest(request, oldEvent);
        
        // Update event
        eventMapper.updateEventFromRequest(request, event);
        Event updatedEvent = eventRepository.save(event);
        
        // Notify participants if there are significant changes
        notifyParticipantsOfChanges(event, oldEvent);
        
        return eventMapper.toResponse(updatedEvent);
    }

    @Override
    public void deleteEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        // Notify participants of cancellation
        notifyEventParticipants(id, "Event has been cancelled");
        
        eventRepository.deleteById(id);
    }

    @Override
    public EventResponse getEvent(String id) {
        return eventRepository.findById(id)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(eventMapper::toResponse);
    }

    @Override
    public EventResponse publishEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        event.setStatus(EventStatus.PUBLISHED);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse cancelEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        event.setStatus(EventStatus.CANCELLED);
        event.setActive(false);
        
        // Notify participants
        notifyEventParticipants(id, "Event has been cancelled");
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse postponeEvent(String id, LocalDateTime newDateTime) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        LocalDateTime oldDateTime = event.getStartDate();
        event.setStartDate(newDateTime);
        event.setEndDate(newDateTime.plusHours(event.getEndDate().getHour() - event.getStartDate().getHour()));
        
        Event updatedEvent = eventRepository.save(event);
        
        // Notify participants
        Map<String, String> changes = Map.of(
            "Original Date", oldDateTime.format(DATE_FORMATTER),
            "New Date", newDateTime.format(DATE_FORMATTER)
        );
        notifyParticipantsOfChanges(event, changes);
        
        return eventMapper.toResponse(updatedEvent);
    }

    @Override
    public void registerVolunteer(String eventId, String volunteerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        if (!event.isActive() || event.getStatus() != EventStatus.PUBLISHED) {
            throw new CustomException("Event is not available for registration", HttpStatus.BAD_REQUEST);
        }
        
        if (registrationRepository.existsByEventIdAndVolunteerId(eventId, volunteerId)) {
            throw new CustomException("Already registered for this event", HttpStatus.BAD_REQUEST);
        }
        
        // Registration logic is handled by EventRegistrationService
    }

    @Override
    public void unregisterVolunteer(String eventId, String volunteerId) {
        if (!registrationRepository.existsByEventIdAndVolunteerId(eventId, volunteerId)) {
            throw new CustomException("Not registered for this event", HttpStatus.BAD_REQUEST);
        }
        
        // Unregistration logic is handled by EventRegistrationService
    }

    @Override
    public List<EventResponse> getVolunteerEvents(String volunteerId, boolean includeHistory) {
        LocalDateTime cutoffDate = includeHistory ? null : LocalDateTime.now();
        return eventRepository.findAll().stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED &&
                        (includeHistory || event.getStartDate().isAfter(LocalDateTime.now())) &&
                        registrationRepository.existsByEventIdAndVolunteerId(event.getId(), volunteerId))
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public List<EventResponse> getOrganizationEvents(String organizationId, boolean includeHistory) {
        LocalDateTime cutoffDate = includeHistory ? null : LocalDateTime.now();
        return eventRepository.findByOrganizationId(organizationId).stream()
                .filter(event -> includeHistory || event.getStartDate().isAfter(LocalDateTime.now()))
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public Page<EventResponse> searchEvents(
            String searchQuery,
            List<String> categories,
            String location,
            Double radius,
            List<EventStatus> status,
            Boolean pendingApproval,
            Boolean isDraft,
            Boolean isOwner,
            Boolean hasRegistrations,
            Boolean isRegistered,
            Boolean skillMatch,
            Boolean availableSpots,
            Boolean registrationOpen,
            String userId,
            Pageable pageable) {

        try {
            // Build the criteria based on parameters
            Criteria criteria = new Criteria();

            // Common search criteria
            if (StringUtils.hasText(searchQuery)) {
                criteria.orOperator(
                    Criteria.where("title").regex(searchQuery, "i"),
                    Criteria.where("description").regex(searchQuery, "i")
                );
            }

            if (categories != null && !categories.isEmpty()) {
                criteria.and("category").in(categories);
            }

            if (StringUtils.hasText(location)) {
                // Implement location-based search using coordinates
                // This is a simplified version - you might want to use geospatial queries
                criteria.and("location").regex(location, "i");
            }

            // Handle authenticated vs unauthenticated users
            if (userId != null) {
                // Get user information if userId is provided (userId is actually the email)
                User user = userRepository.findByEmail(userId)
                        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

                // Role-specific criteria
                UserRole userRole = user.getRole();
                switch (userRole) {
                    case ADMIN:
                        // Admin can see all events by default
                        if (status != null && !status.isEmpty()) {
                            criteria.and("status").in(status);
                        }
                        if (Boolean.TRUE.equals(pendingApproval)) {
                            criteria.and("requiresApproval").is(true)
                                  .and("approved").is(false);
                        }
                        break;

                    case ORGANIZATION:
                        // Organization-specific filters
                        if (Boolean.TRUE.equals(isOwner)) {
                            criteria.and("organizationId").is(user.getId());
                        }
                        if (Boolean.TRUE.equals(isDraft)) {
                            criteria.and("status").is(EventStatus.DRAFT);
                        } else if (status != null && !status.isEmpty()) {
                            criteria.and("status").in(status);
                        }
                        break;

                    case VOLUNTEER:
                        // Volunteer-specific filters
                        if (Boolean.TRUE.equals(isRegistered)) {
                            List<String> registeredEventIds = registrationRepository
                                .findByVolunteerIdAndStatusIn(
                                    user.getId(),
                                    List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
                                )
                                .stream()
                                .map(EventRegistration::getEventId)
                                .collect(Collectors.toList());
                            if (!registeredEventIds.isEmpty()) {
                                criteria.and("id").in(registeredEventIds);
                            }
                        } else {
                            // By default, volunteers see published events
                            criteria.and("status").is(EventStatus.PUBLISHED);
                        }
                        
                        if (Boolean.TRUE.equals(availableSpots)) {
                            criteria.and("maxParticipants").gt(0);
                        }
                        
                        if (Boolean.TRUE.equals(registrationOpen)) {
                            criteria.and("registrationDeadline").gt(LocalDateTime.now());
                        }
                        break;
                }
            } else {
                // For unauthenticated users, show only published events
                criteria.and("status").is(EventStatus.PUBLISHED);
            }

            // Additional common filters
            if (Boolean.TRUE.equals(hasRegistrations)) {
                criteria.and("registrationCount").gt(0);
            }

            // Create the query
            Query mongoQuery = new Query(criteria).with(pageable);

            // Execute the query
            List<Event> events = mongoTemplate.find(mongoQuery, Event.class);
            long total = mongoTemplate.count(Query.query(criteria), Event.class);

            // Map to response DTOs and add registration information if user is authenticated
            List<EventResponse> eventResponses = events.stream()
                .map(event -> {
                    EventResponse response = eventMapper.toResponse(event);
                    
                    if (userId != null) {
                        // Check if user is registered for this event
                        if (Boolean.TRUE.equals(isRegistered)) {
                            boolean registered = registrationRepository
                                .existsByEventIdAndVolunteerIdAndStatusIn(
                                    event.getId(), 
                                    userId,
                                    List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
                                );
                            response.setRegistered(registered);
                        }

                        // Check registration count if needed
                        if (Boolean.TRUE.equals(hasRegistrations)) {
                            long registrationCount = registrationRepository
                                .countByEventIdAndStatusIn(
                                    event.getId(),
                                    List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
                                );
                            response.setRegistrationCount(registrationCount);
                        }
                    }
                    
                    return response;
                })
                .collect(Collectors.toList());

            return new PageImpl<>(eventResponses, pageable, total);

        } catch (Exception e) {
            throw new CustomException("Error searching events: " + e.getMessage(), 
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public List<EventResponse> getUpcomingEvents(int days) {
        LocalDateTime endDate = LocalDateTime.now().plusDays(days);
        return eventRepository.findByStartDateBetween(LocalDateTime.now(), endDate).stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public EventStatsResponse getEventStats(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        long totalRegistrations = registrationRepository.countByEventIdAndStatusIn(
            eventId, 
            List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING, RegistrationStatus.CANCELLED)
        );
        
        long confirmedRegistrations = registrationRepository.countByEventIdAndStatusIn(
            eventId,
            List.of(RegistrationStatus.CONFIRMED)
        );
        
        long canceledRegistrations = registrationRepository.countByEventIdAndStatusIn(
            eventId,
            List.of(RegistrationStatus.CANCELLED)
        );
        
        return EventStatsResponse.builder()
                .eventId(event.getId())
                .eventName(event.getTitle())
                .totalRegistrations((int) totalRegistrations)
                .confirmedAttendees((int) confirmedRegistrations)
                .canceledRegistrations((int) canceledRegistrations)
                .attendanceRate(totalRegistrations > 0 ? (double) confirmedRegistrations / totalRegistrations : 0)
                .build();
    }

    @Override
    public EventStatsResponse getOrganizationEventStats(String organizationId) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId);
        
        int totalEvents = events.size();
        int activeEvents = (int) events.stream()
                .filter(Event::isActive)
                .count();
        
        return EventStatsResponse.builder()
                .totalRegistrations(totalEvents)
                .confirmedAttendees(activeEvents)
                .build();
    }

    @Override
    @Scheduled(cron = "${app.event.reminder-schedule:0 0 8 * * ?}") // Default to 8 AM daily
    public void scheduleEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderThreshold = now.plusDays(1); // Send reminders for events within 24 hours
        
        eventRepository.findByStartDateBetween(now, reminderThreshold).stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                .forEach(event -> {
                    try {
                        notifyEventParticipants(event.getId(), 
                            "Reminder: Your event is scheduled for tomorrow");
                    } catch (Exception e) {
                        log.error("Failed to send reminder for event {}: {}", 
                            event.getId(), e.getMessage());
                    }
                });
    }

    @Override
    public void notifyEventParticipants(String eventId, String message) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        registrationRepository.findByEventId(eventId).stream()
                .filter(registration -> registration.getStatus() == RegistrationStatus.CONFIRMED)
                .forEach(registration -> {
                    try {
                        emailService.sendEventUpdate(
                            registration.getVolunteerId(),
                            event.getTitle(),
                            Map.of("Message", message)
                        );
                    } catch (Exception e) {
                        log.error("Failed to send notification to participant {} for event {}: {}", 
                            registration.getVolunteerId(), eventId, e.getMessage());
                    }
                });
    }

    private void notifyParticipantsOfChanges(Event event, Event oldEvent) {
        Map<String, String> changes = eventMapper.detectChanges(oldEvent, event);
        if (!changes.isEmpty()) {
            notifyParticipantsOfChanges(event, changes);
        }
    }

    private void notifyParticipantsOfChanges(Event event, Map<String, String> changes) {
        registrationRepository.findByEventId(event.getId()).stream()
                .filter(registration -> registration.getStatus() == RegistrationStatus.CONFIRMED)
                .forEach(registration -> {
                    try {
                        emailService.sendEventUpdate(
                            registration.getVolunteerId(),
                            event.getTitle(),
                            changes
                        );
                    } catch (Exception e) {
                        log.error("Failed to send update notification to participant {} for event {}: {}", 
                            registration.getVolunteerId(), event.getId(), e.getMessage());
                    }
                });
    }

    @Override
    public List<String> getCategories() {
        return Arrays.asList(
            "Education",
            "Environment",
            "Health",
            "Community",
            "Arts & Culture",
            "Sports",
            "Technology",
            "Social Services",
            "Animal Welfare",
            "Disaster Relief"
        );
    }
} 