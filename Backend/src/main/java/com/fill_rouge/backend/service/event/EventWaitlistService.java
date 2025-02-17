package com.fill_rouge.backend.service.event;

import com.fill_rouge.backend.domain.EventWaitlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventWaitlistService {
    // Core waitlist operations
    EventWaitlist joinWaitlist(String eventId, String volunteerId);
    void leaveWaitlist(String eventId, String volunteerId);
    
    // Waitlist queries
    Page<EventWaitlist> getEventWaitlist(String eventId, Pageable pageable);
    Page<EventWaitlist> getVolunteerWaitlists(String volunteerId, Pageable pageable);
    int getWaitlistPosition(String eventId, String volunteerId);
    boolean isVolunteerOnWaitlist(String eventId, String volunteerId);
    int getWaitlistCount(String eventId);
    
    // Notification management
    void notifyNextInWaitlist(String eventId);
    void processExpiredNotifications();
} 