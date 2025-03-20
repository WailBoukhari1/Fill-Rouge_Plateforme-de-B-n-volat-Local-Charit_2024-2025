package com.fill_rouge.backend.service;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.exception.InvalidEventStateException;
import com.fill_rouge.backend.service.event.EventAchievementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    
    private final EventRepository eventRepository;
    private final EventAchievementService eventAchievementService;
    
    @Transactional(readOnly = true)
    public Page<Event> getEventsByOrganization(String organizationId, Pageable pageable) {
        return eventRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Event> getEventsByOrganizationAndStatus(String organizationId, EventStatus status, Pageable pageable) {
        return eventRepository.findByStatusAndStartDateAfter(status, LocalDateTime.now(), pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Event> getEventsByOrganizationAndCategory(String organizationId, EventCategory category, Pageable pageable) {
        return eventRepository.findByCategory(category, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Event> getEventsByOrganizationAndFilters(
            String organizationId,
            EventCategory category,
            EventStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        return eventRepository.findByStartDateBetween(startDate, endDate, pageable);
    }
    
    @Transactional(readOnly = true)
    public Event getEventById(String id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }
    
    @Transactional
    public Event createEvent(Event event) {
        event.setStatus(EventStatus.PENDING);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }
    
    @Transactional
    public Event updateEvent(String id, Event eventDetails) {
        Event event = getEventById(id);
        
        // Update fields
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setLocation(eventDetails.getLocation());
        event.setStartDate(eventDetails.getStartDate());
        event.setEndDate(eventDetails.getEndDate());
        event.setMaxParticipants(eventDetails.getMaxParticipants());
        event.setCategory(eventDetails.getCategory());
        event.setContactPerson(eventDetails.getContactPerson());
        event.setContactEmail(eventDetails.getContactEmail());
        event.setContactPhone(eventDetails.getContactPhone());
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }
    
    @Transactional
    public Event updateEventStatus(String id, EventStatus newStatus) {
        Event event = getEventById(id);
        
        // Validate status transition
        validateStatusTransition(event.getStatus(), newStatus);
        
        event.setStatus(newStatus);
        event.setUpdatedAt(LocalDateTime.now());
        
        Event updatedEvent = eventRepository.save(event);
        
        // Check achievements when event is completed
        if (newStatus == EventStatus.COMPLETED) {
            eventAchievementService.onEventCompleted(updatedEvent);
        }
        
        return updatedEvent;
    }
    
    @Transactional
    public Event cancelEvent(String id, String reason) {
        Event event = getEventById(id);
        
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new InvalidEventStateException("Cannot cancel a completed event");
        }
        
        event.setStatus(EventStatus.CANCELLED);
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }
    
    @Transactional
    public void deleteEvent(String id) {
        Event event = getEventById(id);
        
        if (event.getStatus() == EventStatus.ONGOING) {
            throw new InvalidEventStateException("Cannot delete an ongoing event");
        }
        
        eventRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<Event> getOngoingEvents(String organizationId) {
        return eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
            LocalDateTime.now(), EventStatus.ONGOING, Pageable.unpaged()).getContent();
    }
    
    @Transactional(readOnly = true)
    public List<Event> getUpcomingEvents(String organizationId) {
        return eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
            LocalDateTime.now(), EventStatus.ACTIVE, Pageable.unpaged()).getContent();
    }
    
    @Transactional(readOnly = true)
    public List<Event> getCompletedEvents(String organizationId) {
        return eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
            LocalDateTime.now(), EventStatus.COMPLETED, Pageable.unpaged()).getContent();
    }
    
    private void validateStatusTransition(EventStatus currentStatus, EventStatus newStatus) {
        switch (currentStatus) {
            case PENDING:
                if (newStatus != EventStatus.ACTIVE && newStatus != EventStatus.CANCELLED) {
                    throw new InvalidEventStateException("Pending events can only transition to ACTIVE or CANCELLED");
                }
                break;
            case ACTIVE:
                if (newStatus != EventStatus.ONGOING && newStatus != EventStatus.CANCELLED) {
                    throw new InvalidEventStateException("Active events can only transition to ONGOING or CANCELLED");
                }
                break;
            case ONGOING:
                if (newStatus != EventStatus.COMPLETED) {
                    throw new InvalidEventStateException("Ongoing events can only transition to COMPLETED");
                }
                break;
            case COMPLETED:
            case CANCELLED:
                throw new InvalidEventStateException("Cannot transition from terminal states");
            case SCHEDULED:
                if (newStatus != EventStatus.ACTIVE) {
                    throw new InvalidEventStateException("Scheduled events can only transition to ACTIVE");
                }
                break;
            case FULL:
                if (newStatus != EventStatus.ACTIVE && newStatus != EventStatus.CANCELLED) {
                    throw new InvalidEventStateException("Full events can only transition to ACTIVE or CANCELLED");
                }
                break;
        }
    }
} 