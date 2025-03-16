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

    @GetMapping("/volunteer/{volunteerId}") 
    @Operation(summary = "Get volunteer statistics by ID")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('VOLUNTEER') and #volunteerId == authentication.principal.id)")
    public ResponseEntity<StatisticsResponse.VolunteerStats> getVolunteerStats(
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(statisticsService.getVolunteerStats(volunteerId));
    }

    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get organization statistics by ID")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('ORGANIZATION') and #organizationId == authentication.principal.id)")
    public ResponseEntity<StatisticsResponse.OrganizationStats> getOrganizationStats(
            @PathVariable String organizationId) {
        return ResponseEntity.ok(statisticsService.getOrganizationStats(organizationId));
    }

    @GetMapping("/admin")
    @Operation(summary = "Get admin dashboard statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatisticsResponse.AdminStats> getAdminStats() {
        return ResponseEntity.ok(statisticsService.getAdminStats());
    }

    @GetMapping("/current")
    @Operation(summary = "Get current user's statistics based on their role")
    public ResponseEntity<StatisticsResponse> getCurrentUserStats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(statisticsService.getStatisticsByRole(user.getId(), user.getRole()));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user statistics by ID (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatisticsResponse> getUserStats(
            @PathVariable String userId) {
        return ResponseEntity.ok(statisticsService.getStatisticsByRole(userId, null));
    }
} 