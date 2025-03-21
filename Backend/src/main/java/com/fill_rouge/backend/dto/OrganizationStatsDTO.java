package com.fill_rouge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data class for organization statistics aggregation results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationStatsDTO {
    private Integer totalEvents;
    private Integer totalParticipants;
    private Double averageRating;
    private Integer totalHours;
} 