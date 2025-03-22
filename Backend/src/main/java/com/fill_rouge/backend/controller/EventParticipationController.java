package com.fill_rouge.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.domain.EventParticipation;
import com.fill_rouge.backend.service.event.EventParticipationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/event-participations")
@RequiredArgsConstructor
public class EventParticipationController {
    
    private final EventParticipationService participationService;
    
    @PostMapping("/events/{eventId}/volunteers/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<EventParticipation> registerForEvent(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.registerForEvent(volunteerId, eventId));
    }
    
    @PutMapping("/events/{eventId}/volunteers/{volunteerId}/check-in")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<EventParticipation> checkIn(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.checkIn(volunteerId, eventId));
    }
    
    @PutMapping("/events/{eventId}/volunteers/{volunteerId}/check-out")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<EventParticipation> checkOut(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.checkOut(volunteerId, eventId));
    }
    
    @PutMapping("/events/{eventId}/volunteers/{volunteerId}/feedback")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<EventParticipation> submitFeedback(
            @PathVariable String eventId,
            @PathVariable String volunteerId,
            @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(participationService.submitFeedback(
            volunteerId, eventId, request.rating(), request.feedback()));
    }
    
    @DeleteMapping("/events/{eventId}/volunteers/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<EventParticipation> cancelParticipation(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.cancelParticipation(volunteerId, eventId));
    }
    
    @GetMapping("/events/{eventId}/volunteers/{volunteerId}")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ORGANIZATION')")
    public ResponseEntity<EventParticipation> getParticipation(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return participationService.getParticipation(volunteerId, eventId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/volunteers/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<List<EventParticipation>> getVolunteerParticipations(
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.getVolunteerParticipations(volunteerId));
    }
    
    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<List<EventParticipation>> getEventParticipations(
            @PathVariable String eventId) {
        return ResponseEntity.ok(participationService.getEventParticipations(eventId));
    }
    
    @GetMapping("/events/{eventId}/status/{status}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<Page<EventParticipation>> getEventParticipationsByStatus(
            @PathVariable String eventId,
            @PathVariable EventParticipationStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(participationService.getEventParticipationsByStatus(eventId, status, pageable));
    }
    
    @GetMapping("/events/{eventId}/count")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<Long> getEventParticipantCount(@PathVariable String eventId) {
        return ResponseEntity.ok(participationService.getEventParticipantCount(eventId));
    }
    
    @GetMapping("/events/{eventId}/volunteers/{volunteerId}/has-participated")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ORGANIZATION')")
    public ResponseEntity<Boolean> hasVolunteerParticipated(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.hasVolunteerParticipated(volunteerId, eventId));
    }
    
    @GetMapping("/events/{eventId}/volunteers/{volunteerId}/has-completed")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ORGANIZATION')")
    public ResponseEntity<Boolean> hasVolunteerCompletedEvent(
            @PathVariable String eventId,
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(participationService.hasVolunteerCompletedEvent(volunteerId, eventId));
    }
    
    private record FeedbackRequest(int rating, String feedback) {}
} 