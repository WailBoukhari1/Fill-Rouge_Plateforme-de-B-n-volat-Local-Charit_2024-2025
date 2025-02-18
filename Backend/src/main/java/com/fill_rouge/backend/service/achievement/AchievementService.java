package com.fill_rouge.backend.service.achievement;

import com.fill_rouge.backend.domain.Achievement;
import com.fill_rouge.backend.domain.VolunteerAchievement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AchievementService {
    // Achievement management
    Achievement createAchievement(Achievement achievement);
    Achievement updateAchievement(String id, Achievement achievement);
    void deleteAchievement(String id);
    Achievement getAchievementById(String id);
    Page<Achievement> getAllAchievements(Pageable pageable);
    
    // Volunteer achievements
    List<VolunteerAchievement> getVolunteerAchievements(String volunteerId);
    void checkAndAwardAchievements(String volunteerId);
    void updateAchievementProgress(String volunteerId, String achievementId);
    boolean hasEarnedAchievement(String volunteerId, String achievementId);
    
    // Achievement progress
    int calculateAchievementProgress(String volunteerId, String achievementId);
    void resetProgress(String volunteerId, String achievementId);
    
    // Achievement display preferences
    void toggleAchievementDisplay(String volunteerId, String achievementId, boolean display);
    List<VolunteerAchievement> getDisplayedAchievements(String volunteerId);
    
    // Statistics
    long getTotalEarnedAchievements(String volunteerId);
    double getCompletionRate(String volunteerId);
    List<Achievement> getAvailableAchievements(String volunteerId);
    List<Achievement> getInProgressAchievements(String volunteerId);
} 