package com.backend.backend.service.interfaces;

import com.backend.backend.dto.response.EventRegistrationResponse;
import java.util.List;

public interface EventRegistrationService {
    EventRegistrationResponse registerForEvent(String eventId, String volunteerId);
    void cancelRegistration(String eventId, String volunteerId);
    List<EventRegistrationResponse> getRegistrationsByEvent(String eventId);
    List<EventRegistrationResponse> getRegistrationsByVolunteer(String volunteerId);
} 