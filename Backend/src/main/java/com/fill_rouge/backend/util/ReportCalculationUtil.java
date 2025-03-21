package com.fill_rouge.backend.util;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ReportCalculationUtil {
    
    public static Map<String, Double> calculateCommonMetrics(List<Map<String, Object>> stats) {
        return Map.of(
            "totalParticipation", calculateTotalParticipation(stats),
            "averageRating", calculateAverageFromStats(stats, "averageRating"),
            "completionRate", calculateCompletionRate(stats)
        );
    }
    
    public static Map<String, Object> calculateBasicStats(
            long participantCount, 
            double averageRating, 
            int totalHours, 
            double successRate) {
        return Map.of(
            "participantCount", (int)participantCount,
            "averageRating", averageRating,
            "totalHours", totalHours,
            "successRate", successRate
        );
    }
    
    public static double calculateTotalParticipation(List<Map<String, Object>> stats) {
        return stats.stream()
            .mapToInt(stat -> (Integer) stat.getOrDefault("totalParticipants", 0))
            .sum();
    }
    
    public static double calculateAverageFromStats(List<Map<String, Object>> stats, String field) {
        return stats.stream()
            .mapToDouble(stat -> (Double) stat.getOrDefault(field, 0.0))
            .average()
            .orElse(0.0);
    }
    
    public static double calculateCompletionRate(List<Map<String, Object>> stats) {
        int completed = stats.stream()
            .mapToInt(stat -> (Boolean) stat.getOrDefault("completed", false) ? 1 : 0)
            .sum();
        return stats.isEmpty() ? 0.0 : (double) completed / stats.size() * 100;
    }
    
    public static Map<String, Integer> convertCategoryStats(List<Map<String, Object>> categoryStats) {
        return categoryStats.stream()
            .collect(Collectors.toMap(
                stat -> (String) stat.get("_id"),
                stat -> (Integer) stat.get("count")
            ));
    }
    
    public static Map<String, Object> buildTimeRangeMetrics(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Map<String, Object> metrics) {
        Map<String, Object> result = Map.of(
            "periodStart", startDate,
            "periodEnd", endDate,
            "generatedAt", LocalDateTime.now()
        );
        result.putAll(metrics);
        return result;
    }
} 