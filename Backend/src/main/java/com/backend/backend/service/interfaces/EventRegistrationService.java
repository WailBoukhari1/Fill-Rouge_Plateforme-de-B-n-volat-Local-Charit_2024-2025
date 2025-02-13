package com.backend.backend.service.interfaces;

import com.backend.backend.dto.response.EventRegistrationResponse;
import com.backend.backend.model.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EventRegistrationService {
    // Core Registration Operations
    EventRegistrationResponse registerForEvent(String eventId, String volunteerId);
    void cancelRegistration(String eventId, String volunteerId);
    EventRegistrationResponse updateRegistrationStatus(String registrationId, RegistrationStatus newStatus);
    
    // Registration Queries
    Page<EventRegistrationResponse> getRegistrationsByEvent(String eventId, Pageable pageable);
    Page<EventRegistrationResponse> getRegistrationsByVolunteer(String volunteerId, Pageable pageable);
    List<EventRegistrationResponse> getActiveRegistrations(String volunteerId);
    EventRegistrationResponse getRegistration(String eventId, String volunteerId);
    
    // Registration Status Checks
    boolean isRegistered(String eventId, String volunteerId);
    long getRegistrationCount(String eventId);
} 