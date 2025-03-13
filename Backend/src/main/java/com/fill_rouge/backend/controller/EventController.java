package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.request.FeedbackRequest;
import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.EventResponse;
import com.fill_rouge.backend.dto.response.FeedbackResponse;
import com.fill_rouge.backend.mapper.EventMapper;
import com.fill_rouge.backend.service.event.EventFeedbackService;
import com.fill_rouge.backend.service.event.EventService;
import com.fill_rouge.backend.constant.EventStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Tag(name = "Event Management", description = "APIs for managing events and feedback")
public class EventController {
    
    private final EventService eventService;
    private final EventFeedbackService feedbackService;
    private final EventMapper eventMapper;
    
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
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Register for event", description = "Register a volunteer for an event")
    public ResponseEntity<ApiResponse<EventResponse>> registerForEvent(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.registerParticipant(eventId, userId);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Successfully registered for event"
        ));
    }
    
    @PostMapping("/{eventId}/unregister")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Unregister from event", description = "Unregister a volunteer from an event")
    public ResponseEntity<ApiResponse<EventResponse>> unregisterFromEvent(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.unregisterParticipant(eventId, userId);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Successfully unregistered from event"
        ));
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
            @RequestHeader("X-User-ID") String userId) {
        Event event = eventService.updateEventStatus(eventId, EventStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success(
            eventMapper.toResponse(event, userId),
            "Event rejected"
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
