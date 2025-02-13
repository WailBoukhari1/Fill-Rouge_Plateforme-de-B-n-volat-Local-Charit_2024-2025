package com.backend.backend.mapper;

import com.backend.backend.model.Event;
import com.backend.backend.dto.request.EventRequest;
import com.backend.backend.dto.response.EventResponse;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class EventMapper {
    
    public Event toEntity(EventRequest request) {
        Event event = new Event();
        updateEventFromRequest(request, event);
        return event;
    }
    
    public void updateEventFromRequest(EventRequest request, Event event) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setRequiresApproval(request.isRequiresApproval());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
    }
    
    public EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .organizationId(event.getOrganizationId())
                .category(event.getCategory())
                .imageUrl(event.getImageUrl())
                .requiresApproval(event.isRequiresApproval())
                .status(event.getStatus())
                .registrationDeadline(event.getRegistrationDeadline())
                .build();
    }

    public Map<String, String> detectChanges(Event oldEvent, Event newEvent) {
        Map<String, String> changes = new HashMap<>();
        
        if (!Objects.equals(oldEvent.getTitle(), newEvent.getTitle())) {
            changes.put("Title", newEvent.getTitle());
        }
        
        if (!Objects.equals(oldEvent.getDescription(), newEvent.getDescription())) {
            changes.put("Description", newEvent.getDescription());
        }
        
        if (!Objects.equals(oldEvent.getStartDate(), newEvent.getStartDate())) {
            changes.put("Start Date", newEvent.getStartDate().toString());
        }
        
        if (!Objects.equals(oldEvent.getEndDate(), newEvent.getEndDate())) {
            changes.put("End Date", newEvent.getEndDate().toString());
        }
        
        if (!Objects.equals(oldEvent.getLocation(), newEvent.getLocation())) {
            changes.put("Location", newEvent.getLocation());
        }
        
        if (!Objects.equals(oldEvent.getMaxParticipants(), newEvent.getMaxParticipants())) {
            changes.put("Maximum Participants", String.valueOf(newEvent.getMaxParticipants()));
        }
        
        if (!Objects.equals(oldEvent.getRegistrationDeadline(), newEvent.getRegistrationDeadline())) {
            changes.put("Registration Deadline", 
                newEvent.getRegistrationDeadline() != null ? 
                newEvent.getRegistrationDeadline().toString() : "No deadline");
        }
        
        if (!Objects.equals(oldEvent.getCategory(), newEvent.getCategory())) {
            changes.put("Category", newEvent.getCategory());
        }
        
        if (oldEvent.isRequiresApproval() != newEvent.isRequiresApproval()) {
            changes.put("Approval Required", String.valueOf(newEvent.isRequiresApproval()));
        }
        
        return changes;
    }
} 