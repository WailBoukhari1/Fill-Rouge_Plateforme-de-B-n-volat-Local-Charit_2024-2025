package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.request.BadgeRequest;
import com.fill_rouge.backend.dto.response.AchievementResponse;
import com.fill_rouge.backend.dto.response.BadgeResponse;
import com.fill_rouge.backend.dto.response.MilestoneResponse;
import com.fill_rouge.backend.service.achievement.AchievementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor    
public class AchievementController {

    private final AchievementService achievementService;

    // Badge Management
    @PostMapping("/badges")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BadgeResponse> createBadge(@Valid @RequestBody BadgeRequest request) {
        return ResponseEntity.ok(achievementService.createBadge(request));
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        return ResponseEntity.ok(achievementService.getAllBadges());
    }

    @GetMapping("/badges/{badgeId}")
    public ResponseEntity<BadgeResponse> getBadge(@PathVariable String badgeId) {
        return ResponseEntity.ok(achievementService.getBadge(badgeId));
    }

    // Volunteer Achievements
    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<AchievementResponse>> getVolunteerAchievements(@PathVariable String volunteerId) {
        return ResponseEntity.ok(achievementService.getVolunteerAchievements(volunteerId));
    }

    @GetMapping("/volunteer/{volunteerId}/badges")
    public ResponseEntity<List<BadgeResponse>> getVolunteerBadges(@PathVariable String volunteerId) {
        return ResponseEntity.ok(achievementService.getVolunteerBadges(volunteerId));
    }

    @GetMapping("/volunteer/{volunteerId}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getVolunteerMilestones(@PathVariable String volunteerId) {
        return ResponseEntity.ok(achievementService.getVolunteerMilestones(volunteerId));
    }

    // Achievement Progress
    @GetMapping("/volunteer/{volunteerId}/progress")
    public ResponseEntity<List<AchievementResponse>> getVolunteerProgress(@PathVariable String volunteerId) {
        return ResponseEntity.ok(achievementService.getVolunteerProgress(volunteerId));
    }

    // Manual Badge Assignment (for special cases)
    @PostMapping("/volunteer/{volunteerId}/badges/{badgeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BadgeResponse> assignBadgeToVolunteer(
            @PathVariable String volunteerId,
            @PathVariable String badgeId) {
        return ResponseEntity.ok(achievementService.assignBadgeToVolunteer(volunteerId, badgeId));
    }

    // Achievement Statistics
    @GetMapping("/statistics/organization/{organizationId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<List<AchievementResponse>> getOrganizationAchievementStats(
            @PathVariable String organizationId) {
        return ResponseEntity.ok(achievementService.getOrganizationAchievementStats(organizationId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<AchievementResponse>> getAchievementLeaderboard(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(achievementService.getAchievementLeaderboard(category, limit));
    }

    // Achievement Categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAchievementCategories() {
        return ResponseEntity.ok(achievementService.getAchievementCategories());
    }

    // Achievement Rules
    @GetMapping("/rules")
    public ResponseEntity<List<String>> getAchievementRules() {
        return ResponseEntity.ok(achievementService.getAchievementRules());
    }
} 