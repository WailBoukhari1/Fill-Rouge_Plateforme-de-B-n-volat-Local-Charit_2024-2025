package com.backend.volunteering.service.interfaces;

import com.backend.volunteering.dto.request.OrganizationRequest;
import com.backend.volunteering.dto.response.OrganizationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IOrganizationService {
    OrganizationResponse createOrganization(OrganizationRequest organizationRequest);
    OrganizationResponse getOrganizationById(String id);
    Page<OrganizationResponse> getAllOrganizations(Pageable pageable);
    OrganizationResponse updateOrganization(String id, OrganizationRequest organizationRequest);
    void deleteOrganization(String id);
    void verifyOrganization(String id);
    Page<OrganizationResponse> searchOrganizations(String query, Pageable pageable);
} 