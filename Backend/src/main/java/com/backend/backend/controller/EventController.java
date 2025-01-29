package com.backend.backend.controller;

import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.service.interfaces.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request,
            @RequestHeader("Organization-Id") String organizationId) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.createEvent(request, organizationId),
            "Event created successfully"
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEvent(id)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAllEvents()));
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByOrganization(
            @PathVariable String organizationId) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.getEventsByOrganization(organizationId)
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION') and @securityService.isEventOwner(#id, principal)")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.updateEvent(id, request),
            "Event updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION') and @securityService.isEventOwner(#id, principal)")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ORGANIZATION') and @securityService.isEventOwner(#id, principal)")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.publishEvent(id),
            "Event published successfully"
        ));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ORGANIZATION') and @securityService.isEventOwner(#id, principal)")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.cancelEvent(id),
            "Event cancelled successfully"
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventResponse>>> searchEvents(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Set<String> skills,
            @RequestParam(required = false) Double radius) {
        return ResponseEntity.ok(ApiResponse.success(
            eventService.searchEvents(location, skills, radius)
        ));
    }
} 