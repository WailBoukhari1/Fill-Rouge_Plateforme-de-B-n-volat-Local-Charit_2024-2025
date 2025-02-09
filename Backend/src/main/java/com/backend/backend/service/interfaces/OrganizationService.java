package com.backend.backend.service.interfaces;

import com.backend.backend.dto.EventResponse;
import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.OrganizationResponse;
import java.util.List;

public interface OrganizationService {
    OrganizationResponse createOrganization(OrganizationRequest request, String userId);
    OrganizationResponse getOrganization(String id);
    OrganizationResponse updateOrganization(String id, OrganizationRequest request);
    void deleteOrganization(String id);
    OrganizationResponse verifyOrganization(String id);
    List<EventResponse> getOrganizationEvents(String id);
    List<OrganizationResponse> searchOrganizations(String query);
    boolean isOrganizationVerified(String id);
    int getActiveVolunteersCount(String id);
    int getTotalEventsCount(String id);
} 