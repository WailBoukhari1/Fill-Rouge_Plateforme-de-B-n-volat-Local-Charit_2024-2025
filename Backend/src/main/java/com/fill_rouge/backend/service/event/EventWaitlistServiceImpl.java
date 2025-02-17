package com.fill_rouge.backend.service.event;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventWaitlist;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.EventWaitlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventWaitlistServiceImpl implements EventWaitlistService {

    private final EventRepository eventRepository;
    private final EventWaitlistRepository waitlistRepository;
    private final EventService eventService;
    
    private static final int NOTIFICATION_EXPIRY_HOURS = 24;

    @Override
    @Transactional
    public EventWaitlist joinWaitlist(String eventId, String volunteerId) {
        Event event = validateAndGetEvent(eventId);
        validateWaitlistJoin(event, volunteerId);
        
        EventWaitlist waitlist = createWaitlistEntry(event, volunteerId);
        event.getWaitlistedParticipants().add(volunteerId);
        eventRepository.save(event);
        
        return waitlistRepository.save(waitlist);
    }

    @Override
    @Transactional
    public void leaveWaitlist(String eventId, String volunteerId) {
        Event event = validateAndGetEvent(eventId);
        validateWaitlistLeave(event, volunteerId);
        
        event.getWaitlistedParticipants().remove(volunteerId);
        eventRepository.save(event);
        waitlistRepository.deleteByEventIdAndVolunteerId(eventId, volunteerId);
    }

    @Override
    public Page<EventWaitlist> getEventWaitlist(String eventId, Pageable pageable) {
        validateAndGetEvent(eventId);
        return waitlistRepository.findByEventIdOrderByJoinedAt(eventId, pageable);
    }

    @Override
    public Page<EventWaitlist> getVolunteerWaitlists(String volunteerId, Pageable pageable) {
        return waitlistRepository.findByVolunteerIdOrderByJoinedAt(volunteerId, pageable);
    }

    @Override
    public int getWaitlistPosition(String eventId, String volunteerId) {
        return waitlistRepository.findWaitlistPosition(eventId, volunteerId)
                .orElseThrow(() -> new IllegalStateException("Volunteer is not on waitlist"));
    }

    @Override
    public boolean isVolunteerOnWaitlist(String eventId, String volunteerId) {
        return waitlistRepository.existsByEventIdAndVolunteerId(eventId, volunteerId);
    }

    @Override
    public int getWaitlistCount(String eventId) {
        return waitlistRepository.countByEventId(eventId);
    }

    @Override
    @Transactional
    public void notifyNextInWaitlist(String eventId) {
        EventWaitlist nextInLine = waitlistRepository.findFirstByEventIdAndNotifiedFalseOrderByJoinedAt(eventId)
                .orElseThrow(() -> new IllegalStateException("No volunteers on waitlist"));
        
        nextInLine.setNotified(true);
        nextInLine.setNotifiedAt(LocalDateTime.now());
        nextInLine.setExpiresAt(LocalDateTime.now().plusHours(NOTIFICATION_EXPIRY_HOURS));
        nextInLine.setStatus("NOTIFIED");
        
        waitlistRepository.save(nextInLine);
        // TODO: Send actual notification through a notification service
    }

    @Override
    @Transactional
    public void processExpiredNotifications() {
        LocalDateTime now = LocalDateTime.now();
        waitlistRepository.findExpiredNotifications(now)
                .forEach(this::handleExpiredNotification);
    }

    // Helper methods
    private Event validateAndGetEvent(String eventId) {
        Event event = eventService.getEventById(eventId);
        if (!event.isWaitlistEnabled()) {
            throw new IllegalStateException("Waitlist is not enabled for this event");
        }
        return event;
    }
    
    private void validateWaitlistJoin(Event event, String volunteerId) {
        if (event.isWaitlistFull()) {
            throw new IllegalStateException("Waitlist is full");
        }
        if (isVolunteerOnWaitlist(event.getId(), volunteerId)) {
            throw new IllegalStateException("Volunteer is already on the waitlist");
        }
    }
    
    private void validateWaitlistLeave(Event event, String volunteerId) {
        if (!isVolunteerOnWaitlist(event.getId(), volunteerId)) {
            throw new IllegalStateException("Volunteer is not on the waitlist");
        }
    }
    
    private EventWaitlist createWaitlistEntry(Event event, String volunteerId) {
        return EventWaitlist.builder()
                .eventId(event.getId())
                .volunteerId(volunteerId)
                .joinedAt(LocalDateTime.now())
                .position(getWaitlistCount(event.getId()) + 1)
                .notified(false)
                .expired(false)
                .status("WAITING")
                .build();
    }
    
    private void handleExpiredNotification(EventWaitlist waitlist) {
        waitlist.setExpired(true);
        waitlist.setStatus("EXPIRED");
        waitlistRepository.save(waitlist);
        
        Event event = eventService.getEventById(waitlist.getEventId());
        event.getWaitlistedParticipants().remove(waitlist.getVolunteerId());
        eventRepository.save(event);
        
        notifyNextInWaitlist(waitlist.getEventId());
    }
} 