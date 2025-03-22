package com.fill_rouge.backend.service.volunteer;

import java.util.List;

import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;

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
    
    /**
     * Update the approval status of a volunteer profile
     * 
     * @param volunteerId The volunteer ID to update
     * @param status The new approval status (PENDING, APPROVED, REJECTED)
     * @param reason The reason for rejection (required when status is REJECTED)
     * @return The updated volunteer profile
     */
    VolunteerProfileResponse updateVolunteerApprovalStatus(String volunteerId, String status, String reason);
    
    /**
     * Update the ban status of a volunteer
     * 
     * @param volunteerId The volunteer ID to update
     * @param banned Whether to ban (true) or unban (false)
     * @param reason The reason for banning (required when banning)
     * @return The updated volunteer profile
     */
    VolunteerProfileResponse updateVolunteerBanStatus(String volunteerId, boolean banned, String reason);
} 