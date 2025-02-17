package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MilestoneResponse {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    
    @Builder.Default
    private Integer requiredPoints = 0;
    
    @Builder.Default
    private Integer currentPoints = 0;
    
    @Builder.Default
    private Double progressPercentage = 0.0;
    
    private LocalDateTime achievedAt;
    private String category;
    private String status;
    private String nextMilestone;
    
    @Builder.Default
    private Integer pointsToNext = 0;
    
    private String level;
    private String tier;
    private String badgeId;
    private String rewardDescription;
    private boolean isSecret;
    private LocalDateTime expiresAt;
    private boolean isExpired;
    private String difficulty;
    
    @Builder.Default
    private List<String> prerequisites = new ArrayList<>();
    
    @Builder.Default
    private List<String> unlocksFeatures = new ArrayList<>();
    
    private String organizationId;
    private String organizationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    public boolean isAchieved() {
        return status != null && status.equals("ACHIEVED");
    }

    public boolean isInProgress() {
        return status != null && status.equals("IN_PROGRESS");
    }

    public boolean isLocked() {
        return status != null && status.equals("LOCKED");
    }

    public double calculateProgress() {
        if (requiredPoints == null || requiredPoints == 0 || currentPoints == null) {
            return 0.0;
        }
        return Math.min(100.0, (currentPoints * 100.0) / requiredPoints);
    }

    public void updateProgress(Integer newPoints) {
        if (newPoints != null) {
            this.currentPoints = newPoints;
            this.progressPercentage = calculateProgress();
            
            if (this.requiredPoints != null) {
                this.pointsToNext = Math.max(0, this.requiredPoints - this.currentPoints);
                
                if (this.currentPoints >= this.requiredPoints && this.achievedAt == null) {
                    this.achievedAt = LocalDateTime.now();
                    this.status = "ACHIEVED";
                }
            }
        }
    }

    public boolean isAvailable() {
        return !isExpired && 
               (expiresAt == null || LocalDateTime.now().isBefore(expiresAt)) &&
               (prerequisites == null || prerequisites.isEmpty());
    }

    public boolean canBeUnlocked() {
        return isAvailable() && 
               isLocked() && 
               currentPoints >= requiredPoints;
    }

    public String getDifficultyColor() {
        return switch (difficulty != null ? difficulty.toUpperCase() : "") {
            case "BEGINNER" -> "green";
            case "INTERMEDIATE" -> "yellow";
            case "ADVANCED" -> "orange";
            case "EXPERT" -> "red";
            default -> "gray";
        };
    }

    public String getProgressStatus() {
        if (isAchieved()) {
            return "Completed";
        } else if (isLocked()) {
            return "Locked";
        } else {
            return String.format("%.1f%% Complete", progressPercentage);
        }
    }
} 