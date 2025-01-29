package com.backend.backend.mapper;

import com.backend.backend.domain.model.Volunteer;
import com.backend.backend.dto.request.VolunteerProfileRequest;
import com.backend.backend.dto.response.VolunteerProfileResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VolunteerMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "completedEvents", ignore = true)
    @Mapping(target = "hoursContributed", constant = "0")
    Volunteer toEntity(VolunteerProfileRequest request);
    
    @Mapping(target = "totalEvents", expression = "java(volunteer.getCompletedEvents().size())")
    VolunteerProfileResponse toResponse(Volunteer volunteer);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateVolunteerFromRequest(VolunteerProfileRequest request, @MappingTarget Volunteer volunteer);
} 