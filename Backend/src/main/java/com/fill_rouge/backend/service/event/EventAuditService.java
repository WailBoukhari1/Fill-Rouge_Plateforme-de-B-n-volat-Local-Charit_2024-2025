package com.fill_rouge.backend.service.event;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EventAuditService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventAuditService.class);

    public void logEventCreation(String eventId, String organizerId, String eventTitle) {
        logEventActivity("CREATE", eventId, organizerId, 
            String.format("Event '%s' created by organization", eventTitle));
    }

    public void logEventUpdate(String eventId, String organizerId, String eventTitle) {
        logEventActivity("UPDATE", eventId, organizerId,
            String.format("Event '%s' updated", eventTitle));
    }

    public void logEventCancellation(String eventId, String organizerId, String reason) {
        logEventActivity("CANCEL", eventId, organizerId,
            String.format("Event cancelled. Reason: %s", reason));
    }

    public void logParticipantRegistration(String eventId, String userId, String eventTitle) {
        logEventActivity("REGISTER", eventId, userId,
            String.format("User registered for event '%s'", eventTitle));
    }

    public void logParticipantUnregistration(String eventId, String userId, String reason) {
        logEventActivity("UNREGISTER", eventId, userId,
            String.format("User unregistered from event. Reason: %s", reason));
    }

    public void logParticipantCheckIn(String eventId, String userId, String eventTitle) {
        logEventActivity("CHECK_IN", eventId, userId,
            String.format("User checked in to event '%s'", eventTitle));
    }

    public void logParticipantNoShow(String eventId, String userId, String reason) {
        logEventActivity("NO_SHOW", eventId, userId,
            String.format("User marked as no-show. Reason: %s", reason));
    }

    public void logPointsAwarded(String eventId, String userId, int points) {
        logEventActivity("POINTS_AWARDED", eventId, userId,
            String.format("Awarded %d points to user", points));
    }

    private void logEventActivity(String action, String eventId, String userId, String description) {
        String logMessage = String.format(
            "EVENT_AUDIT|%s|EventId:%s|UserId:%s|Time:%s|%s",
            action,
            eventId,
            userId,
            LocalDateTime.now(),
            description
        );
        logger.info(logMessage);
    }
} 