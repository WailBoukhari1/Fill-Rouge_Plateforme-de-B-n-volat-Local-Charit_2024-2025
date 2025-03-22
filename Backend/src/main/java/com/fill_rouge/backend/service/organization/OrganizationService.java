package com.fill_rouge.backend.service.organization;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;

public interface OrganizationService {
    // Core operations
    OrganizationResponse createOrganization(String userId, OrganizationRequest request);
    OrganizationResponse updateOrganization(String organizationId, OrganizationRequest request);
    OrganizationResponse getOrganization(String organizationId);
    OrganizationResponse getOrganizationByUserId(String userId);
    void deleteOrganization(String organizationId);
    
    // Search and filtering
    List<OrganizationResponse> searchOrganizations(String query);
    List<OrganizationResponse> getAllOrganizations();
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
    void addDocument(String organizationId, String documentUrl, String documentType);
    void removeDocument(String organizationId, String documentUrl);
    
    // Profile picture management
    OrganizationResponse uploadProfilePicture(String organizationId, MultipartFile file) throws IOException;
    
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
    
    // Volunteer listing
    List<VolunteerProfileResponse> getOrganizationVolunteers(String organizationId, String sortBy, String sortOrder);
    
    /**
     * Update the status of an organization
     * 
     * @param organizationId The organization ID to update
     * @param status The new status (INCOMPLETE, PENDING, APPROVED, REJECTED)
     * @param reason The reason for rejection (required when status is REJECTED)
     * @return The updated organization
     */
    OrganizationResponse updateOrganizationStatus(String organizationId, String status, String reason);
    
    /**
     * Update the ban status of an organization
     * 
     * @param organizationId The organization ID to update
     * @param banned Whether to ban (true) or unban (false) 
     * @param reason The reason for banning (required when banning)
     * @return The updated organization
     */
    OrganizationResponse updateOrganizationBanStatus(String organizationId, boolean banned, String reason);
}
