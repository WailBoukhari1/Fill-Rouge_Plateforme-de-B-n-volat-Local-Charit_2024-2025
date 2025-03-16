package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.service.statistics.StatisticsService;
import com.fill_rouge.backend.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "Statistics management APIs")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/volunteer/{userId}")
    @Operation(summary = "Get volunteer statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<StatisticsResponse.VolunteerStats> getVolunteerStats(
            @PathVariable String userId) {
        return ResponseEntity.ok(statisticsService.getVolunteerStats(userId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER', 'ORGANIZATION')")
    public ResponseEntity<StatisticsResponse> getUserStats(
            @PathVariable String userId) {
        return ResponseEntity.ok(statisticsService.getStatisticsByRole(userId, null));
    }

    @GetMapping("/organizations/statistics")
    @Operation(summary = "Get organization statistics")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<StatisticsResponse.OrganizationStats> getOrganizationStats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(statisticsService.getOrganizationStats(user.getId()));
    }

    @GetMapping("/admin/statistics")
    @Operation(summary = "Get admin statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatisticsResponse.AdminStats> getAdminStats() {
        return ResponseEntity.ok(statisticsService.getAdminStats());
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get statistics based on user role")
    public ResponseEntity<StatisticsResponse> getStatistics(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(statisticsService.getStatisticsByRole(user.getId(), user.getRole()));
    }
} 