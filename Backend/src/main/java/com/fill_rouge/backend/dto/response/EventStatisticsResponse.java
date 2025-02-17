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
public class EventStatisticsResponse {
    // Core Statistics
    private long participantCount;
    private double averageRating;
    private int totalVolunteerHours;
    private double successRate;
    
    // Event Metrics
    private int totalEvents;
    private int upcomingEventCount;
    private int completedEventCount;
    private Map<String, Integer> eventsByCategory;
    private double averageAttendanceRate;
    
    // Volunteer Metrics
    private int activeVolunteers;
    private int newVolunteers;
    private double volunteerRetentionRate;
    private Map<String, Integer> volunteersBySkill;
    
    // Impact Metrics
    private Map<String, Double> impactByCategory;
    private double socialImpactScore;
    private List<Map<String, Object>> impactHighlights;
    
    // Engagement Metrics
    private double engagementRate;
    private Map<String, Double> engagementTrends;
    private List<Map<String, Object>> topEngagedVolunteers;
    
    // Performance Metrics
    private Map<String, Double> performanceMetrics;
    private double overallPerformanceScore;
    private List<String> performanceInsights;
    
    // Time-based Metrics
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, List<Double>> trends;
    
    // Additional Metrics
    private Map<String, Object> additionalMetrics;
} 