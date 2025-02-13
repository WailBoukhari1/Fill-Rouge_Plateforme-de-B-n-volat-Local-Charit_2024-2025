package com.backend.backend.service.interfaces;

import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.OrganizationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Service interface for managing organizations.
 * Provides functionality for CRUD operations, verification, event management,
 * and statistics for organizations.
 */
public interface OrganizationService {
    
    // Core CRUD Operations
    /**
     * Creates a new organization for a user
     * @param request Organization details
     * @param userId ID of the user creating the organization
     * @return Created organization response
     */
    OrganizationResponse createOrganization(OrganizationRequest request, String userId);
    
    /**
     * Retrieves organization by ID
     * @param id Organization ID
     * @return Organization response
     */
    OrganizationResponse getOrganization(String id);
    
    /**
     * Updates existing organization
     * @param id Organization ID
     * @param request Updated organization details
     * @return Updated organization response
     */
    OrganizationResponse updateOrganization(String id, OrganizationRequest request);
    
    /**
     * Deletes organization by ID
     * @param id Organization ID
     */
    void deleteOrganization(String id);

    // Listing and Search Operations
    /**
     * Retrieves all organizations with pagination
     * @param pageable Pagination information
     * @return Page of organization responses
     */
    Page<OrganizationResponse> getAllOrganizations(Pageable pageable);
    
    /**
     * Searches organizations by name
     * @param query Search query
     * @param pageable Pagination information
     * @return Page of matching organization responses
     */
    Page<OrganizationResponse> searchOrganizations(String query, Pageable pageable);

    // Verification Operations
    /**
     * Verifies an organization
     * @param id Organization ID
     * @return Updated organization response
     */
    OrganizationResponse verifyOrganization(String id);
    
    /**
     * Checks if organization is verified
     * @param id Organization ID
     * @return Verification status
     */
    boolean isOrganizationVerified(String id);

    // Event Management
    /**
     * Retrieves all events for an organization
     * @param id Organization ID
     * @return List of event responses
     */
    List<EventResponse> getOrganizationEvents(String id);

    // Statistics
    /**
     * Gets count of active volunteers for an organization
     * @param id Organization ID
     * @return Number of active volunteers
     */
    int getActiveVolunteersCount(String id);
    
    /**
     * Gets total number of events for an organization
     * @param id Organization ID
     * @return Total number of events
     */
    int getTotalEventsCount(String id);
} 