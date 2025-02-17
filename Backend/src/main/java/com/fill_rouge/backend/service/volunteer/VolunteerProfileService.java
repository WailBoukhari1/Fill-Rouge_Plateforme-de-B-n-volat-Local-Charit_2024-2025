package com.fill_rouge.backend.service.volunteer;

import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import java.util.List;

public interface VolunteerProfileService {
    // Core profile operations
    VolunteerProfileResponse createProfile(String volunteerId, VolunteerProfileRequest request);
    VolunteerProfileResponse updateProfile(String volunteerId, VolunteerProfileRequest request);
    VolunteerProfileResponse getProfile(String volunteerId);
    void deleteProfile(String volunteerId);
    
    // Search operations
    List<VolunteerProfileResponse> searchVolunteers(String query);
    
    // Statistics and metrics
    void updateVolunteerStats(String volunteerId, int hoursVolunteered, double rating);
    void updateReliabilityScore(String volunteerId);
    void awardBadge(String volunteerId, String badge);
    
    // Background check operations
    void updateBackgroundCheckStatus(String volunteerId, String status);
    
    // Internal use
    VolunteerProfile getVolunteerProfile(String volunteerId);
} 