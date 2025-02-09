package com.backend.backend.controller;

import com.backend.backend.dto.EventRequest;
import com.backend.backend.dto.EventResponse;
import com.backend.backend.service.interfaces.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashSet;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEvent(id));
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.createEvent(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<EventResponse>> getEventsByOrganization(
            @PathVariable String organizationId) {
        return ResponseEntity.ok(eventService.getEventsByOrganization(organizationId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventResponse>> searchEvents(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false, defaultValue = "10.0") Double radius) {
        return ResponseEntity.ok(eventService.searchEvents(location, new HashSet<>(skills != null ? skills : List.of()), radius));
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<EventResponse> registerForEvent(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.registerForEvent(eventId, userDetails.getUsername()));
    }

    @DeleteMapping("/{eventId}/register")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventService.cancelRegistration(eventId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
} 