package com.fill_rouge.backend.service.event.impl;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.EventRegistrationRequest;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventResponse;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.mapper.EventMapper;
import com.fill_rouge.backend.repository.EventFeedbackRepository;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.service.event.EventParticipationService;
import com.fill_rouge.backend.service.event.EventService;
import com.fill_rouge.backend.service.user.UserService;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventFeedbackRepository eventFeedbackRepository;
    private final UserService userService;
    private final EventMapper eventMapper;
    private final EventParticipationService participationService;
    private final VolunteerProfileService volunteerProfileService;

    @Override
    public List<Event> getEventsByParticipant(String userId) {
        log.info("Fetching events for participant {}", userId);
        return eventRepository.findByRegisteredParticipantsContaining(userId);
    }

    @Override
    public List<Event> getEventsByWaitlistedParticipant(String userId) {
        log.info("Fetching waitlisted events for participant {}", userId);
        return eventRepository.findByWaitlistedParticipantsContaining(userId);
    }

    @Override
    public Page<Event> getUpcomingEvents(Pageable pageable) {
        log.info("Fetching upcoming events with pagination {}", pageable);
        return eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
            LocalDateTime.now(),
            EventStatus.ACTIVE,
            pageable
        );
    }

    @Override
    public Page<Event> searchEvents(String query, Pageable pageable) {
        log.info("Searching events with query '{}' and pagination {}", query, pageable);
        return eventRepository.findByTitleContainingIgnoreCase(query, pageable);
    }

    @Override
    public boolean isEventFull(String eventId) {
        log.info("Checking if event {} is full", eventId);
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        return event.getRegisteredParticipants().size() >= event.getMaxParticipants();
    }

    @Override
    public Event updateEvent(String eventId, EventRequest request) {
        log.info("Updating event with ID {}", eventId);
        try {
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
            
            // Validate dates
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new IllegalArgumentException("End date must be after start date");
            }
            
            // Save original status
            EventStatus originalStatus = event.getStatus();
            
            // Use the mapper to update all fields consistently
            eventMapper.updateEntity(request, event);
            
            // If status was ACTIVE or PENDING, recalculate based on dates
            if (EventStatus.ACTIVE.equals(originalStatus) || EventStatus.PENDING.equals(originalStatus)) {
                event.setStatus(determineEventStatus(event));
            } else {
                // Keep the original status for events that were cancelled, rejected, etc.
                event.setStatus(originalStatus);
            }
            
            // Set the updated timestamp
            event.setUpdatedAt(LocalDateTime.now());
            
            // Save and return the updated event
            return eventRepository.save(event);
            
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error updating event: " + e.getMessage(), e);
        }
    }

    @Override
    public EventStatisticsResponse getEventStatistics(String eventId) {
        log.info("Getting statistics for event {}", eventId);
        try {
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            
            // Get basic counts
            int participantCount = event.getRegisteredParticipants().size();
            
            // Calculate total hours based on event duration
            int totalHours = 0;
            if (event.getStartDate() != null && event.getEndDate() != null) {
                totalHours = (int) java.time.Duration.between(event.getStartDate(), event.getEndDate()).toHours() * participantCount;
            }
            
            // Get average rating from feedback
            List<EventFeedback> feedbacks = eventFeedbackRepository.findByEventId(eventId, Pageable.unpaged()).getContent();
            double averageRating = feedbacks.stream()
                .mapToDouble(EventFeedback::getRating)
                .average()
                .orElse(0.0);
            
            // Calculate success rate (completed vs registered)
            double successRate = event.getStatus() == EventStatus.COMPLETED ? 100.0 : 0.0;

            return EventStatisticsResponse.builder()
                .participantCount(participantCount)
                .totalVolunteerHours(totalHours)
                .averageRating(averageRating)
                .successRate(successRate)
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get event statistics", e);
        }
    }

    @Override
    public double getAverageRating(String eventId) {
        log.info("Calculating average rating for event {}", eventId);
        List<EventFeedback> feedbacks = eventFeedbackRepository.findByEventId(eventId, Pageable.unpaged()).getContent();
        return feedbacks.stream()
            .mapToDouble(EventFeedback::getRating)
            .average()
            .orElse(0.0);
    }

    @Override
    public double calculateEventSuccessRate(String eventId) {
        log.info("Calculating success rate for event {}", eventId);
        Event event = getEventById(eventId);
        return event.getStatus() == EventStatus.COMPLETED ? 100.0 : 0.0;
    }

    @Override
    public Event unregisterParticipant(String eventId, String userId) {
        log.info("Unregistering participant {} from event {}", userId, eventId);
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        event.getRegisteredParticipants().remove(userId);
        return eventRepository.save(event);
    }

    @Override
    public long getParticipantCount(String eventId) {
        log.info("Getting participant count for event {}", eventId);
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        return event.getRegisteredParticipants().size();
    }

    @Override
    public boolean hasVolunteerSubmittedFeedback(String eventId, String volunteerId) {
        log.info("Checking if volunteer {} has submitted feedback for event {}", volunteerId, eventId);
        return eventRepository.findEventWithFeedback(eventId, volunteerId).isPresent();
    }

    @Override
    public Page<Event> getEventsBySkills(List<String> skills, Pageable pageable) {
        log.info("Finding events by skills {} with pagination {}", skills, pageable);
        return eventRepository.findByRequiredSkills(skills, pageable);
    }

    @Override
    public Page<Event> getEventsByCategory(String category, Pageable pageable) {
        log.info("Finding events by category {} with pagination {}", category, pageable);
        return eventRepository.findByCategory(EventCategory.valueOf(category.toUpperCase()), pageable);
    }

    @Override
    public Page<Event> getNearbyEvents(double[] coordinates, double maxDistance, Pageable pageable) {
        log.info("Finding nearby events within {} distance from coordinates {}", maxDistance, coordinates);
        return eventRepository.findNearbyEvents(coordinates, maxDistance, pageable);
    }

    @Override
    public EventFeedback submitFeedback(String eventId, String volunteerId, EventFeedback feedback) {
        log.info("Submitting feedback for event {} from volunteer {}", eventId, volunteerId);
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        feedback.setEventId(eventId);
        feedback.setVolunteerId(volunteerId);
        return eventFeedbackRepository.save(feedback);
    }

    @Override
    public Event updateEventStatus(String eventId, EventStatus status) {
        log.info("Updating status of event {} to {}", eventId, status);
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        event.setStatus(status);
        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public Event registerParticipant(String eventId, String userId) {
        log.info("Registering participant {} for event {}", userId, eventId);
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
            
        // Check if the user is already registered
        if (event.getRegisteredParticipants().contains(userId)) {
            log.info("User {} is already registered for event {}", userId, eventId);
            return event; // Return the event without making changes
        }
        
        // Check if the event is cancelled or completed
        if (EventStatus.CANCELLED.equals(event.getStatus()) || EventStatus.COMPLETED.equals(event.getStatus())) {
            throw new IllegalStateException("Cannot register for event with status: " + event.getStatus());
        }
        
        // Synchronize on the event ID to prevent race conditions
        synchronized (eventId.intern()) {
            // Re-fetch the event to get the latest state within the synchronized block
            event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
                
            // Check if the event is full now
            boolean isFull = event.getRegisteredParticipants().size() >= event.getMaxParticipants();
            
            if (isFull) {
                // Add to waitlist if event is full and waitlist is enabled
                if (event.isWaitlistEnabled()) {
                    // Check if the user is already on the waitlist
                    if (!event.getWaitlistedParticipants().contains(userId)) {
                        event.getWaitlistedParticipants().add(userId);
                        log.info("Event {} is full, adding participant {} to waitlist", eventId, userId);
                    }
                } else {
                    throw new IllegalStateException("Event is full and waitlist is not enabled");
                }
            } else {
                // Add to registered participants
                event.getRegisteredParticipants().add(userId);
                log.info("Successfully registered participant {} for event {}", userId, eventId);
                
                // Check if the event is now full and update the status if necessary
                if (event.getRegisteredParticipants().size() >= event.getMaxParticipants()) {
                    log.info("Event {} is now full, updating status", eventId);
                    if (EventStatus.ACTIVE.equals(event.getStatus())) {
                        event.setStatus(EventStatus.FULL);
                    }
                }
            }
            
            return eventRepository.save(event);
        }
    }

    @Override
    @Transactional
    public Event registerParticipantWithDetails(String eventId, String email, EventRegistrationRequest registrationData) {
        log.info("Registering participant with details for event {}", eventId);
        
        if (registrationData == null) {
            throw new IllegalArgumentException("Registration data cannot be null");
        }
        
        // Validate registration data
        if (!registrationData.isTermsAccepted()) {
            throw new IllegalArgumentException("Terms and conditions must be accepted");
        }
        
        // If userId is provided, retrieve user information from database
        if (registrationData.getUserId() != null && !registrationData.getUserId().isEmpty()) {
            try {
                User user = userService.getUserById(registrationData.getUserId());
                // If email is null, use the user's email
                if (email == null || email.isEmpty()) {
                    email = user.getEmail();
                    log.info("Using email from user profile: {}", email);
                }
            } catch (Exception e) {
                log.error("Error retrieving user data: {}", e.getMessage());
                if (email == null) {
                    throw new IllegalArgumentException("Email is required for registration");
                }
            }
        } else if (email == null || email.isEmpty()) {
            // For guest registrations, email is required
            throw new IllegalArgumentException("Email is required for guest registration");
        }
        
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
            
        // Check if the event is cancelled or completed
        if (EventStatus.CANCELLED.equals(event.getStatus()) || EventStatus.COMPLETED.equals(event.getStatus())) {
            throw new IllegalStateException("Cannot register for event with status: " + event.getStatus());
        }
        
        // Synchronize on the event ID to prevent race conditions
        synchronized (eventId.intern()) {
            // Re-fetch the event to get the latest state within the synchronized block
            event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
            
            // Check if the event is full
            boolean isFull = event.getRegisteredParticipants().size() >= event.getMaxParticipants();
            
            // If user ID is provided, register the user with details
            if (registrationData.getUserId() != null && !registrationData.getUserId().isEmpty()) {
                // Check if the user is already registered
                if (event.getRegisteredParticipants().contains(registrationData.getUserId())) {
                    log.info("User {} is already registered for event {}", registrationData.getUserId(), eventId);
                    return event; // Return the event without making changes
                }
                
                if (isFull) {
                    // Add to waitlist if event is full and waitlist is enabled
                    if (event.isWaitlistEnabled()) {
                        // Check if the user is already on the waitlist
                        if (!event.getWaitlistedParticipants().contains(registrationData.getUserId())) {
                            event.getWaitlistedParticipants().add(registrationData.getUserId());
                            log.info("Event {} is full, adding participant {} to waitlist", eventId, registrationData.getUserId());
                            
                            // Register with participation service for waitlist
                            try {
                                // Validate user exists
                                userService.getUserById(registrationData.getUserId());
                                
                                // Use the participation service to register with details and waitlist status
                                participationService.registerForEventWithDetailsAndStatus(
                                    registrationData.getUserId(), 
                                    eventId, 
                                    registrationData.getSpecialRequirements(),
                                    registrationData.getNotes(),
                                    "WAITLISTED"
                                );
                            } catch (Exception e) {
                                // Rollback changes if participation registration fails
                                event.getWaitlistedParticipants().remove(registrationData.getUserId());
                                throw new RuntimeException("Error registering user: " + e.getMessage());
                            }
                        }
                    } else {
                        throw new IllegalStateException("Event is full and waitlist is not enabled");
                    }
                } else {
                    // Add to registered participants
                    event.getRegisteredParticipants().add(registrationData.getUserId());
                    log.info("Successfully registered participant {} for event {}", registrationData.getUserId(), eventId);
                    
                    // Register with participation service
                    try {
                        // Validate user exists
                        userService.getUserById(registrationData.getUserId());
                        
                        // Use the participation service to register with details
                        participationService.registerForEventWithDetailsAndStatus(
                            registrationData.getUserId(), 
                            eventId, 
                            registrationData.getSpecialRequirements(),
                            registrationData.getNotes(),
                            "REGISTERED"
                        );
                    } catch (Exception e) {
                        // Rollback changes if participation registration fails
                        event.getRegisteredParticipants().remove(registrationData.getUserId());
                        throw new RuntimeException("Error registering user: " + e.getMessage());
                    }
                    
                    // Check if the event is now full and update the status if necessary
                    if (event.getRegisteredParticipants().size() >= event.getMaxParticipants()) {
                        log.info("Event {} is now full, updating status", eventId);
                        if (EventStatus.ACTIVE.equals(event.getStatus())) {
                            event.setStatus(EventStatus.FULL);
                        }
                    }
                }
            } else {
                // For guest registrations (no user account)
                if (isFull) {
                    throw new IllegalStateException("Event is full. Guest registration is not available for full events.");
                }
                
                // Verify that the email is not already registered
                if (event.getGuestParticipantEmails().contains(email)) {
                    throw new IllegalStateException("This email is already registered for the event");
                }
                
                // Store the guest email to track the registration
                event.getGuestParticipantEmails().add(email);
                log.info("Successfully registered guest with email {} for event {}", email, eventId);
            }
            
            return eventRepository.save(event);
        }
    }

    @Override
    public Page<Event> getEventsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        log.info("Finding events between {} and {} with pagination {}", start, end, pageable);
        return eventRepository.findByStartDateBetween(start, end, pageable);
    }

    @Override
    public void deleteEvent(String eventId) {
        log.info("Deleting event {}", eventId);
        eventRepository.deleteById(eventId);
    }

    @Override
    public Page<Event> getEventsByOrganization(String organizationId, Pageable pageable) {
        log.info("Fetching events for organization {} with pagination {}", organizationId, pageable);
        List<Event> eventsList = eventRepository.findByOrganizationId(organizationId, pageable);
        
        // Update statuses for all retrieved events
        eventsList.forEach(this::updateEventStatusIfNeeded);
        
        return new PageImpl<>(eventsList, pageable, eventsList.size());
    }

    @Override
    public int getTotalVolunteerHours(String eventId) {
        log.info("Calculating total volunteer hours for event {}", eventId);
        Event event = getEventById(eventId);
        int participantCount = event.getRegisteredParticipants().size();
        
        if (event.getStartDate() != null && event.getEndDate() != null) {
            return (int) java.time.Duration.between(event.getStartDate(), event.getEndDate()).toHours() * participantCount;
        }
        
        return 0;
    }

    @Override
    public Event getEventById(String eventId) {
        log.info("Fetching event with ID {}", eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        
        // Check and update status instantly based on current time
        updateEventStatusIfNeeded(event);
        
        return event;
    }

    /**
     * Check and update event status if needed based on current time and participants
     * This method instantly updates status without waiting for scheduled tasks
     */
    private void updateEventStatusIfNeeded(Event event) {
        boolean statusChanged = false;
        LocalDateTime now = LocalDateTime.now();
        EventStatus currentStatus = event.getStatus();
        
        // Don't update status for PENDING or REJECTED events
        if (EventStatus.PENDING.equals(currentStatus) || 
            EventStatus.REJECTED.equals(currentStatus)) {
            return;
        }
        
        // Check if ACTIVE event should be ONGOING (started)
        if (EventStatus.ACTIVE.equals(currentStatus) && now.isAfter(event.getStartDate())) {
            log.info("Instant status update: Event {} changing from ACTIVE to ONGOING", event.getId());
            event.setStatus(EventStatus.ONGOING);
            statusChanged = true;
        }
        
        // Check if ONGOING event should be COMPLETED (ended)
        if (EventStatus.ONGOING.equals(currentStatus) && now.isAfter(event.getEndDate())) {
            log.info("Instant status update: Event {} changing from ONGOING to COMPLETED", event.getId());
            event.setStatus(EventStatus.COMPLETED);
            statusChanged = true;
        }
        
        if (statusChanged) {
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.save(event);
        }
    }

    @Override
    public Event createEvent(EventRequest request, String organizationId) {
        log.info("Creating new event for organization {}", organizationId);
        Event event = eventMapper.toEntity(request);
        event.setOrganizationId(organizationId);
        
        // Set status based on the request
        if (event.getStatus() == null) {
            log.info("No status specified in the request, defaulting to PENDING");
            event.setStatus(EventStatus.PENDING);
        } else {
            log.info("Using status from request: {}", event.getStatus());
            // Only allow PENDING as initial status
            if (!event.getStatus().equals(EventStatus.PENDING)) {
                log.warn("Invalid initial status: {}, defaulting to PENDING", event.getStatus());
                event.setStatus(EventStatus.PENDING);
            }
        }
        
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    @Override
    public Page<Event> getAllEvents(Pageable pageable) {
        log.info("Fetching all events with pagination {}", pageable);
        Page<Event> events = eventRepository.findAll(pageable);
        
        // Update statuses for all retrieved events
        events.getContent().forEach(this::updateEventStatusIfNeeded);
        
        return events;
    }

    @Override
    public Page<EventFeedback> getEventFeedbacks(String eventId, Pageable pageable) {
        log.info("Fetching feedback for event {} with pagination {}", eventId, pageable);
        return eventFeedbackRepository.findByEventId(eventId, pageable);
    }

    @Override
    public Page<Event> getAllEventsForAdmin(Pageable pageable) {
        log.info("Fetching all events for admin with pagination {}", pageable);
        return eventRepository.findAll(pageable);
    }

    @Override
    public Page<EventResponse> getAllEvents(Pageable pageable, boolean includeAll) {
        log.info("Fetching events with pagination {} and includeAll={}", pageable, includeAll);
        Page<Event> events;
        if (includeAll) {
            events = eventRepository.findAll(pageable);
        } else {
            events = eventRepository.findByStatus(EventStatus.ACTIVE, pageable);
        }
        return events.map(event -> eventMapper.toResponse(event, null));
    }

    @Override
    public Page<Event> getPublicEvents(Pageable pageable) {
        log.info("Fetching all public events with pagination {}", pageable);
        return eventRepository.findByStatusIn(
            List.of(EventStatus.ACTIVE, EventStatus.ONGOING), 
            pageable
        );
    }

    @Override
    public List<EventResponse> getUpcomingEvents() {
        log.info("Fetching upcoming events list");
        Page<Event> upcomingEvents = getUpcomingEvents(Pageable.ofSize(10));
        return upcomingEvents.getContent().stream()
                .map(event -> eventMapper.toResponse(event, null))
                .collect(Collectors.toList());
    }

    @Override
    public EventResponse getEventResponseById(String id) {
        log.info("Getting event response for ID {}", id);
        Event event = getEventById(id);
        return eventMapper.toResponse(event, null);
    }

    @Override
    public EventResponse createEvent(EventRequest request) {
        log.info("Creating event from request without organization ID");
        // In a real implementation, you would get the organization ID from security context
        String organizationId = "default-org"; // Replace with actual logic to get current organization
        Event event = createEvent(request, organizationId);
        return eventMapper.toResponse(event, null);
    }

    @Override
    public EventResponse approveEvent(String eventId) {
        log.info("Approving event with ID: {}", eventId);
        Event event = getEventById(eventId);
        
        // Only allow approval of PENDING or REJECTED events
        if (!EventStatus.PENDING.equals(event.getStatus()) && !EventStatus.REJECTED.equals(event.getStatus())) {
            throw new IllegalStateException("Only PENDING or REJECTED events can be approved. Current status: " + event.getStatus());
        }
        
        event.setStatus(EventStatus.ACTIVE);
        event.setUpdatedAt(LocalDateTime.now());
        Event updatedEvent = eventRepository.save(event);
        return eventMapper.toResponse(updatedEvent, null);
    }
    
    @Override
    public EventResponse rejectEvent(String eventId, String reason) {
        log.info("Rejecting event with id: {}, reason: {}", eventId, reason);
        Event event = getEventById(eventId);
        
        // Only allow rejection of PENDING events
        if (!EventStatus.PENDING.equals(event.getStatus())) {
            throw new IllegalStateException("Only PENDING events can be rejected. Current status: " + event.getStatus());
        }
        
        event.setStatus(EventStatus.REJECTED);
        event.setUpdatedAt(LocalDateTime.now());
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent, null);
    }

    /**
     * Determines the appropriate event status based on its current state and dates
     * @param event The event to evaluate
     * @return The appropriate EventStatus
     */
    private EventStatus determineEventStatus(Event event) {
        LocalDateTime now = LocalDateTime.now();
        EventStatus currentStatus = event.getStatus();
        
        // If event is explicitly cancelled or rejected, keep that status
        if (EventStatus.CANCELLED.equals(currentStatus) || EventStatus.REJECTED.equals(currentStatus)) {
            return currentStatus;
        }

        // If event is approved (ACTIVE) but hasn't started yet
        if (EventStatus.ACTIVE.equals(currentStatus) && event.getStartDate().isAfter(now)) {
            return EventStatus.ACTIVE;
        }
        
        // If event is currently happening
        if ((EventStatus.ACTIVE.equals(currentStatus) || EventStatus.ONGOING.equals(currentStatus)) 
                && now.isAfter(event.getStartDate()) && now.isBefore(event.getEndDate())) {
            return EventStatus.ONGOING;
        }
        
        // If event has ended
        if (now.isAfter(event.getEndDate()) && !EventStatus.COMPLETED.equals(currentStatus)) {
            return EventStatus.COMPLETED;
        }
        
        // If event is at max capacity
        if (EventStatus.ACTIVE.equals(currentStatus) 
                && event.getRegisteredParticipants().size() >= event.getMaxParticipants()) {
            return EventStatus.FULL;
        }
        
        // Default: keep current status
        return currentStatus;
    }

    /**
     * Updates the status of events based on their date and time
     * This should be called by a scheduled task
     */
    @Override
    @Transactional
    public void updateEventStatuses() {
        log.info("Updating event statuses automatically");
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Update ACTIVE events to ONGOING once they've started
        List<Event> activeEvents = eventRepository.findByStatusAndStartDateBefore(
                EventStatus.ACTIVE.toString(), now);
        for (Event event : activeEvents) {
            log.info("Updating event {} status from ACTIVE to ONGOING", event.getId());
            event.setStatus(EventStatus.ONGOING);
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.save(event);
        }
        
        // 2. Update ONGOING events to COMPLETED once they've ended
        List<Event> ongoingEvents = eventRepository.findByStatusAndEndDateBefore(
                EventStatus.ONGOING.toString(), now);
        for (Event event : ongoingEvents) {
            log.info("Updating event {} status from ONGOING to COMPLETED", event.getId());
            event.setStatus(EventStatus.COMPLETED);
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.save(event);
        }
        
        // 3. Mark ACTIVE events as FULL if they've reached maximum capacity
        Page<Event> activePage = eventRepository.findByStatus(EventStatus.ACTIVE, Pageable.unpaged());
        List<Event> allActiveEvents = activePage.getContent();
        for (Event event : allActiveEvents) {
            if (event.getRegisteredParticipants().size() >= event.getMaxParticipants()) {
                log.info("Updating event {} status from ACTIVE to FULL", event.getId());
                event.setStatus(EventStatus.FULL);
                event.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event);
            }
        }
        
        // 4. Check FULL events that had cancellations and are no longer full
        Page<Event> fullPage = eventRepository.findByStatus(EventStatus.FULL, Pageable.unpaged());
        List<Event> fullEvents = fullPage.getContent();
        for (Event event : fullEvents) {
            if (event.getRegisteredParticipants().size() < event.getMaxParticipants()) {
                log.info("Updating event {} status from FULL back to ACTIVE", event.getId());
                event.setStatus(EventStatus.ACTIVE);
                event.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event);
            }
        }
        
        // 5. Update events that were PENDING for too long (optional warning)
        List<Event> pendingEvents = eventRepository.findByStatusAndStartDateBefore(
                EventStatus.PENDING.toString(), now.plusDays(1));
        for (Event event : pendingEvents) {
            log.warn("Event {} is PENDING but start date is approaching in less than 24 hours", event.getId());
            // No automatic approval - admin must manually approve
        }
    }

    /**
     * Helper method to check if a string is null or empty
     */
    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
} 