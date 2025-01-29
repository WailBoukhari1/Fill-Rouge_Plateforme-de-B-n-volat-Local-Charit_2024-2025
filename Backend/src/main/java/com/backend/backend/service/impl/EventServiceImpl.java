package com.backend.backend.service.impl;

import com.backend.backend.domain.model.Event;
import com.backend.backend.domain.model.EventStatus;
import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.mapper.EventMapper;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.service.interfaces.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventMapper eventMapper;

    @Override
    public EventResponse createEvent(EventRequest request, String organizationId) {
        Event event = eventMapper.toEntity(request);
        event.setOrganizationId(organizationId);
        event.setStatus(EventStatus.DRAFT);
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse getEvent(String id) {
        return eventRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventResponse> getEventsByOrganization(String organizationId) {
        return eventRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EventResponse updateEvent(String id, EventRequest request) {
        Event event = findEventById(id);
        eventMapper.updateEventFromRequest(request, event);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }

    @Override
    public EventResponse publishEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(EventStatus.PUBLISHED);
        Event publishedEvent = eventRepository.save(event);
        return mapToResponse(publishedEvent);
    }

    @Override
    public EventResponse cancelEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(EventStatus.CANCELLED);
        Event cancelledEvent = eventRepository.save(event);
        return mapToResponse(cancelledEvent);
    }

    @Override
    public List<EventResponse> searchEvents(String location, Set<String> skills, Double radius) {
        // Implementation for searching events based on location and skills
        // This would involve geospatial queries using MongoDB
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EventResponse mapToResponse(Event event) {
        long registeredCount = registrationRepository.findByEventId(event.getId()).size();
        
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .dateTime(event.getDateTime())
                .location(event.getLocation())
                .requiredSkills(event.getRequiredSkills())
                .volunteersNeeded(event.getVolunteersNeeded())
                .organizationId(event.getOrganizationId())
                .status(event.getStatus())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .registeredVolunteers((int) registeredCount)
                .build();
    }

    private Event findEventById(String id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }
} 