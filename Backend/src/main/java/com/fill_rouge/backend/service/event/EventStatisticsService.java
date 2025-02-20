package com.fill_rouge.backend.service.event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.dto.response.VolunteerStatsResponse;

public interface EventStatisticsService {
    // Dashboard Statistics
    EventStatisticsResponse getAdminDashboardStats();
    EventStatisticsResponse getAdminDashboardStatsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    EventStatisticsResponse getOrganizationDashboardStats(String organizationId);
    EventStatisticsResponse getOrganizationDashboardStatsByDateRange(String organizationId, LocalDateTime startDate, LocalDateTime endDate);
    EventStatisticsResponse getVolunteerDashboardStats(String volunteerId);
    EventStatisticsResponse getVolunteerDashboardStatsByDateRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Metrics Calculations
    double calculateVolunteerReliabilityScore(String volunteerId);
    double calculateOrganizationRating(String organizationId);
    Map<String, Double> calculateEventSuccessMetrics(String eventId);
    double calculateEventSuccessRate(String eventId);
    
    // Trend Analysis
    Map<String, List<Double>> calculateEventTrends(String organizationId, String metric, int months);
    Map<String, Double> calculateGrowthRates(String organizationId);
    Map<String, Integer> getEventDistributionByCategory(String organizationId);
    
    // Impact Metrics
    Map<String, Double> calculateImpactMetrics(String organizationId);
    double calculateSocialImpactScore(String organizationId);
    Map<String, Object> generateImpactSummary(String organizationId);
    
    // Engagement Metrics
    double calculateVolunteerEngagementRate(String volunteerId);
    double calculateOrganizationEngagementRate(String organizationId);
    Map<String, Double> calculateEngagementTrends(String organizationId);
    
    // Participation Analysis
    Map<String, Integer> analyzeParticipationTrends(String organizationId);
    double calculateAverageParticipationRate(String organizationId);
    Map<String, Object> generateParticipationInsights(String organizationId);
    
    // Performance Metrics
    Map<String, Double> calculatePerformanceMetrics(String organizationId);
    double calculateOverallPerformanceScore(String organizationId);
    Map<String, Object> generatePerformanceReport(String organizationId);

    VolunteerStatsResponse getVolunteerStatistics(String volunteerId);
} 