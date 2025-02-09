package com.backend.backend.service.interfaces;

import com.backend.backend.dto.EventResponse;
import com.backend.backend.dto.request.VolunteerProfileRequest;
import com.backend.backend.dto.response.VolunteerProfileResponse;
import java.util.List;

public interface VolunteerService {
    VolunteerProfileResponse createProfile(String email, VolunteerProfileRequest request);
    VolunteerProfileResponse updateProfile(String email, VolunteerProfileRequest request);
    VolunteerProfileResponse getProfile(String email);
    void deleteProfile(String email);
    List<VolunteerProfileResponse> findVolunteersBySkill(String skill);
    List<VolunteerProfileResponse> findVolunteersByLocation(String location);
    void addCompletedEvent(String userId, String eventId);
    void updateHoursContributed(String userId, int hours);
    void registerForEvent(String email, String eventId);
    void cancelEventRegistration(String email, String eventId);
    List<EventResponse> getRegisteredEvents(String email);
    List<EventResponse> getCompletedEvents(String email);
    int getTotalVolunteeringHours(String email);
    boolean isAvailableForEvent(String email, String eventId);
} 