package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "volunteer_achievements")
@CompoundIndex(name = "volunteer_achievement_idx", def = "{'volunteerId': 1, 'achievementId': 1}", unique = true)
public class VolunteerAchievement {
    @Id
    private String id;
    
    private String volunteerId;
    private String achievementId;
    private LocalDateTime earnedAt;
    private boolean isDisplayed;     // Whether volunteer chooses to display this achievement
    private int progress;            // Progress towards achievement (0-100)
    private String progressDetails;  // JSON string containing detailed progress info
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
} 