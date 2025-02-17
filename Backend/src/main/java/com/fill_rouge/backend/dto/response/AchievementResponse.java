package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;
import com.fill_rouge.backend.domain.Achievement;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementResponse {
    private String id;
    private String name;
    private String description;
    private String category;
    private int points;
    private LocalDateTime earnedAt;
    private String badgeId;
    private String badgeName;
    private String badgeImageUrl;
    private boolean isPublic;
    private LocalDateTime expiresAt;
    private BadgeResponse badge;
    private int progress;
    private boolean isLocked;
    private String progressStatus;
    private String progressDescription;
    private LocalDateTime lastProgressUpdate;
    private boolean isStackable;
    private int currentStack;
    private int maxStack;
    private String seasonId;
    private boolean isSeasonalAchievement;
    private int bonusPoints;
    private String unlockMessage;
    private boolean isSecret;
    private String organizationId;

    public static AchievementResponse fromAchievement(Achievement achievement, BadgeResponse badge) {
        if (achievement == null) {
            return null;
        }

        return AchievementResponse.builder()
                .id(achievement.getId())
                .name(badge.getName())
                .description(achievement.getDescription())
                .category(achievement.getCategory())
                .points(achievement.getPoints())
                .earnedAt(achievement.getEarnedAt())
                .badgeId(achievement.getBadgeId())
                .badgeName(badge.getName())
                .badgeImageUrl(badge.getImageUrl())
                .isPublic(achievement.getIsPublic())
                .expiresAt(achievement.getExpiresAt())
                .badge(badge)
                .progress(badge.getProgress())
                .isLocked(badge.isLocked())
                .progressStatus(achievement.getProgressStatus())
                .progressDescription(achievement.getProgressDescription())
                .lastProgressUpdate(achievement.getLastProgressUpdate())
                .isStackable(achievement.getIsStackable())
                .currentStack(achievement.getCurrentStack())
                .maxStack(achievement.getMaxStack())
                .seasonId(achievement.getSeasonId())
                .isSeasonalAchievement(achievement.getIsSeasonalAchievement())
                .bonusPoints(achievement.getBonusPoints())
                .unlockMessage(achievement.getUnlockMessage())
                .isSecret(achievement.getIsSecret())
                .organizationId(achievement.getOrganizationId())
                .build();
    }
} 