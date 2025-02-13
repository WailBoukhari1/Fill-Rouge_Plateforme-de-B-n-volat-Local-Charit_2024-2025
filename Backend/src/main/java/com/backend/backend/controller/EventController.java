package com.backend.backend.controller;

import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.EventStatsResponse;
import com.backend.backend.service.interfaces.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventResponse>>> getAllEvents(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.getAllEvents(pageable),
            "Events retrieved successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.getEvent(id),
            "Event retrieved successfully"
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.createEvent(request, userDetails.getUsername()),
            "Event created successfully"
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.updateEvent(id, request),
            "Event updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getOrganizationEvents(
            @PathVariable String organizationId,
            @RequestParam(defaultValue = "false") boolean includeHistory) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.getOrganizationEvents(organizationId, includeHistory),
            "Organization events retrieved successfully"
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<EventResponse>>> searchEvents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double radius,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.searchEvents(query, categories, location, radius, pageable),
            "Search results retrieved successfully"
        ));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcomingEvents(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.getUpcomingEvents(days),
            "Upcoming events retrieved successfully"
        ));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.publishEvent(id),
            "Event published successfully"
        ));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.cancelEvent(id),
            "Event cancelled successfully"
        ));
    }

    @PostMapping("/{id}/postpone")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventResponse>> postponeEvent(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDateTime) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.postponeEvent(id, newDateTime),
            "Event postponed successfully"
        ));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventStatsResponse>> getEventStats(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.getEventStats(id),
            "Event statistics retrieved successfully"
        ));
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<Void>> registerVolunteer(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventService.registerVolunteer(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully registered for event"));
    }

    @DeleteMapping("/{id}/register")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<Void>> unregisterVolunteer(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventService.unregisterVolunteer(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully unregistered from event"));
    }
} 