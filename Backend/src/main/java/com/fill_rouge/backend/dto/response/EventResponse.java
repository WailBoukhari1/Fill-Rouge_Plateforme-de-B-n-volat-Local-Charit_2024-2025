package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventResponse {
    // Core event information
    private String id;
    private String title;
    private String description;
    private String organizationId;
    private String location;
    private double[] coordinates;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int maxParticipants;
    private int currentParticipants;
    private EventCategory category;
    private EventStatus status;
    
    // Event details
    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();
    private double rating;
    private int numberOfRatings;
    private String impactSummary;
    private int totalVolunteerHours;
    private boolean isVirtual;
    private String virtualMeetingLink;
    private String difficulty;
    private int durationHours;
    
    // Participation status
    @Builder.Default
    private boolean isRegistered = false;
    @Builder.Default
    private boolean isWaitlisted = false;
    private boolean waitlistEnabled;
    private int maxWaitlistSize;
    
    // Contact information
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EventResponse fromEvent(Event event, String currentUserId) {
        if (event == null) return null;

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .organizationId(event.getOrganizationId())
                .location(event.getLocation())
                .coordinates(event.getCoordinates())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .maxParticipants(event.getMaxParticipants())
                .currentParticipants(event.getRegisteredParticipants().size())
                .category(event.getCategory())
                .status(event.getStatus())
                .requiredSkills(event.getRequiredSkills())
                .rating(event.getAverageRating())
                .numberOfRatings(event.getNumberOfRatings())
                .impactSummary(event.getImpactSummary())
                .totalVolunteerHours(event.getTotalVolunteerHours())
                .isVirtual(event.isVirtual())
                .virtualMeetingLink(event.getVirtualMeetingLink())
                .difficulty(event.getDifficulty())
                .durationHours(event.getDurationHours())
                .isRegistered(event.getRegisteredParticipants().contains(currentUserId))
                .isWaitlisted(event.getWaitlistedParticipants().contains(currentUserId))
                .waitlistEnabled(event.isWaitlistEnabled())
                .maxWaitlistSize(event.getMaxWaitlistSize())
                .contactPerson(event.getContactPerson())
                .contactEmail(event.getContactEmail())
                .contactPhone(event.getContactPhone())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    public boolean isRegistrationOpen() {
        return status == EventStatus.APPROVED && 
               currentParticipants < maxParticipants &&
               LocalDateTime.now().isBefore(startDate);
    }

    public boolean isInProgress() {
        LocalDateTime now = LocalDateTime.now();
        return status == EventStatus.APPROVED &&
               now.isAfter(startDate) && 
               now.isBefore(endDate);
    }

    public boolean isCompleted() {
        return status == EventStatus.APPROVED && 
               LocalDateTime.now().isAfter(endDate);
    }

    public int getAvailableSpots() {
        return maxParticipants - currentParticipants;
    }
}
