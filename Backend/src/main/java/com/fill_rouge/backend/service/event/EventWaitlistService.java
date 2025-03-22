package com.fill_rouge.backend.service.event;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.exception.AlreadyRegisteredException;
import com.fill_rouge.backend.exception.EventNotFoundException;
import com.fill_rouge.backend.exception.WaitlistDisabledException;
import com.fill_rouge.backend.exception.WaitlistFullException;
import com.fill_rouge.backend.repository.EventRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventWaitlistService {
    private final EventRepository eventRepository;

    @Transactional
    public void joinWaitlist(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (!event.isWaitlistEnabled()) {
            throw new WaitlistDisabledException("Waitlist is not enabled for this event");
        }

        if (event.getRegisteredParticipants().contains(userId)) {
            throw new AlreadyRegisteredException("User is already registered for this event");
        }

        if (event.getWaitlistedParticipants().contains(userId)) {
            throw new AlreadyRegisteredException("User is already on the waitlist");
        }

        if (event.getCurrentWaitlistSize() >= event.getMaxWaitlistSize()) {
            throw new WaitlistFullException("Waitlist is full");
        }

        event.getWaitlistedParticipants().add(userId);
        event.getWaitlistJoinTimes().put(userId, LocalDateTime.now());
        event.setCurrentWaitlistSize(event.getCurrentWaitlistSize() + 1);
        
        eventRepository.save(event);
    }

    @Transactional
    public void leaveWaitlist(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (event.getWaitlistedParticipants().remove(userId)) {
            event.getWaitlistJoinTimes().remove(userId);
            event.setCurrentWaitlistSize(event.getCurrentWaitlistSize() - 1);
            eventRepository.save(event);
        }
    }

    @Transactional
    public void promoteFromWaitlist(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (!event.getWaitlistedParticipants().contains(userId)) {
            throw new EventNotFoundException("User is not on the waitlist");
        }

        if (event.getRegisteredParticipants().size() >= event.getMaxParticipants()) {
            throw new WaitlistFullException("Event is at maximum capacity");
        }

        event.getWaitlistedParticipants().remove(userId);
        event.getWaitlistJoinTimes().remove(userId);
        event.getRegisteredParticipants().add(userId);
        event.setCurrentWaitlistSize(event.getCurrentWaitlistSize() - 1);
        
        eventRepository.save(event);
    }

    public boolean isOnWaitlist(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException("Event not found"));
        return event.getWaitlistedParticipants().contains(userId);
    }

    public int getWaitlistPosition(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (!event.getWaitlistedParticipants().contains(userId)) {
            return -1;
        }

        LocalDateTime userJoinTime = event.getWaitlistJoinTimes().get(userId);
        return (int) event.getWaitlistJoinTimes().entrySet().stream()
            .filter(entry -> entry.getValue().isBefore(userJoinTime))
            .count() + 1;
    }
} 