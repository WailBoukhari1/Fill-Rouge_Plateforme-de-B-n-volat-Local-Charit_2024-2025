package com.fill_rouge.backend.service.event;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.EventFeedbackRepository;
import com.fill_rouge.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.function.Consumer;

@Service
@Transactional
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
    
    private final EventRepository eventRepository;
    private final EventFeedbackRepository feedbackRepository;

    @Override
    public Event createEvent(EventRequest request, String organizationId) {
        Event event = new Event();
        updateEventFromRequest(event, request);
        event.setOrganizationId(organizationId);
        event.setStatus(EventStatus.PENDING);
        event.setRegisteredParticipants(new HashSet<>());
        event.setCreatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }
    
    @Override
    public Event updateEvent(String eventId, EventRequest request) {
        Event event = getAndValidateEvent(eventId, this::validateEventModifiable);
        updateEventFromRequest(event, request);
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }
    
    @Override
    public void deleteEvent(String eventId) {
        Event event = getAndValidateEvent(eventId, this::validateEventModifiable);
        eventRepository.delete(event);
    }
    
    @Override
    public Event updateEventStatus(String eventId, EventStatus newStatus) {
        Event event = getEventById(eventId);
        validateStatusTransition(event.getStatus(), newStatus);
        
        event.setStatus(newStatus);
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }
    
    @Override
    public Event registerParticipant(String eventId, String userId) {
        Event event = getAndValidateEvent(eventId, this::validateEventRegistration);
        
        if (isEventFull(eventId)) {
            throw new IllegalStateException("Event is already full");
        }
        
        event.getRegisteredParticipants().add(userId);
        return eventRepository.save(event);
    }
    
    @Override
    public Event unregisterParticipant(String eventId, String userId) {
        Event event = getAndValidateEvent(eventId, this::validateEventRegistration);
        event.getRegisteredParticipants().remove(userId);
        return eventRepository.save(event);
    }
    
    @Override
    public EventFeedback submitFeedback(String eventId, String volunteerId, EventFeedback feedback) {
        Event event = getEventById(eventId);
        validateFeedbackSubmission(event, volunteerId);
        
        feedback.setEventId(eventId);
        feedback.setVolunteerId(volunteerId);
        feedback.setSubmittedAt(LocalDateTime.now());
        
        EventFeedback savedFeedback = feedbackRepository.save(feedback);
        updateEventRating(event);
        
        return savedFeedback;
    }
    
    @Override
    public EventStatisticsResponse getEventStatistics(String eventId) {
        // Event event = getEventById(eventId);
        
        return EventStatisticsResponse.builder()
            .participantCount(getParticipantCount(eventId))
            .averageRating(getAverageRating(eventId))
            .totalVolunteerHours(getTotalVolunteerHours(eventId))
            .successRate(calculateEventSuccessRate(eventId))
            .build();
    }

    // Query methods
    @Override
    public Event getEventById(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
    }
    
    @Override
    public Page<Event> getEventsByOrganization(String organizationId, Pageable pageable) {
        return eventRepository.findByOrganizationId(organizationId, pageable);
    }
    
    @Override
    public Page<Event> searchEvents(String query, Pageable pageable) {
        return eventRepository.findByTitleContainingIgnoreCase(query, pageable);
    }
    
    @Override
    public Page<Event> getUpcomingEvents(Pageable pageable) {
        return eventRepository.findByStatusAndStartDateAfter(EventStatus.APPROVED, LocalDateTime.now(), pageable);
    }
    
    @Override
    public Page<Event> getNearbyEvents(double[] coordinates, double maxDistance, Pageable pageable) {
        return eventRepository.findNearbyEvents(coordinates, maxDistance, pageable);
    }
    
    @Override
    public Page<Event> getEventsByCategory(String category, Pageable pageable) {
        try {
            EventCategory eventCategory = EventCategory.valueOf(category.toUpperCase());
            return eventRepository.findByCategory(eventCategory, pageable);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid category: " + category);
        }
    }
    
    @Override
    public Page<Event> getEventsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        return eventRepository.findByStartDateBetween(start, end, pageable);
    }
    
    @Override
    public Page<Event> getEventsBySkills(List<String> skills, Pageable pageable) {
        return eventRepository.findByRequiredSkills(skills, pageable);
    }

    // Feedback methods
    @Override
    public Page<EventFeedback> getEventFeedbacks(String eventId, Pageable pageable) {
        return feedbackRepository.findByEventId(eventId, pageable);
    }

    @Override
    public boolean hasVolunteerSubmittedFeedback(String eventId, String volunteerId) {
        return feedbackRepository.existsByEventIdAndVolunteerId(eventId, volunteerId);
    }

    @Override
    public int getTotalVolunteerHours(String eventId) {
        return feedbackRepository.calculateTotalVolunteerHours(eventId);
    }

    @Override
    public double getAverageRating(String eventId) {
        return feedbackRepository.calculateAverageRating(eventId);
    }

    @Override
    public boolean isEventFull(String eventId) {
        Event event = getEventById(eventId);
        return event.getRegisteredParticipants().size() >= event.getMaxParticipants();
    }
    
    @Override
    public long getParticipantCount(String eventId) {
        Event event = getEventById(eventId);
        return event.getRegisteredParticipants().size();
    }

    @Override
    public double calculateEventSuccessRate(String eventId) {
        Event event = getEventById(eventId);
        
        double participationRate = event.getRegisteredParticipants().size() / 
                (double) event.getMaxParticipants();
        double averageRating = getAverageRating(eventId) / 5.0; // Normalize to 0-1
        boolean isCompleted = event.getStatus() == EventStatus.COMPLETED;
        
        // Weight factors: 40% participation, 40% rating, 20% completion
        return (participationRate * 0.4 + averageRating * 0.4 + (isCompleted ? 0.2 : 0)) * 100;
    }

    // Helper methods
    private Event getAndValidateEvent(String eventId, Consumer<Event> validator) {
        Event event = getEventById(eventId);
        validator.accept(event);
        return event;
    }
    
    private void updateEventFromRequest(Event event, EventRequest request) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setCoordinates(request.getCoordinates());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setCategory(request.getCategory());
        event.setRequiredSkills(request.getRequiredSkills());
    }

    private void validateEventModifiable(Event event) {
        if (event.getStatus() == EventStatus.COMPLETED || 
            event.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot modify event in " + event.getStatus() + " state");
        }
    }
    
    private void validateEventRegistration(Event event) {
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new IllegalStateException("Cannot register for event with status: " + event.getStatus());
        }
        if (LocalDateTime.now().isAfter(event.getStartDate())) {
            throw new IllegalStateException("Cannot modify registration for an event that has already started");
        }
    }
    
    private void validateFeedbackSubmission(Event event, String volunteerId) {
        if (!event.getRegisteredParticipants().contains(volunteerId)) {
            throw new IllegalStateException("Only registered participants can submit feedback");
        }
        if (hasVolunteerSubmittedFeedback(event.getId(), volunteerId)) {
            throw new IllegalStateException("Volunteer has already submitted feedback");
        }
    }
    
    private void validateStatusTransition(EventStatus currentStatus, EventStatus newStatus) {
        if (currentStatus == newStatus) return;
        
        switch (currentStatus) {
            case PENDING -> {
                if (newStatus != EventStatus.APPROVED && newStatus != EventStatus.REJECTED) {
                    throw new IllegalStateException("Pending event can only be approved or rejected");
                }
            }
            case APPROVED -> {
                if (newStatus != EventStatus.CANCELLED && newStatus != EventStatus.COMPLETED) {
                    throw new IllegalStateException("Approved event can only be cancelled or completed");
                }
            }
            case REJECTED, CANCELLED, COMPLETED -> 
                throw new IllegalStateException("Cannot change status of event in " + currentStatus + " state");
        }
    }
    
    private void updateEventRating(Event event) {
        double averageRating = getAverageRating(event.getId());
        event.setAverageRating(averageRating);
        eventRepository.save(event);
    }
} 