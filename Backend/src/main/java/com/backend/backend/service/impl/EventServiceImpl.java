package com.backend.backend.service.impl;

import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.EventStatsResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.model.Event;
import com.backend.backend.model.EventStatus;
import com.backend.backend.model.RegistrationStatus;
import com.backend.backend.mapper.EventMapper;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.service.interfaces.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventMapper eventMapper;
    private final EmailService emailService;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Override
    public EventResponse createEvent(EventRequest request, String organizationId) {
        Event event = eventMapper.toEntity(request);
        event.setOrganizationId(organizationId);
        event.setStatus(EventStatus.DRAFT);
        event.setActive(true);
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(String id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        Event oldEvent = new Event();
        // Copy old values for comparison
        eventMapper.updateEventFromRequest(request, oldEvent);
        
        // Update event
        eventMapper.updateEventFromRequest(request, event);
        Event updatedEvent = eventRepository.save(event);
        
        // Notify participants if there are significant changes
        notifyParticipantsOfChanges(event, oldEvent);
        
        return eventMapper.toResponse(updatedEvent);
    }

    @Override
    public void deleteEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        // Notify participants of cancellation
        notifyEventParticipants(id, "Event has been cancelled");
        
        eventRepository.deleteById(id);
    }

    @Override
    public EventResponse getEvent(String id) {
        return eventRepository.findById(id)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(eventMapper::toResponse);
    }

    @Override
    public EventResponse publishEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        event.setStatus(EventStatus.PUBLISHED);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse cancelEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        event.setStatus(EventStatus.CANCELLED);
        event.setActive(false);
        
        // Notify participants
        notifyEventParticipants(id, "Event has been cancelled");
        
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse postponeEvent(String id, LocalDateTime newDateTime) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        LocalDateTime oldDateTime = event.getStartDate();
        event.setStartDate(newDateTime);
        event.setEndDate(newDateTime.plusHours(event.getEndDate().getHour() - event.getStartDate().getHour()));
        
        Event updatedEvent = eventRepository.save(event);
        
        // Notify participants
        Map<String, String> changes = Map.of(
            "Original Date", oldDateTime.format(DATE_FORMATTER),
            "New Date", newDateTime.format(DATE_FORMATTER)
        );
        notifyParticipantsOfChanges(event, changes);
        
        return eventMapper.toResponse(updatedEvent);
    }

    @Override
    public void registerVolunteer(String eventId, String volunteerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        if (!event.isActive() || event.getStatus() != EventStatus.PUBLISHED) {
            throw new CustomException("Event is not available for registration", HttpStatus.BAD_REQUEST);
        }
        
        if (registrationRepository.existsByEventIdAndVolunteerId(eventId, volunteerId)) {
            throw new CustomException("Already registered for this event", HttpStatus.BAD_REQUEST);
        }
        
        // Registration logic is handled by EventRegistrationService
    }

    @Override
    public void unregisterVolunteer(String eventId, String volunteerId) {
        if (!registrationRepository.existsByEventIdAndVolunteerId(eventId, volunteerId)) {
            throw new CustomException("Not registered for this event", HttpStatus.BAD_REQUEST);
        }
        
        // Unregistration logic is handled by EventRegistrationService
    }

    @Override
    public List<EventResponse> getVolunteerEvents(String volunteerId, boolean includeHistory) {
        LocalDateTime cutoffDate = includeHistory ? null : LocalDateTime.now();
        return eventRepository.findAll().stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED &&
                        (includeHistory || event.getStartDate().isAfter(LocalDateTime.now())) &&
                        registrationRepository.existsByEventIdAndVolunteerId(event.getId(), volunteerId))
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public List<EventResponse> getOrganizationEvents(String organizationId, boolean includeHistory) {
        LocalDateTime cutoffDate = includeHistory ? null : LocalDateTime.now();
        return eventRepository.findByOrganizationId(organizationId).stream()
                .filter(event -> includeHistory || event.getStartDate().isAfter(LocalDateTime.now()))
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public Page<EventResponse> searchEvents(String query, List<String> categories, 
            String location, Double radius, Pageable pageable) {
        // Search logic is handled by EventSearchService
        throw new CustomException("Method not implemented in this service", HttpStatus.NOT_IMPLEMENTED);
    }

    @Override
    public List<EventResponse> getUpcomingEvents(int days) {
        LocalDateTime endDate = LocalDateTime.now().plusDays(days);
        return eventRepository.findByStartDateBetween(LocalDateTime.now(), endDate).stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                .map(eventMapper::toResponse)
                .toList();
    }

    @Override
    public EventStatsResponse getEventStats(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        long totalRegistrations = registrationRepository.countByEventIdAndStatusIn(
            eventId, 
            List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING, RegistrationStatus.CANCELLED)
        );
        
        long confirmedRegistrations = registrationRepository.countByEventIdAndStatusIn(
            eventId,
            List.of(RegistrationStatus.CONFIRMED)
        );
        
        long canceledRegistrations = registrationRepository.countByEventIdAndStatusIn(
            eventId,
            List.of(RegistrationStatus.CANCELLED)
        );
        
        return EventStatsResponse.builder()
                .eventId(event.getId())
                .eventName(event.getTitle())
                .totalRegistrations((int) totalRegistrations)
                .confirmedAttendees((int) confirmedRegistrations)
                .canceledRegistrations((int) canceledRegistrations)
                .attendanceRate(totalRegistrations > 0 ? (double) confirmedRegistrations / totalRegistrations : 0)
                .build();
    }

    @Override
    public EventStatsResponse getOrganizationEventStats(String organizationId) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId);
        
        int totalEvents = events.size();
        int activeEvents = (int) events.stream()
                .filter(Event::isActive)
                .count();
        
        return EventStatsResponse.builder()
                .totalRegistrations(totalEvents)
                .confirmedAttendees(activeEvents)
                .build();
    }

    @Override
    @Scheduled(cron = "${app.event.reminder-schedule:0 0 8 * * ?}") // Default to 8 AM daily
    public void scheduleEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderThreshold = now.plusDays(1); // Send reminders for events within 24 hours
        
        eventRepository.findByStartDateBetween(now, reminderThreshold).stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                .forEach(event -> {
                    try {
                        notifyEventParticipants(event.getId(), 
                            "Reminder: Your event is scheduled for tomorrow");
                    } catch (Exception e) {
                        log.error("Failed to send reminder for event {}: {}", 
                            event.getId(), e.getMessage());
                    }
                });
    }

    @Override
    public void notifyEventParticipants(String eventId, String message) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        
        registrationRepository.findByEventId(eventId).stream()
                .filter(registration -> registration.getStatus() == RegistrationStatus.CONFIRMED)
                .forEach(registration -> {
                    try {
                        emailService.sendEventUpdate(
                            registration.getVolunteerId(),
                            event.getTitle(),
                            Map.of("Message", message)
                        );
                    } catch (Exception e) {
                        log.error("Failed to send notification to participant {} for event {}: {}", 
                            registration.getVolunteerId(), eventId, e.getMessage());
                    }
                });
    }

    private void notifyParticipantsOfChanges(Event event, Event oldEvent) {
        Map<String, String> changes = eventMapper.detectChanges(oldEvent, event);
        if (!changes.isEmpty()) {
            notifyParticipantsOfChanges(event, changes);
        }
    }

    private void notifyParticipantsOfChanges(Event event, Map<String, String> changes) {
        registrationRepository.findByEventId(event.getId()).stream()
                .filter(registration -> registration.getStatus() == RegistrationStatus.CONFIRMED)
                .forEach(registration -> {
                    try {
                        emailService.sendEventUpdate(
                            registration.getVolunteerId(),
                            event.getTitle(),
                            changes
                        );
                    } catch (Exception e) {
                        log.error("Failed to send update notification to participant {} for event {}: {}", 
                            registration.getVolunteerId(), event.getId(), e.getMessage());
                    }
                });
    }
} 