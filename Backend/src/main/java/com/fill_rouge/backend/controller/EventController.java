package com.fill_rouge.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.domain.EventParticipation;
import com.fill_rouge.backend.dto.request.EventRegistrationRequest;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.request.FeedbackRequest;
import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.EventResponse;
import com.fill_rouge.backend.dto.response.FeedbackResponse;
import com.fill_rouge.backend.mapper.EventMapper;
import com.fill_rouge.backend.service.event.EventFeedbackService;
import com.fill_rouge.backend.service.event.EventParticipationService;
import com.fill_rouge.backend.service.event.EventService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Tag(name = "Event Management", description = "APIs for managing events and feedback")
public class EventController {
    
    private final EventService eventService;
    private final EventFeedbackService feedbackService;
    private final EventMapper eventMapper;
    private final EventParticipationService participationService;
    
    private static final Logger log = LoggerFactory.getLogger(EventController.class);
    
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Create a new event", description = "Create a new event for an organization")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest eventRequest,
            @RequestHeader("X-Organization-ID") String organizationId,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.createEvent(eventRequest, organizationId);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event created successfully"
        ));
    }
    
    @PutMapping("/{eventId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update an event", description = "Update an existing event's details")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable String eventId,
            @Valid @RequestBody EventRequest eventRequest,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.updateEvent(eventId, eventRequest);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event updated successfully"
        ));
    }
    
    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Delete an event", description = "Delete an existing event")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
    }
    
    @GetMapping("/public")
    @Operation(summary = "Get public events", description = "Get all publicly viewable events without authentication")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getPublicEvents(
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("Fetching public events with pagination: {}", pageable);
        Page<Event> eventPage = eventService.getPublicEvents(pageable);
        
        return createPagedResponse(eventPage, null); // Null user ID since this is public
    }
    
    @GetMapping("/{eventId}")
    @Operation(summary = "Get event details", description = "Get detailed information about an event")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(
            @PathVariable String eventId,
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        Event event = eventService.getEventById(eventId);
        return ResponseEntity.ok(ApiResponse.success(eventMapper.toResponse(event, userId)));
    }
    
    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get organization events", description = "Get all events for a specific organization")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByOrganization(
            @PathVariable String organizationId,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getEventsByOrganization(organizationId, pageable), userId);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search events", description = "Search events by query string")
    public ResponseEntity<ApiResponse<List<EventResponse>>> searchEvents(
            @RequestParam String query,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.searchEvents(query, pageable), userId);
    }
    
    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming events", description = "Get list of upcoming events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcomingEvents(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getUpcomingEvents(pageable), userId);
    }
    
    @GetMapping("/nearby")
    @Operation(summary = "Get nearby events", description = "Get events within specified distance from coordinates")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getNearbyEvents(
            @RequestParam double[] coordinates,
            @RequestParam(defaultValue = "5000") double maxDistance,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getNearbyEvents(coordinates, maxDistance, pageable), userId);
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Get events by category", description = "Get all events in a specific category")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByCategory(
            @PathVariable String category,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getEventsByCategory(category, pageable), userId);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get events by date range", description = "Get events within a specific date range")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getEventsByDateRange(start, end, pageable), userId);
    }
    
    @PostMapping("/{eventId}/register")
    @Operation(summary = "Register for event", description = "Register a user for an event with detailed information")
    public ResponseEntity<ApiResponse<EventResponse>> registerForEvent(
            @PathVariable String eventId,
            @Valid @RequestBody EventRegistrationRequest registrationRequest,
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        
        log.info("Registering for event: {} with data: {}", eventId, registrationRequest);
        
        // Set userId in request if provided in header
        if (userId != null && !userId.isEmpty() && (registrationRequest.getUserId() == null || registrationRequest.getUserId().isEmpty())) {
            registrationRequest.setUserId(userId);
        }
        
        // Validate required fields
        if (!registrationRequest.isTermsAccepted()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Terms and conditions must be accepted", HttpStatus.BAD_REQUEST)
            );
        }
        
        String email = registrationRequest.getEmail();
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Email is required", HttpStatus.BAD_REQUEST)
            );
        }
        
        try {
            Event event = eventService.registerParticipantWithDetails(eventId, email, registrationRequest);
            return ResponseEntity.ok(ApiResponse.success(
                eventMapper.toResponse(event, registrationRequest.getUserId()),
                "Successfully registered for event"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.unprocessableEntity().body(
                ApiResponse.error(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY)
            );
        } catch (Exception e) {
            log.error("Error registering for event: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to register for event: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }
    
    @DeleteMapping("/{eventId}/register")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Cancel registration", description = "Cancel a volunteer's registration for an event")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Cancelling registration for event: {} by user: {}", eventId, userId);
        
        try {
            // Remove from registered participants in event
            Event event = eventService.unregisterParticipant(eventId, userId);
            
            // Also cancel in the participation service if available
            try {
                participationService.cancelParticipation(userId, eventId);
            } catch (Exception e) {
                log.warn("Could not cancel participation record: {}", e.getMessage());
                // Continue even if participation record can't be cancelled
            }
            
            return ResponseEntity.ok(ApiResponse.success(null, "Registration cancelled successfully"));
        } catch (Exception e) {
            log.error("Error cancelling registration: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to cancel registration: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }
    
    @PostMapping("/{eventId}/waitlist")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Join waitlist", description = "Add a volunteer to the event waitlist")
    public ResponseEntity<ApiResponse<EventResponse>> joinWaitlist(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Adding user: {} to waitlist for event: {}", userId, eventId);
        
        try {
            Event event = eventService.getEventById(eventId);
            
            // Check if event is full and waitlist enabled
            if (event.getRegisteredParticipants().size() < event.getMaxParticipants()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Event is not full. Please register normally.", HttpStatus.BAD_REQUEST)
                );
            }
            
            if (!event.isWaitlistEnabled()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Waitlist is not enabled for this event.", HttpStatus.BAD_REQUEST)
                );
            }
            
            // Add to waitlisted participants
            if (!event.getWaitlistedParticipants().contains(userId)) {
                event.getWaitlistedParticipants().add(userId);
                event = eventService.updateEvent(eventId, eventMapper.toRequest(event));
                
                // Create a participation record with WAITLISTED status
                try {
                    participationService.registerForEventWithDetailsAndStatus(userId, eventId, null, null, "WAITLISTED");
                } catch (Exception e) {
                    log.warn("Could not create waitlist participation record: {}", e.getMessage());
                    // Continue even if participation record can't be created
                }
            }
            
            return ResponseEntity.ok(ApiResponse.success(
                eventMapper.toResponse(event, userId),
                "Successfully added to waitlist"
            ));
        } catch (Exception e) {
            log.error("Error joining waitlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to join waitlist: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }
    
    @DeleteMapping("/{eventId}/waitlist")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Leave waitlist", description = "Remove a volunteer from the event waitlist")
    public ResponseEntity<ApiResponse<Void>> leaveWaitlist(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Removing user: {} from waitlist for event: {}", userId, eventId);
        
        try {
            Event event = eventService.getEventById(eventId);
            
            // Remove from waitlisted participants
            if (event.getWaitlistedParticipants().contains(userId)) {
                event.getWaitlistedParticipants().remove(userId);
                eventService.updateEvent(eventId, eventMapper.toRequest(event));
                
                // Cancel the participation record
                try {
                    participationService.cancelParticipation(userId, eventId);
                } catch (Exception e) {
                    log.warn("Could not cancel waitlist participation record: {}", e.getMessage());
                    // Continue even if participation record can't be cancelled
                }
            }
            
            return ResponseEntity.ok(ApiResponse.success(null, "Successfully removed from waitlist"));
        } catch (Exception e) {
            log.error("Error leaving waitlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to leave waitlist: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }
    
    @GetMapping("/{eventId}/is-full")
    @Operation(summary = "Check if event is full", description = "Check if an event has reached its maximum capacity")
    public ResponseEntity<ApiResponse<Boolean>> isEventFull(@PathVariable String eventId) {
        return ResponseEntity.ok(ApiResponse.success(eventService.isEventFull(eventId)));
    }
    
    @GetMapping("/skills")
    @Operation(summary = "Get events by skills", description = "Get events that require specific skills")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsBySkills(
            @RequestParam List<String> skills,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getEventsBySkills(skills, pageable), userId);
    }
    
    @PatchMapping("/{eventId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve event", description = "Approve an event for publication")
    public ResponseEntity<ApiResponse<EventResponse>> approveEvent(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.updateEventStatus(eventId, EventStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event approved successfully"
        ));
    }
    
    @PatchMapping("/{eventId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject event", description = "Reject an event from being published")
    public ResponseEntity<ApiResponse<EventResponse>> rejectEvent(
            @PathVariable String eventId,
            @RequestParam(required = false) String reason,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.updateEventStatus(eventId, EventStatus.REJECTED);
        // If you have a field for rejection reason, you could set it here
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event rejected" + (reason != null ? ": " + reason : "")
        ));
    }
    
    @PatchMapping("/{eventId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZATION')")
    @Operation(summary = "Cancel event", description = "Cancel a scheduled event")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.updateEventStatus(eventId, EventStatus.FULL);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event cancelled successfully"
        ));
    }
    
    @PatchMapping("/{eventId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZATION')")
    @Operation(summary = "Complete event", description = "Mark an event as completed")
    public ResponseEntity<ApiResponse<EventResponse>> completeEvent(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.updateEventStatus(eventId, EventStatus.COMPLETED);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event marked as completed"
        ));
    }
    
    @PostMapping("/{eventId}/feedback")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Submit feedback", description = "Submit feedback for an event")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String volunteerId,
            @Valid @RequestBody FeedbackRequest request) {
        EventFeedback feedback = createFeedbackFromRequest(request);
        
        EventFeedback submittedFeedback = feedbackService.submitFeedback(eventId, volunteerId, feedback);
        return ResponseEntity.ok(ApiResponse.success(
            FeedbackResponse.builder()
                .id(submittedFeedback.getId())
                .eventId(submittedFeedback.getEventId())
                .volunteerId(submittedFeedback.getVolunteerId())
                .rating(submittedFeedback.getRating())
                .comment(submittedFeedback.getComment())
                .submittedAt(submittedFeedback.getSubmittedAt())
                .build(),
            "Feedback submitted successfully"));
    }
    
    @GetMapping("/{eventId}/feedback")
    @Operation(summary = "Get event feedback", description = "Get all feedback for an event")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getEventFeedbacks(
            @PathVariable String eventId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<EventFeedback> feedbackPage = feedbackService.getEventFeedbacks(eventId, pageable);
        List<FeedbackResponse> feedbacks = feedbackPage.getContent().stream()
                .map(feedback -> FeedbackResponse.builder()
                    .id(feedback.getId())
                    .eventId(feedback.getEventId())
                    .volunteerId(feedback.getVolunteerId())
                    .rating(feedback.getRating())
                    .comment(feedback.getComment())
                    .submittedAt(feedback.getSubmittedAt())
                    .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(feedbacks));
    }
    
    @GetMapping("/feedback/volunteer/{volunteerId}")
    @Operation(summary = "Get volunteer feedback", description = "Get all feedback submitted by a volunteer")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getVolunteerFeedbacks(
            @PathVariable String volunteerId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<EventFeedback> feedbackPage = feedbackService.getVolunteerFeedbacks(volunteerId, pageable);
        List<FeedbackResponse> feedbacks = feedbackPage.getContent().stream()
                .map(feedback -> FeedbackResponse.builder()
                    .id(feedback.getId())
                    .eventId(feedback.getEventId())
                    .volunteerId(feedback.getVolunteerId())
                    .rating(feedback.getRating())
                    .comment(feedback.getComment())
                    .submittedAt(feedback.getSubmittedAt())
                    .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(feedbacks));
    }
    
    @DeleteMapping("/feedback/{feedbackId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    @Operation(summary = "Delete feedback", description = "Delete feedback by ID")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable String feedbackId) {
        feedbackService.deleteFeedback(feedbackId);
        return ResponseEntity.ok(ApiResponse.success(null, "Feedback deleted successfully"));
    }
    
    @GetMapping("/{eventId}/feedback/stats")
    @Operation(summary = "Get feedback statistics", description = "Get statistics about event feedback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeedbackStats(
            @PathVariable String eventId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", feedbackService.getEventAverageRating(eventId));
        stats.put("totalHours", feedbackService.getTotalVolunteerHours(eventId));
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/{eventId}/feedback/check")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Check feedback submission", description = "Check if a volunteer has submitted feedback")
    public ResponseEntity<ApiResponse<Boolean>> hasSubmittedFeedback(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String volunteerId) {
        boolean hasSubmitted = feedbackService.hasVolunteerSubmittedFeedback(eventId, volunteerId);
        return ResponseEntity.ok(ApiResponse.success(hasSubmitted));
    }

    @GetMapping("/registered")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Get registered events", description = "Get all events a volunteer is registered for")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getRegisteredEvents(
            @RequestHeader("X-User-ID") String userId) {
        List<Event> events = eventService.getEventsByParticipant(userId);
        List<EventResponse> responses = events.stream()
                .map(event -> eventMapper.toResponse(event, userId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/waitlist")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Get waitlisted events", description = "Get all events a volunteer is waitlisted for")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getWaitlistedEvents(
            @RequestHeader("X-User-ID") String userId) {
        List<Event> events = eventService.getEventsByWaitlistedParticipant(userId);
        List<EventResponse> responses = events.stream()
                .map(event -> eventMapper.toResponse(event, userId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping
    @Operation(summary = "Get all events", description = "Get a paginated list of all active events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Event> eventPage = eventService.getAllEvents(pageable);
        return createPagedResponse(eventPage, userId);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all events for admin", description = "Get a paginated list of all events regardless of status")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEventsForAdmin(
            @RequestHeader("X-User-ID") String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return createPagedResponse(eventService.getAllEventsForAdmin(pageable), userId);
    }

    @PostMapping("/{eventId}/register-with-details")
    @Operation(summary = "Register for event with details", description = "Register a volunteer for an event with additional details")
    public ResponseEntity<ApiResponse<EventResponse>> registerWithDetails(
            @PathVariable String eventId,
            @Valid @RequestBody EventRegistrationRequest registrationRequest) {
        
        // Ensure eventId is included in the registration data
        registrationRequest.setEventId(eventId);
        
        // Check if terms are accepted
        if (!registrationRequest.isTermsAccepted()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.<EventResponse>error("You must accept the terms and conditions", HttpStatus.BAD_REQUEST)
            );
        }
        
        log.info("Registering for event with ID: {} with details: {}", eventId, registrationRequest);
        
        // Register the participant in the event with details
        Event event = eventService.registerParticipantWithDetails(
            eventId, 
            registrationRequest.getEmail(),
            registrationRequest
        );
        
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, registrationRequest.getUserId()),
            "Successfully registered for event"
        ));
    }

    @GetMapping("/{eventId}/registrations/status/{userId}")
    @Operation(summary = "Check registration status", description = "Check if a user is registered for an event and get their registration status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkRegistrationStatus(
            @PathVariable String eventId,
            @PathVariable String userId) {
        log.info("Checking registration status for user {} in event {}", userId, eventId);
        
        // Get the event
        Event event = eventService.getEventById(eventId);
        
        // Check if user is in registered participants
        boolean isRegistered = event.getRegisteredParticipants().contains(userId);
        boolean isWaitlisted = event.getWaitlistedParticipants().contains(userId);
        
        // Get detailed status from participation service if available
        String status = "NOT_REGISTERED";
        if (isRegistered || isWaitlisted) {
            Optional<EventParticipation> participation = participationService.getParticipation(userId, eventId);
            if (participation.isPresent()) {
                status = participation.get().getStatus().name();
            } else {
                // Default statuses if no participation record
                status = isRegistered ? "APPROVED" : "WAITLISTED";
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("isRegistered", isRegistered || isWaitlisted);
        result.put("status", status);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Helper method to create paged response
    private ResponseEntity<ApiResponse<List<EventResponse>>> createPagedResponse(
            Page<Event> eventPage,
            String userId) {
        List<EventResponse> events = eventPage.getContent().stream()
                .map(event -> eventMapper.toResponse(event, userId))
                .collect(Collectors.toList());
        
        ApiResponse.Meta meta = ApiResponse.Meta.builder()
                .page(eventPage.getNumber())
                .size(eventPage.getSize())
                .totalElements(eventPage.getTotalElements())
                .totalPages(eventPage.getTotalPages())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(events, meta));
    }
    
    // Helper method to create feedback from request
    private EventFeedback createFeedbackFromRequest(FeedbackRequest request) {
        return EventFeedback.builder()
                .rating((int) request.getRating())
                .comment(request.getComment())
                .build();
    }
}
