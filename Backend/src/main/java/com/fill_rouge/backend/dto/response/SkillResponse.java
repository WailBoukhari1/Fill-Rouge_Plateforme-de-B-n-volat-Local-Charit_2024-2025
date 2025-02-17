package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillResponse {
    private String id;
    private String name;
    private String category;
    private String description;
    
    @Builder.Default
    private int endorsements = 0;
    
    @Builder.Default
    private String level = "BEGINNER";
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SkillResponse fromSkill(Skill skill) {
        if (skill == null) {
            return null;
        }
        
        SkillResponseBuilder builder = SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .endorsements(skill.getPopularity() != null ? skill.getPopularity() : 0)
                .createdAt(skill.getCreatedAt())
                .updatedAt(skill.getUpdatedAt());

        // Set level based on endorsements
        if (skill.getPopularity() != null) {
            if (skill.getPopularity() >= 100) {
                builder.level("EXPERT");
            } else if (skill.getPopularity() >= 50) {
                builder.level("INTERMEDIATE");
            } else {
                builder.level("BEGINNER");
            }
        }
        
        return builder.build();
    }

    public boolean isExpertLevel() {
        return "EXPERT".equals(level);
    }

    public boolean isIntermediateLevel() {
        return "INTERMEDIATE".equals(level);
    }

    public boolean isBeginnerLevel() {
        return "BEGINNER".equals(level);
    }

    public String getLevelColor() {
        return switch (level) {
            case "EXPERT" -> "red";
            case "INTERMEDIATE" -> "yellow";
            default -> "green";
        };
    }

    public String getEndorsementText() {
        if (endorsements == 0) {
            return "No endorsements yet";
        } else if (endorsements == 1) {
            return "1 endorsement";
        } else {
            return endorsements + " endorsements";
        }
    }

    public double getProgressToNextLevel() {
        if ("EXPERT".equals(level)) {
            return 100.0;
        } else if ("INTERMEDIATE".equals(level)) {
            return ((endorsements - 50) * 100.0) / 50;
        } else {
            return (endorsements * 100.0) / 50;
        }
    }

    public int getEndorsementsToNextLevel() {
        if ("EXPERT".equals(level)) {
            return 0;
        } else if ("INTERMEDIATE".equals(level)) {
            return Math.max(0, 100 - endorsements);
        } else {
            return Math.max(0, 50 - endorsements);
        }
    }
} 