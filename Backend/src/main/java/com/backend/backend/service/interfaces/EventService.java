package com.backend.backend.service.interfaces;

import com.backend.backend.dto.EventRequest;
import com.backend.backend.dto.EventResponse;
import java.util.List;
import java.util.Set;

public interface EventService {
    EventResponse createEvent(EventRequest request, String organizationId);
    EventResponse getEvent(String id);
    List<EventResponse> getAllEvents();
    List<EventResponse> getEventsByOrganization(String organizationId);
    EventResponse updateEvent(String id, EventRequest request);
    void deleteEvent(String id);
    EventResponse publishEvent(String id);
    EventResponse cancelEvent(String id);
    List<EventResponse> searchEvents(String location, Set<String> skills, Double radius);
    EventResponse registerForEvent(String eventId, String username);
    void cancelRegistration(String eventId, String username);
} 