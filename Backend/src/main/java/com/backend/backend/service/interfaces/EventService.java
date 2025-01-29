package com.backend.backend.service.interfaces;

import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
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
} 