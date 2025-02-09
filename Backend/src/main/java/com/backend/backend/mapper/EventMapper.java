package com.backend.backend.mapper;

import com.backend.backend.domain.Event;
import com.backend.backend.dto.EventRequest;
import com.backend.backend.dto.EventResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EventMapper {
    
    Event toEntity(EventRequest request);
    
    @Mapping(target = "isRegistered", ignore = true)
    @Mapping(target = "availableSpots", expression = "java(event.getMaxParticipants() - event.getRegisteredParticipants().size())")
    EventResponse toResponse(Event event);
    
    void updateEventFromRequest(EventRequest request, @MappingTarget Event event);
} 