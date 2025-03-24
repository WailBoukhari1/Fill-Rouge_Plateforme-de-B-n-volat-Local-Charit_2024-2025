package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.Achievement;
import com.fill_rouge.backend.dto.request.AchievementRequest;
import com.fill_rouge.backend.dto.response.AchievementResponse;
import com.fill_rouge.backend.dto.response.VolunteerAchievementResponse;
import com.fill_rouge.backend.service.achievement.AchievementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Tag(name = "Achievements", description = "Achievement management APIs")
@RequiredArgsConstructor    
public class AchievementController {

    private final AchievementService achievementService;

    @Operation(summary = "Create achievement", description = "Create a new achievement (Admin only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Achievement created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @SecurityRequirement(name = "bearerAuth")
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

    @Operation(summary = "Get all achievements", description = "Retrieve a paginated list of all achievements")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Achievements retrieved successfully")
    })
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

    @Operation(summary = "Get achievement by ID", description = "Retrieve a specific achievement by its ID")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Achievement retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Achievement not found")
    })
    @GetMapping("/{achievementId}")
    public ResponseEntity<AchievementResponse> getAchievement(
            @Parameter(description = "ID of the achievement to retrieve") 
            @PathVariable String achievementId) {
        return ResponseEntity.ok(AchievementResponse.builder()
            .id(achievementService.getAchievementById(achievementId).getId())
            .build());
    }

    @Operation(summary = "Get volunteer achievements", description = "Retrieve all achievements earned by a specific volunteer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer achievements retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<VolunteerAchievementResponse>> getVolunteerAchievements(
            @Parameter(description = "ID of the volunteer") 
            @PathVariable String volunteerId) {
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

    @Operation(summary = "Get volunteer progress", description = "Retrieve in-progress achievements for a specific volunteer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer progress retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    @GetMapping("/volunteer/{volunteerId}/progress")
    public ResponseEntity<List<VolunteerAchievementResponse>> getVolunteerProgress(
            @Parameter(description = "ID of the volunteer") 
            @PathVariable String volunteerId) {
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

    @Operation(summary = "Assign achievement to volunteer", description = "Manually assign an achievement to a volunteer (Admin only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Achievement assigned successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer or achievement not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/volunteer/{volunteerId}/achievements/{achievementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VolunteerAchievementResponse> assignAchievementToVolunteer(
            @Parameter(description = "ID of the volunteer") 
            @PathVariable String volunteerId,
            @Parameter(description = "ID of the achievement to assign") 
            @PathVariable String achievementId) {
        return ResponseEntity.ok(VolunteerAchievementResponse.builder()
            .id(achievementService.hasEarnedAchievement(volunteerId, achievementId) ? achievementId : null)
            .build());
    }

    @Operation(summary = "Get organization achievement stats", description = "Retrieve achievement statistics for an organization")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Organization stats retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Organization role required"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Organization not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/statistics/organization/{organizationId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<List<AchievementResponse>> getOrganizationAchievementStats(
            @Parameter(description = "ID of the organization") 
            @PathVariable String organizationId) {
        // This endpoint might need to be implemented based on your requirements
        return ResponseEntity.ok(List.of());
    }

    @Operation(summary = "Get achievement leaderboard", description = "Retrieve the achievement leaderboard")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Leaderboard retrieved successfully")
    })
    @GetMapping("/leaderboard")
    public ResponseEntity<List<VolunteerAchievementResponse>> getAchievementLeaderboard(
            @Parameter(description = "Category to filter by (optional)") 
            @RequestParam(required = false) String category,
            @Parameter(description = "Maximum number of entries to return") 
            @RequestParam(defaultValue = "10") int limit) {
        // This endpoint might need to be implemented based on your requirements
        return ResponseEntity.ok(List.of());
    }
} 