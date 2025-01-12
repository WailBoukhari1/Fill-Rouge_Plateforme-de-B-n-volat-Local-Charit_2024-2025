package com.backend.volunteering.service.interfaces;

import com.backend.volunteering.dto.request.OpportunityRequest;
import com.backend.volunteering.dto.response.OpportunityResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IOpportunityService {
    OpportunityResponse createOpportunity(OpportunityRequest opportunityRequest);
    OpportunityResponse getOpportunityById(String id);
    Page<OpportunityResponse> getAllOpportunities(Pageable pageable);
    Page<OpportunityResponse> getOpportunitiesByOrganization(String organizationId, Pageable pageable);
    OpportunityResponse updateOpportunity(String id, OpportunityRequest opportunityRequest);
    void deleteOpportunity(String id);
    void applyForOpportunity(String id);
    void withdrawApplication(String id);
    Page<OpportunityResponse> searchOpportunities(String query, Pageable pageable);
} 