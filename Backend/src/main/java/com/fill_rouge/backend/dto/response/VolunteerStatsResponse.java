package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Volunteer statistics and metrics")
public class VolunteerStatsResponse {
    @Schema(description = "Total number of events the volunteer has attended", example = "15")
    @Builder.Default
    private int totalEventsAttended = 0;
    
    @Schema(description = "Total hours contributed to volunteer activities", example = "120")
    @Builder.Default
    private int totalVolunteerHours = 0;
    
    @Schema(description = "Number of badges earned by the volunteer", example = "5")
    @Builder.Default
    private int badgesEarned = 0;
    
    @Schema(description = "Average rating across all events (0-5)", example = "4.5")
    @Builder.Default
    private double averageEventRating = 0.0;
    
    @Schema(description = "Volunteer reliability score (0-100)", example = "95")
    @Builder.Default
    private int reliabilityScore = 100;
} 