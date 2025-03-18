package com.fill_rouge.backend.service.organization;

import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import java.util.List;

public interface OrganizationService {
    // Core operations
    OrganizationResponse createOrganization(String userId, OrganizationRequest request);
    OrganizationResponse updateOrganization(String organizationId, OrganizationRequest request);
    OrganizationResponse getOrganization(String organizationId);
    OrganizationResponse getOrganizationByUserId(String userId);
    void deleteOrganization(String organizationId);
    
    // Search and filtering
    List<OrganizationResponse> searchOrganizations(String query);
    List<OrganizationResponse> findByFocusAreas(List<String> areas);
    List<OrganizationResponse> findNearbyOrganizations(double latitude, double longitude, double radius);
    List<OrganizationResponse> findByCity(String city);
    List<OrganizationResponse> findByCountry(String country);
    List<OrganizationResponse> findByMinimumRating(double minRating);
    List<OrganizationResponse> findAcceptingVolunteers();
    
    // Verification
    void verifyOrganization(String organizationId);
    void rejectVerification(String organizationId, String reason);
    
    // Document management
    void addDocument(String organizationId, String documentUrl);
    void removeDocument(String organizationId, String documentUrl);
    
    // Statistics
    void updateStatistics(String organizationId);
    void updateImpactScore(String organizationId);
    void updateVolunteerCount(String organizationId);
    
    // Volunteer management
    void setAcceptingVolunteers(String organizationId, boolean accepting);
    
    // Validation
    boolean isNameAvailable(String name);
    boolean isRegistrationNumberValid(String registrationNumber);
    boolean isTaxIdValid(String taxId);
}
