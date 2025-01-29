package com.backend.backend.mapper;

import com.backend.backend.domain.model.Event;
import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EventMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    Event toEntity(EventRequest request);
    
    EventResponse toResponse(Event event);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEventFromRequest(EventRequest request, @MappingTarget Event event);
} 