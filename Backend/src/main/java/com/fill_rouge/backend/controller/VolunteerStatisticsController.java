package com.fill_rouge.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fill_rouge.backend.domain.VolunteerAchievement;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.dto.response.VolunteerAchievementResponse;
import com.fill_rouge.backend.service.achievement.AchievementService;
import com.fill_rouge.backend.service.event.EventStatisticsService;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteer Statistics", description = "APIs for volunteer statistics")
public class VolunteerStatisticsController {

    private final EventStatisticsService statisticsService;
    private final AchievementService achievementService;
    private final VolunteerProfileService volunteerProfileService;

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

    @GetMapping("/achievements")
    @Operation(summary = "Get volunteer achievements", description = "Get achievements for the authenticated volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<VolunteerAchievementResponse>>> getVolunteerAchievements(
            @RequestHeader("X-User-ID") String volunteerId) {
        List<VolunteerAchievement> achievements = achievementService.getVolunteerAchievements(volunteerId);
        List<VolunteerAchievementResponse> response = achievements.stream()
            .map(achievement -> VolunteerAchievementResponse.builder()
                .id(achievement.getId())
                .volunteerId(achievement.getVolunteerId())
                .achievementId(achievement.getAchievementId())
                .progress(achievement.getProgress())
                .earnedAt(achievement.getEarnedAt())
                .isDisplayed(achievement.isDisplayed())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Volunteer achievements retrieved successfully"));
    }

    @GetMapping("/badges")
    @Operation(summary = "Get volunteer badges", description = "Get badges for the authenticated volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<String>>> getVolunteerBadges(
            @RequestHeader("X-User-ID") String volunteerId) {
        VolunteerProfile profile = volunteerProfileService.getVolunteerProfile(volunteerId);
        List<String> badges = new ArrayList<>(profile.getBadges());
        return ResponseEntity.ok(ApiResponse.success(badges, "Volunteer badges retrieved successfully"));
    }
} 