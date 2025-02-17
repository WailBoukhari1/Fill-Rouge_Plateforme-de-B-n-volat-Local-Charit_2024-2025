package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Organization activity and impact report")
public class OrganizationReportResponse {
    @Schema(description = "Organization identifier", example = "org123")
    private String organizationId;
    
    @Schema(description = "Organization name", example = "Global Help Initiative")
    private String organizationName;
    
    @Schema(description = "Total number of events organized", example = "50")
    private int totalEventsHosted;
    
    @Schema(description = "Total number of volunteers engaged", example = "200")
    private int totalVolunteersEngaged;
    
    @Schema(description = "Total volunteer hours contributed", example = "5000")
    private int totalVolunteerHours;
    
    @Schema(description = "Average event rating (0-5)", example = "4.7")
    private double averageEventRating;
    
    @Schema(description = "Event distribution by category", example = "{\"Education\": 20, \"Healthcare\": 15, \"Environment\": 15}")
    private Map<String, Integer> eventsByCategory;
    
    @Schema(description = "Most frequently requested volunteer skills", example = "[\"Teaching\", \"First Aid\", \"Project Management\"]")
    private List<String> mostRequestedSkills;
    
    @Schema(description = "Impact metrics by area", example = "{\"People Helped\": 1000.0, \"Trees Planted\": 500.0}")
    private Map<String, Double> impactMetrics;
    
    @Schema(description = "Report generation timestamp", example = "2024-03-15T10:30:00")
    private LocalDateTime reportGeneratedAt;
    
    @Schema(description = "Report period start date", example = "2024-01-01T00:00:00")
    private LocalDateTime periodStart;
    
    @Schema(description = "Report period end date", example = "2024-03-15T23:59:59")
    private LocalDateTime periodEnd;
    
    @Schema(description = "Additional statistics and metrics")
    private Map<String, Object> additionalStats;
} 