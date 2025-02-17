package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ImpactReportResponse {
    private int totalVolunteers;
    private int totalOrganizations;
    private int totalEvents;
    private int totalVolunteerHours;
    private Map<String, Integer> impactByCategory;
    private Map<String, Double> keyMetrics;
    private List<Map<String, Object>> successStories;
    private Map<String, List<String>> skillsDistribution;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, Object> additionalMetrics;
} 