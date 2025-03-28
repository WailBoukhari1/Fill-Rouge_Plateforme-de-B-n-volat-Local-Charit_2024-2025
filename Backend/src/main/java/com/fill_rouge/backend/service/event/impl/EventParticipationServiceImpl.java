package com.fill_rouge.backend.service.event.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.domain.EventParticipation;
import com.fill_rouge.backend.repository.EventParticipationRepository;
import com.fill_rouge.backend.service.event.EventParticipationService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EventParticipationServiceImpl implements EventParticipationService {

    private final EventParticipationRepository participationRepository;

    @Override
    public EventParticipation registerForEvent(String volunteerId, String eventId) {
        // Check if already registered
        if (participationRepository.existsByVolunteerIdAndEventId(volunteerId, eventId)) {
            throw new RuntimeException("Volunteer is already registered for this event");
        }

        EventParticipation participation = EventParticipation.builder()
            .volunteerId(volunteerId)
            .eventId(eventId)
            .status(EventParticipationStatus.REGISTERED)
            .registeredAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        return participationRepository.save(participation);
    }

    @Override
    public EventParticipation registerForEventWithDetails(String volunteerId, String eventId, 
                                                         String specialRequirements, String notes) {
        // Check if already registered
        if (participationRepository.existsByVolunteerIdAndEventId(volunteerId, eventId)) {
            throw new RuntimeException("Volunteer is already registered for this event");
        }

        EventParticipation participation = EventParticipation.builder()
            .volunteerId(volunteerId)
            .eventId(eventId)
            .status(EventParticipationStatus.REGISTERED)
            .registeredAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .specialRequirements(specialRequirements)
            .notes(notes)
            .build();

        return participationRepository.save(participation);
    }

    @Override
    public EventParticipation registerForEventWithDetailsAndStatus(String volunteerId, String eventId, 
                                                         String specialRequirements, String notes, String status) {
        // Check if already registered
        Optional<EventParticipation> existingRegistration = participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId);
        
        if (existingRegistration.isPresent()) {
            EventParticipation participation = existingRegistration.get();
            
            // Update with new details if provided
            if (specialRequirements != null && !specialRequirements.isBlank()) {
                participation.setSpecialRequirements(specialRequirements);
            }
            
            if (notes != null && !notes.isBlank()) {
                participation.setNotes(notes);
            }
            
            // Update status if different
            try {
                EventParticipationStatus newStatus = EventParticipationStatus.valueOf(status);
                if (participation.getStatus() != newStatus) {
                    participation.setStatus(newStatus);
                    participation.setUpdatedAt(LocalDateTime.now());
                }
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid participation status: " + status);
            }
            
            return participationRepository.save(participation);
        }

        EventParticipationStatus participationStatus;
        try {
            participationStatus = EventParticipationStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            // Default to REGISTERED if invalid status
            participationStatus = EventParticipationStatus.REGISTERED;
        }

        EventParticipation participation = EventParticipation.builder()
            .volunteerId(volunteerId)
            .eventId(eventId)
            .status(participationStatus)
            .registeredAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .specialRequirements(specialRequirements)
            .notes(notes)
            .build();

        return participationRepository.save(participation);
    }

    @Override
    public EventParticipation checkIn(String volunteerId, String eventId) {
        EventParticipation participation = participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId)
            .orElseThrow(() -> new RuntimeException("Participation not found"));

        participation.checkIn();
        return participationRepository.save(participation);
    }

    @Override
    public EventParticipation checkOut(String volunteerId, String eventId) {
        EventParticipation participation = participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId)
            .orElseThrow(() -> new RuntimeException("Participation not found"));

        participation.checkOut();
        return participationRepository.save(participation);
    }

    @Override
    public EventParticipation submitFeedback(String volunteerId, String eventId, int rating, String feedback) {
        EventParticipation participation = participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId)
            .orElseThrow(() -> new RuntimeException("Participation not found"));

        participation.submitFeedback(rating, feedback);
        return participationRepository.save(participation);
    }

    @Override
    public EventParticipation cancelParticipation(String volunteerId, String eventId) {
        EventParticipation participation = participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId)
            .orElseThrow(() -> new RuntimeException("Participation not found"));

        participation.setStatus(EventParticipationStatus.CANCELLED);
        participation.setUpdatedAt(LocalDateTime.now());
        return participationRepository.save(participation);
    }

    @Override
    public Optional<EventParticipation> getParticipation(String volunteerId, String eventId) {
        return participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId);
    }

    @Override
    public List<EventParticipation> getVolunteerParticipations(String volunteerId) {
        return participationRepository.findByVolunteerId(volunteerId);
    }

    @Override
    public List<EventParticipation> getEventParticipations(String eventId) {
        return participationRepository.findByEventId(eventId);
    }

    @Override
    public Page<EventParticipation> getEventParticipationsByStatus(String eventId, EventParticipationStatus status, Pageable pageable) {
        return participationRepository.findAll(pageable); // TODO: Implement proper filtering
    }

    @Override
    public long getEventParticipantCount(String eventId) {
        return participationRepository.countByEventIdAndStatus(eventId, EventParticipationStatus.REGISTERED);
    }

    @Override
    public boolean hasVolunteerParticipated(String volunteerId, String eventId) {
        return participationRepository.existsByVolunteerIdAndEventId(volunteerId, eventId);
    }

    @Override
    public boolean hasVolunteerCompletedEvent(String volunteerId, String eventId) {
        return participationRepository.findByVolunteerIdAndEventId(volunteerId, eventId)
            .map(EventParticipation::hasCompleted)
            .orElse(false);
    }
} 