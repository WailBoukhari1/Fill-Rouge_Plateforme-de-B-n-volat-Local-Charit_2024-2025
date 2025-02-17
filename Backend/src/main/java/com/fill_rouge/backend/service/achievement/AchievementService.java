package com.fill_rouge.backend.service.achievement;

import com.fill_rouge.backend.dto.request.BadgeRequest;
import com.fill_rouge.backend.dto.response.AchievementResponse;
import com.fill_rouge.backend.dto.response.BadgeResponse;
import com.fill_rouge.backend.dto.response.MilestoneResponse;

import java.util.List;

public interface AchievementService {
    // Badge Management
    BadgeResponse createBadge(BadgeRequest request);
    List<BadgeResponse> getAllBadges();
    BadgeResponse getBadge(String badgeId);
    BadgeResponse updateBadge(String badgeId, BadgeRequest request);
    void deleteBadge(String badgeId);

    // Achievement Management
    List<AchievementResponse> getVolunteerAchievements(String volunteerId);
    List<BadgeResponse> getVolunteerBadges(String volunteerId);
    List<MilestoneResponse> getVolunteerMilestones(String volunteerId);
    List<AchievementResponse> getVolunteerProgress(String volunteerId);
    BadgeResponse assignBadgeToVolunteer(String volunteerId, String badgeId);
    void revokeBadgeFromVolunteer(String volunteerId, String badgeId);

    // Achievement Statistics
    List<AchievementResponse> getOrganizationAchievementStats(String organizationId);
    List<AchievementResponse> getAchievementLeaderboard(String category, int limit);
    List<String> getAchievementCategories();
    List<String> getAchievementRules();

    // Auto-Award System
    void checkAndAwardBadges(String volunteerId);
    void processEventCompletion(String volunteerId, String eventId);
    void processVolunteerMilestone(String volunteerId, String milestoneType);

    // Achievement Validation
    boolean validateAchievementCriteria(String volunteerId, String badgeId);
    boolean isEligibleForBadge(String volunteerId, String badgeId);
    
    // Points Management
    Integer calculateVolunteerPoints(String volunteerId);
    void addPointsToVolunteer(String volunteerId, Integer points, String reason);
    void deductPointsFromVolunteer(String volunteerId, Integer points, String reason);

    // Milestone Tracking
    void updateVolunteerProgress(String volunteerId);
    List<MilestoneResponse> getUpcomingMilestones(String volunteerId);
    MilestoneResponse getNextMilestone(String volunteerId, String category);

    // Notifications
    void notifyAchievementEarned(String volunteerId, String achievementId);
    void notifyMilestoneReached(String volunteerId, String milestoneId);
    void notifyBadgeExpiring(String volunteerId, String badgeId);
} 