package com.fill_rouge.backend.service.event;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.domain.EventParticipation;

public interface EventParticipationService {
    EventParticipation registerForEvent(String volunteerId, String eventId);
    EventParticipation checkIn(String volunteerId, String eventId);
    EventParticipation checkOut(String volunteerId, String eventId);
    EventParticipation submitFeedback(String volunteerId, String eventId, int rating, String feedback);
    EventParticipation cancelParticipation(String volunteerId, String eventId);
    Optional<EventParticipation> getParticipation(String volunteerId, String eventId);
    List<EventParticipation> getVolunteerParticipations(String volunteerId);
    List<EventParticipation> getEventParticipations(String eventId);
    Page<EventParticipation> getEventParticipationsByStatus(String eventId, EventParticipationStatus status, Pageable pageable);
    long getEventParticipantCount(String eventId);
    boolean hasVolunteerParticipated(String volunteerId, String eventId);
    boolean hasVolunteerCompletedEvent(String volunteerId, String eventId);
} 