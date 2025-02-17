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
public class DashboardOverviewResponse {
    private Map<String, Integer> userStats;
    private Map<String, Integer> eventStats;
    private Map<String, Double> impactMetrics;
    private List<Map<String, Object>> recentActivities;
    private Map<String, List<Double>> trends;
    private Map<String, Object> keyPerformanceIndicators;
    private LocalDateTime lastUpdated;
    private Map<String, Object> additionalMetrics;
} 