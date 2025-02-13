package com.backend.backend.mapper;

import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.OrganizationResponse;
import com.backend.backend.model.Organization;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class OrganizationMapper {
    
    public Organization toEntity(OrganizationRequest request) {
        Organization organization = new Organization();
        updateOrganizationFromRequest(request, organization);
        return organization;
    }
    
    public void updateOrganizationFromRequest(OrganizationRequest request, Organization organization) {
        organization.setName(request.getName());
        organization.setDescription(request.getDescription());
        organization.setWebsite(request.getWebsite());
        organization.setLogo(request.getLogo());
        organization.setAddress(request.getAddress());
        organization.setPhone(request.getPhone());
        organization.setMission(request.getMission());
        organization.setVision(request.getVision());
    }
    
    public OrganizationResponse toResponse(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .website(organization.getWebsite())
                .logo(organization.getLogo())
                .address(organization.getAddress())
                .phone(organization.getPhone())
                .verified(organization.isVerified())
                .mission(organization.getMission())
                .vision(organization.getVision())
                .active(organization.isActive())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }

    public Map<String, String> detectChanges(Organization oldOrg, Organization newOrg) {
        Map<String, String> changes = new HashMap<>();
        
        if (!Objects.equals(oldOrg.getName(), newOrg.getName())) {
            changes.put("Name", newOrg.getName());
        }
        
        if (!Objects.equals(oldOrg.getDescription(), newOrg.getDescription())) {
            changes.put("Description", newOrg.getDescription());
        }
        
        if (!Objects.equals(oldOrg.getWebsite(), newOrg.getWebsite())) {
            changes.put("Website", newOrg.getWebsite());
        }
        
        if (!Objects.equals(oldOrg.getAddress(), newOrg.getAddress())) {
            changes.put("Address", newOrg.getAddress());
        }
        
        if (!Objects.equals(oldOrg.getPhone(), newOrg.getPhone())) {
            changes.put("Phone", newOrg.getPhone());
        }
        
        if (!Objects.equals(oldOrg.getMission(), newOrg.getMission())) {
            changes.put("Mission", newOrg.getMission());
        }
        
        if (!Objects.equals(oldOrg.getVision(), newOrg.getVision())) {
            changes.put("Vision", newOrg.getVision());
        }
        
        return changes;
    }
} 