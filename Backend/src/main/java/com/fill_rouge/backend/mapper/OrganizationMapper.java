package com.fill_rouge.backend.mapper;

import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", imports = {
        HashSet.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface OrganizationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "verified", constant = "false")
    @Mapping(target = "verificationDate", ignore = true)
    @Mapping(target = "rating", constant = "0.0")
    @Mapping(target = "numberOfRatings", constant = "0")
    @Mapping(target = "totalEventsHosted", constant = "0")
    @Mapping(target = "activeVolunteers", constant = "0")
    @Mapping(target = "totalVolunteerHours", constant = "0")
    @Mapping(target = "impactScore", constant = "0.0")
    @Mapping(target = "documents", expression = "java(new ArrayList<>())")
    @Mapping(target = "focusAreas", expression = "java(new HashSet<>(request.getFocusAreas()))")
    Organization toEntity(OrganizationRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "focusAreas", expression = "java(new HashSet<>(organization.getFocusAreas()))")
    @Mapping(target = "documents", expression = "java(new ArrayList<>(organization.getDocuments()))")
    OrganizationResponse toResponse(Organization organization);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "verified", ignore = true)
    @Mapping(target = "verificationDate", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "numberOfRatings", ignore = true)
    @Mapping(target = "totalEventsHosted", ignore = true)
    @Mapping(target = "activeVolunteers", ignore = true)
    @Mapping(target = "totalVolunteerHours", ignore = true)
    @Mapping(target = "impactScore", ignore = true)
    @Mapping(target = "documents", expression = "java(new ArrayList<>(request.getDocuments()))")
    @Mapping(target = "focusAreas", expression = "java(new HashSet<>(request.getFocusAreas()))")
    void updateEntity(OrganizationRequest request, @MappingTarget Organization organization);

    List<OrganizationResponse> toResponseList(List<Organization> organizations);

    Set<OrganizationResponse> toResponseSet(Set<Organization> organizations);
}