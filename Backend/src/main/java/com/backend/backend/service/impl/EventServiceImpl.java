package com.backend.backend.service.impl;

import com.backend.backend.domain.Event;
import com.backend.backend.dto.EventRequest;
import com.backend.backend.dto.EventResponse;
import com.backend.backend.exception.ResourceNotFoundException;
import com.backend.backend.mapper.EventMapper;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.service.interfaces.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public EventResponse getEvent(String id) {
        return eventRepository.findById(id)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    @Override
    public EventResponse createEvent(EventRequest request, String username) {
        Event event = eventMapper.toEntity(request);
        event.setOrganizationId(username);
        event.setStatus("ACTIVE");
        event.setRegisteredParticipants(new HashSet<>());
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(String id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        eventMapper.updateEventFromRequest(request, event);
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    @Override
    public List<EventResponse> getEventsByOrganization(String organizationId) {
        return eventRepository.findByOrganizationId(organizationId).stream()
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public List<EventResponse> searchEvents(String location, Set<String> skills, Double radius) {
        return eventRepository.findByLocationAndSkills(location, new ArrayList<>(skills)).stream()
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public EventResponse registerForEvent(String eventId, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getRegisteredParticipants().size() >= event.getMaxParticipants()) {
            throw new IllegalStateException("Event is full");
        }

        event.getRegisteredParticipants().add(username);
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public void cancelRegistration(String eventId, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!event.getRegisteredParticipants().remove(username)) {
            throw new IllegalStateException("User not registered for this event");
        }

        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }

    @Override
    public EventResponse publishEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        event.setStatus("PUBLISHED");
        event.setUpdatedAt(LocalDateTime.now());
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse cancelEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        event.setStatus("CANCELLED");
        event.setUpdatedAt(LocalDateTime.now());
        return eventMapper.toResponse(eventRepository.save(event));
    }
} 