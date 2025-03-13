package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.service.event.EventStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteer Statistics", description = "APIs for volunteer statistics")
public class VolunteerStatisticsController {

    private final EventStatisticsService statisticsService;

    @GetMapping("/statistics")
    @Operation(summary = "Get volunteer statistics", description = "Get statistics for the authenticated volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<EventStatisticsResponse>> getVolunteerStatistics(
            @RequestHeader("X-User-ID") String volunteerId) {
        EventStatisticsResponse stats = statisticsService.getVolunteerDashboardStats(volunteerId);
        return ResponseEntity.ok(ApiResponse.success(stats, "Volunteer statistics retrieved successfully"));
    }

    @GetMapping("/statistics/range")
    @Operation(summary = "Get volunteer statistics by date range", description = "Get statistics for the authenticated volunteer within a date range")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<EventStatisticsResponse>> getVolunteerStatisticsByDateRange(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        EventStatisticsResponse stats = statisticsService.getVolunteerDashboardStatsByDateRange(volunteerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats, "Volunteer statistics retrieved successfully"));
    }

    @GetMapping("/hours")
    @Operation(summary = "Get volunteer hours", description = "Get total volunteer hours for the authenticated volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<Integer>> getVolunteerHours(
            @RequestHeader("X-User-ID") String volunteerId) {
        EventStatisticsResponse stats = statisticsService.getVolunteerDashboardStats(volunteerId);
        return ResponseEntity.ok(ApiResponse.success(stats.getTotalVolunteerHours(), "Volunteer hours retrieved successfully"));
    }

    @GetMapping("/reliability")
    @Operation(summary = "Get volunteer reliability score", description = "Get reliability score for the authenticated volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<Double>> getVolunteerReliabilityScore(
            @RequestHeader("X-User-ID") String volunteerId) {
        double reliabilityScore = statisticsService.calculateVolunteerReliabilityScore(volunteerId);
        return ResponseEntity.ok(ApiResponse.success(reliabilityScore, "Volunteer reliability score retrieved successfully"));
    }
} 