package com.fill_rouge.backend.mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventResponse;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    imports = LocalDateTime.class
)
public interface EventMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", expression = "java(LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(LocalDateTime.now())")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "registeredParticipants", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "numberOfRatings", ignore = true)
    Event toEntity(EventRequest request);
    
    @Mapping(target = "currentParticipants", expression = "java(event.getRegisteredParticipants().size())")
    @Mapping(target = "isRegistered", expression = "java(event.getRegisteredParticipants().contains(currentUserId))")
    EventResponse toResponse(Event event, @Context String currentUserId);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "registeredParticipants", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "numberOfRatings", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(LocalDateTime.now())")
    void updateEntity(EventRequest request, @MappingTarget Event event);

    List<EventResponse> toResponseList(List<Event> events, @Context String currentUserId);
    Set<EventResponse> toResponseSet(Set<Event> events, @Context String currentUserId);
}
