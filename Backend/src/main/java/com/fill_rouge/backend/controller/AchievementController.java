package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.Achievement;
import com.fill_rouge.backend.dto.request.AchievementRequest;
import com.fill_rouge.backend.dto.response.AchievementResponse;
import com.fill_rouge.backend.dto.response.VolunteerAchievementResponse;
import com.fill_rouge.backend.service.achievement.AchievementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/achievements")
@RequiredArgsConstructor    
public class AchievementController {

    private final AchievementService achievementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AchievementResponse> createAchievement(@Valid @RequestBody AchievementRequest request) {
        Achievement achievement = Achievement.builder()
            .name(request.getName())
            .description(request.getDescription())
            .type(request.getType())
            .iconUrl(request.getIconUrl())
            .category(request.getCategory())
            .points(request.getPoints())
            .difficulty(request.getDifficulty())
            .requiredEvents(request.getRequiredEvents())
            .requiredHours(request.getRequiredHours())
            .requiredRating(request.getRequiredRating())
            .prerequisiteAchievementId(request.getPrerequisiteAchievementId())
            .isSecret(request.isSecret())
            .isSpecial(request.isSpecial())
            .isStackable(request.isStackable())
            .maxStack(request.getMaxStack())
            .seasonId(request.getSeasonId())
            .isSeasonalAchievement(request.isSeasonalAchievement())
            .unlockMessage(request.getUnlockMessage())
            .build();
            
        return ResponseEntity.ok(AchievementResponse.builder()
            .id(achievementService.createAchievement(achievement).getId())
            .build());
    }

    @GetMapping
    public ResponseEntity<Page<AchievementResponse>> getAllAchievements(Pageable pageable) {
        return ResponseEntity.ok(achievementService.getAllAchievements(pageable)
            .map(achievement -> AchievementResponse.builder()
                .id(achievement.getId())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .type(achievement.getType())
                .iconUrl(achievement.getIconUrl())
                .points(achievement.getPoints())
                .isActive(achievement.isActive())
                .build()));
    }

    @GetMapping("/{achievementId}")
    public ResponseEntity<AchievementResponse> getAchievement(@PathVariable String achievementId) {
        return ResponseEntity.ok(AchievementResponse.builder()
            .id(achievementService.getAchievementById(achievementId).getId())
            .build());
    }

    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<VolunteerAchievementResponse>> getVolunteerAchievements(@PathVariable String volunteerId) {
        return ResponseEntity.ok(achievementService.getVolunteerAchievements(volunteerId)
            .stream()
            .map(achievement -> VolunteerAchievementResponse.builder()
                .id(achievement.getId())
                .achievementId(achievement.getAchievementId())
                .volunteerId(achievement.getVolunteerId())
                .progress(achievement.getProgress())
                .earnedAt(achievement.getEarnedAt())
                .build())
            .toList());
    }

    @GetMapping("/volunteer/{volunteerId}/progress")
    public ResponseEntity<List<VolunteerAchievementResponse>> getVolunteerProgress(@PathVariable String volunteerId) {
        return ResponseEntity.ok(achievementService.getVolunteerAchievements(volunteerId)
            .stream()
            .filter(achievement -> achievement.getProgress() < 100)
            .map(achievement -> VolunteerAchievementResponse.builder()
                .id(achievement.getId())
                .achievementId(achievement.getAchievementId())
                .volunteerId(achievement.getVolunteerId())
                .progress(achievement.getProgress())
                .build())
            .toList());
    }

    @PostMapping("/volunteer/{volunteerId}/achievements/{achievementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VolunteerAchievementResponse> assignAchievementToVolunteer(
            @PathVariable String volunteerId,
            @PathVariable String achievementId) {
        return ResponseEntity.ok(VolunteerAchievementResponse.builder()
            .id(achievementService.hasEarnedAchievement(volunteerId, achievementId) ? achievementId : null)
            .build());
    }

    @GetMapping("/statistics/organization/{organizationId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<List<AchievementResponse>> getOrganizationAchievementStats(
            @PathVariable String organizationId) {
        // This endpoint might need to be implemented based on your requirements
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<VolunteerAchievementResponse>> getAchievementLeaderboard(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit) {
        // This endpoint might need to be implemented based on your requirements
        return ResponseEntity.ok(List.of());
    }
} 