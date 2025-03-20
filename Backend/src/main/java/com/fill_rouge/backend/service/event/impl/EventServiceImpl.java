package com.fill_rouge.backend.service.event.impl;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.mapper.EventMapper;
import com.fill_rouge.backend.repository.EventFeedbackRepository;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.service.event.EventService;
import com.fill_rouge.backend.service.user.IUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventFeedbackRepository eventFeedbackRepository;
    private final IUserService userService;
    private final EventMapper eventMapper;

    @Override
    public List<Event> getEventsByParticipant(String userId) {
        return eventRepository.findByRegisteredParticipantsContaining(userId);
    }

    @Override
    public List<Event> getEventsByWaitlistedParticipant(String userId) {
        return eventRepository.findByWaitlistedParticipantsContaining(userId);
    }

    @Override
    public Page<Event> getUpcomingEvents(Pageable pageable) {
        return eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
            LocalDateTime.now(),
            EventStatus.ACTIVE,
            pageable
        );
    }

    @Override
    public Page<Event> searchEvents(String query, Pageable pageable) {
        return eventRepository.findByTitleContainingIgnoreCase(query, pageable);
    }

    @Override
    public boolean isEventFull(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return event.getRegisteredParticipants().size() >= event.getMaxParticipants();
    }

    @Override
    public Event updateEvent(String eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        // Update event properties from request
        return eventRepository.save(event);
    }

    @Override
    public EventStatisticsResponse getEventStatistics(String eventId) {
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
        // Implement average rating calculation
        return 0.0;
    }

    @Override
    public double calculateEventSuccessRate(String eventId) {
        // Implement success rate calculation
        return 0.0;
    }

    @Override
    public Event unregisterParticipant(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        event.getRegisteredParticipants().remove(userId);
        return eventRepository.save(event);
    }

    @Override
    public long getParticipantCount(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return event.getRegisteredParticipants().size();
    }

    @Override
    public boolean hasVolunteerSubmittedFeedback(String eventId, String volunteerId) {
        return eventRepository.findEventWithFeedback(eventId, volunteerId).isPresent();
    }

    @Override
    public Page<Event> getEventsBySkills(List<String> skills, Pageable pageable) {
        return eventRepository.findByRequiredSkills(skills, pageable);
    }

    @Override
    public Page<Event> getEventsByCategory(String category, Pageable pageable) {
        return eventRepository.findByCategory(EventCategory.valueOf(category.toUpperCase()), pageable);
    }

    @Override
    public Page<Event> getNearbyEvents(double[] coordinates, double maxDistance, Pageable pageable) {
        return eventRepository.findNearbyEvents(coordinates, maxDistance, pageable);
    }

    @Override
    public EventFeedback submitFeedback(String eventId, String volunteerId, EventFeedback feedback) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        // Add feedback logic
        return feedback;
    }

    @Override
    public Event updateEventStatus(String eventId, EventStatus status) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(status);
        return eventRepository.save(event);
    }

    @Override
    public Event registerParticipant(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        event.getRegisteredParticipants().add(userId);
        return eventRepository.save(event);
    }

    @Override
    public Page<Event> getEventsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return eventRepository.findByStartDateBetween(start, end, pageable);
    }

    @Override
    public void deleteEvent(String eventId) {
        eventRepository.deleteById(eventId);
    }

    @Override
    public Page<Event> getEventsByOrganization(String organizationId, Pageable pageable) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId, pageable);
        return new PageImpl<>(events, pageable, events.size());
    }

    @Override
    public int getTotalVolunteerHours(String eventId) {
        // Implement volunteer hours calculation
        return 0;
    }

    @Override
    public Event getEventById(String eventId) {
        return eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public Event createEvent(EventRequest request, String organizationId) {
        Event event = eventMapper.toEntity(request);
        event.setOrganizationId(organizationId);
        event.setStatus(EventStatus.PENDING);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    @Override
    public Page<Event> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable);
    }

    @Override
    public Page<EventFeedback> getEventFeedbacks(String eventId, Pageable pageable) {
        // Implement feedback retrieval
        return Page.empty();
    }
} 