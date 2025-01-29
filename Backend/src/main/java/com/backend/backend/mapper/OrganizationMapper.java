package com.backend.backend.mapper;

import com.backend.backend.domain.model.Organization;
import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.OrganizationResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrganizationMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "verified", constant = "false")
    Organization toEntity(OrganizationRequest request);
    
    OrganizationResponse toResponse(Organization organization);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateOrganizationFromRequest(OrganizationRequest request, @MappingTarget Organization organization);
} 