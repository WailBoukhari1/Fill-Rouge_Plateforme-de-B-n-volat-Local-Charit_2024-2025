package com.fill_rouge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data class for volunteer statistics aggregation results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerStatsDTO {
    private Integer totalEvents;
    private Double averageRating;
    private Integer totalHours;
} 