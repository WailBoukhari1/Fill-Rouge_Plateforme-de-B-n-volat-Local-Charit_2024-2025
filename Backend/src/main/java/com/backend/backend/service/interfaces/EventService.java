package com.backend.backend.service.interfaces;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.EventStatsResponse;
import com.backend.backend.model.EventStatus;

public interface EventService {
    // Core Event Operations
    EventResponse createEvent(EventRequest request, String organizationId);
    EventResponse updateEvent(String id, EventRequest request);
    void deleteEvent(String id);
    EventResponse getEvent(String id);
    Page<EventResponse> getAllEvents(Pageable pageable);
    
    // Event Status Management
    EventResponse publishEvent(String id);
    EventResponse cancelEvent(String id);
    EventResponse postponeEvent(String id, LocalDateTime newDateTime);
    
    // Event Registration
    void registerVolunteer(String eventId, String volunteerId);
    void unregisterVolunteer(String eventId, String volunteerId);
    List<EventResponse> getVolunteerEvents(String volunteerId, boolean includeHistory);
    List<EventResponse> getOrganizationEvents(String organizationId, boolean includeHistory);
    
    // Event Search
    Page<EventResponse> searchEvents(
        String query,
        List<String> categories,
        String location,
        Double radius,
        List<EventStatus> status,
        Boolean pendingApproval,
        Boolean isDraft,
        Boolean isOwner,
        Boolean hasRegistrations,
        Boolean isRegistered,
        Boolean skillMatch,
        Boolean availableSpots,
        Boolean registrationOpen,
        String userId,
        Pageable pageable
    );
    List<EventResponse> getUpcomingEvents(int days);
    
    // Event Statistics
    EventStatsResponse getEventStats(String eventId);
    EventStatsResponse getOrganizationEventStats(String organizationId);
    
    // Event Notifications
    void scheduleEventReminders();
    void notifyEventParticipants(String eventId, String message);

    List<String> getCategories();
} 