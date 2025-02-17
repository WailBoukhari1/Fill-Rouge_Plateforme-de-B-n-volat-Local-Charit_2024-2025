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
public class EngagementReportResponse {
    private String id;
    private LocalDateTime generatedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, Object> engagementMetrics;
    private Map<String, List<Double>> participationTrends;
    private List<Map<String, Object>> topEngagedVolunteers;
    private List<Map<String, Object>> topEngagedOrganizations;
    private Map<String, Object> additionalMetrics;
} 