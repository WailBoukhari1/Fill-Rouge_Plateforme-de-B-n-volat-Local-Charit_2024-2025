package com.fill_rouge.backend.service.achievement;

import com.fill_rouge.backend.domain.Achievement;
import com.fill_rouge.backend.domain.Badge;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.Volunteer;
import com.fill_rouge.backend.domain.Communication.CommunicationType;
import com.fill_rouge.backend.dto.request.BadgeRequest;
import com.fill_rouge.backend.dto.response.AchievementResponse;
import com.fill_rouge.backend.dto.response.BadgeResponse;
import com.fill_rouge.backend.dto.response.MilestoneResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.AchievementRepository;
import com.fill_rouge.backend.repository.BadgeRepository;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.VolunteerRepository;
import com.fill_rouge.backend.service.communication.CommunicationService;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AchievementServiceImpl implements AchievementService {

    private final AchievementRepository achievementRepository;
    private final BadgeRepository badgeRepository;
    private final VolunteerRepository volunteerRepository;
    private final EventRepository eventRepository;
    private final CommunicationService communicationService;
    private final VolunteerProfileService volunteerProfileService;

    public AchievementServiceImpl(
            AchievementRepository achievementRepository,
            BadgeRepository badgeRepository,
            VolunteerRepository volunteerRepository,
            EventRepository eventRepository,
            CommunicationService communicationService,
            VolunteerProfileService volunteerProfileService) {
        this.achievementRepository = achievementRepository;
        this.badgeRepository = badgeRepository;
        this.volunteerRepository = volunteerRepository;
        this.eventRepository = eventRepository;
        this.communicationService = communicationService;
        this.volunteerProfileService = volunteerProfileService;
    }

    @Override
    @Transactional
    public BadgeResponse createBadge(BadgeRequest request) {
        Badge badge = new Badge();
        badge.setName(request.getName());
        badge.setDescription(request.getDescription());
        badge.setImageUrl(request.getImageUrl());
        badge.setCategory(request.getCategory());
        badge.setRequiredPoints(request.getRequiredPoints());
        badge.setCriteria(request.getCriteria());
        badge.setIsAutoAwarded(request.getIsAutoAwarded());
        badge.setLevel(request.getLevel());
        badge.setIsActive(request.getIsActive());
        badge.setPrerequisiteBadgeId(request.getPrerequisiteBadgeId());
        badge.setPointsBonus(request.getPointsBonus());
        badge.setRarity(request.getRarity());
        badge.setTier(request.getTier());
        badge.setIsLimited(request.getIsLimited());
        badge.setMaxAwards(request.getMaxAwards());
        badge.setAvailableFrom(request.getAvailableFrom());
        badge.setAvailableUntil(request.getAvailableUntil());
        badge.setIsRepeatable(request.getIsRepeatable());
        badge.setCooldownDays(request.getCooldownDays());
        badge.setSeasonId(request.getSeasonId());
        badge.setIsSeasonalBadge(request.getIsSeasonalBadge());
        badge.setBadgeGroupId(request.getBadgeGroupId());
        badge.setGroupOrder(request.getGroupOrder());
        badge.setIsStackable(request.getIsStackable());
        badge.setMaxStacks(request.getMaxStacks());
        badge.setOrganizationId(request.getOrganizationId());
        
        Badge savedBadge = badgeRepository.save(badge);
        return BadgeResponse.fromBadge(savedBadge, 0, false);
    }

    @Override
    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAll()
                .stream()
                .map(badge -> BadgeResponse.fromBadge(badge, 0, false))
                .collect(Collectors.toList());
    }

    @Override
    public BadgeResponse getBadge(String badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + badgeId));
        return BadgeResponse.fromBadge(badge, 0, false);
    }

    @Override
    @Transactional
    public BadgeResponse updateBadge(String badgeId, BadgeRequest request) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + badgeId));
        
        badge.setName(request.getName());
        badge.setDescription(request.getDescription());
        badge.setImageUrl(request.getImageUrl());
        badge.setCategory(request.getCategory());
        badge.setRequiredPoints(request.getRequiredPoints());
        badge.setCriteria(request.getCriteria());
        badge.setIsAutoAwarded(request.getIsAutoAwarded());
        badge.setLevel(request.getLevel());
        badge.setIsActive(request.getIsActive());
        badge.setPrerequisiteBadgeId(request.getPrerequisiteBadgeId());
        badge.setPointsBonus(request.getPointsBonus());
        badge.setRarity(request.getRarity());
        badge.setTier(request.getTier());
        badge.setIsLimited(request.getIsLimited());
        badge.setMaxAwards(request.getMaxAwards());
        badge.setAvailableFrom(request.getAvailableFrom());
        badge.setAvailableUntil(request.getAvailableUntil());
        badge.setIsRepeatable(request.getIsRepeatable());
        badge.setCooldownDays(request.getCooldownDays());
        badge.setSeasonId(request.getSeasonId());
        badge.setIsSeasonalBadge(request.getIsSeasonalBadge());
        badge.setBadgeGroupId(request.getBadgeGroupId());
        badge.setGroupOrder(request.getGroupOrder());
        badge.setIsStackable(request.getIsStackable());
        badge.setMaxStacks(request.getMaxStacks());
        badge.setOrganizationId(request.getOrganizationId());
        badge.setUpdatedAt(LocalDateTime.now());
        
        Badge updatedBadge = badgeRepository.save(badge);
        return BadgeResponse.fromBadge(updatedBadge, 0, false);
    }

    @Override
    @Transactional
    public void deleteBadge(String badgeId) {
        if (!badgeRepository.existsById(badgeId)) {
            throw new ResourceNotFoundException("Badge", badgeId);
        }
        badgeRepository.deleteById(badgeId);
    }

    @Override
    public List<AchievementResponse> getVolunteerAchievements(String volunteerId) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        return achievements.stream()
                .map(achievement -> {
                    Badge badge = badgeRepository.findById(achievement.getBadgeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Badge", achievement.getBadgeId()));
                    return AchievementResponse.fromAchievement(achievement, BadgeResponse.fromBadge(badge, 100, true));
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BadgeResponse> getVolunteerBadges(String volunteerId) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        return achievements.stream()
                .map(achievement -> {
                    Badge badge = badgeRepository.findById(achievement.getBadgeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Badge", achievement.getBadgeId()));
                    return BadgeResponse.fromBadge(badge, 100, true);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<MilestoneResponse> getVolunteerMilestones(String volunteerId) {
        Integer totalPoints = calculateVolunteerPoints(volunteerId);
        List<MilestoneResponse> milestones = new ArrayList<>();
        
        // Define milestone levels
        int[] milestoneLevels = {100, 500, 1000, 2500, 5000, 10000};
        String[] milestoneNames = {
            "Bronze Volunteer", "Silver Volunteer", "Gold Volunteer",
            "Platinum Volunteer", "Diamond Volunteer", "Elite Volunteer"
        };
        
        for (int i = 0; i < milestoneLevels.length; i++) {
            MilestoneResponse milestone = new MilestoneResponse();
            milestone.setId("MILESTONE_" + milestoneLevels[i]);
            milestone.setName(milestoneNames[i]);
            milestone.setDescription("Achieve " + milestoneLevels[i] + " points in volunteering activities");
            milestone.setRequiredPoints(milestoneLevels[i]);
            milestone.setCurrentPoints(totalPoints);
            
            double progress = Math.min(100.0, (totalPoints * 100.0) / milestoneLevels[i]);
            milestone.setProgressPercentage(progress);
            
            if (totalPoints >= milestoneLevels[i]) {
                milestone.setStatus("ACHIEVED");
                milestone.setAchievedAt(LocalDateTime.now()); // In real app, fetch from achievement history
            } else {
                milestone.setStatus("IN_PROGRESS");
                milestone.setPointsToNext(milestoneLevels[i] - totalPoints);
                if (i > 0) {
                    milestone.setNextMilestone(milestoneNames[i]);
                }
            }
            
            milestone.setCategory("POINTS");
            milestones.add(milestone);
        }
        
        return milestones;
    }

    @Override
    public List<AchievementResponse> getVolunteerProgress(String volunteerId) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        List<Badge> allBadges = badgeRepository.findAllActiveBadges();
        
        return allBadges.stream()
                .map(badge -> {
                    Achievement achievement = achievements.stream()
                            .filter(a -> a.getBadgeId().equals(badge.getId()))
                            .findFirst()
                            .orElse(null);
                    
                    if (achievement != null) {
                        return AchievementResponse.fromAchievement(achievement, 
                                BadgeResponse.fromBadge(badge, 100, true));
                    } else {
                        Achievement inProgress = new Achievement();
                        inProgress.setBadgeId(badge.getId());
                        inProgress.setVolunteerId(volunteerId);
                        inProgress.setPoints(calculateVolunteerPoints(volunteerId));
                        inProgress.setIsPublic(true);
                        
                        int progress = calculateProgressForBadge(volunteerId, badge);
                        return AchievementResponse.fromAchievement(inProgress, 
                                BadgeResponse.fromBadge(badge, progress, false));
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BadgeResponse assignBadgeToVolunteer(String volunteerId, String badgeId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", volunteerId));
        
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge", badgeId));

        if (!isEligibleForBadge(volunteerId, badgeId)) {
            throw new IllegalStateException("Volunteer is not eligible for this badge");
        }

        Achievement achievement = new Achievement();
        achievement.setVolunteerId(volunteerId);
        achievement.setBadgeId(badgeId);
        achievement.setEarnedAt(LocalDateTime.now());
        achievement.setDescription("Earned " + badge.getName());
        achievement.setPoints(badge.getRequiredPoints());
        achievement.setCategory(badge.getCategory());
        achievement.setIsPublic(true);

        achievementRepository.save(achievement);
        notifyAchievementEarned(volunteerId, achievement.getId());

        return BadgeResponse.fromBadge(badge, 100, true);
    }

    @Override
    @Transactional
    public void revokeBadgeFromVolunteer(String volunteerId, String badgeId) {
        Achievement achievement = achievementRepository.findByVolunteerIdAndBadgeId(volunteerId, badgeId);
        if (achievement != null) {
            achievementRepository.delete(achievement);
        }
    }

    @Override
    public List<AchievementResponse> getOrganizationAchievementStats(String organizationId) {
        List<Event> organizationEvents = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged()).getContent();
        Set<String> organizationEventIds = organizationEvents.stream()
                .map(Event::getId)
                .collect(Collectors.toSet());
        
        List<Achievement> achievements = achievementRepository.findByEventIds(new ArrayList<>(organizationEventIds));
        Map<String, Long> badgeCounts = achievements.stream()
                .collect(Collectors.groupingBy(Achievement::getBadgeId, Collectors.counting()));
        
        return badgeCounts.entrySet().stream()
                .map(entry -> {
                    Badge badge = badgeRepository.findById(entry.getKey())
                            .orElseThrow(() -> new ResourceNotFoundException("Badge", entry.getKey()));
                    
                    Achievement achievement = new Achievement();
                    achievement.setBadgeId(badge.getId());
                    achievement.setPoints(badge.getRequiredPoints());
                    achievement.setCategory(badge.getCategory());
                    achievement.setIsPublic(true);
                    
                    return AchievementResponse.fromAchievement(achievement, 
                            BadgeResponse.fromBadge(badge, 100, true));
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<AchievementResponse> getAchievementLeaderboard(String category, int limit) {
        List<Achievement> achievements = achievementRepository.findTopAchievements();
        if (category != null) {
            achievements = achievements.stream()
                    .filter(a -> category.equals(a.getCategory()))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        return achievements.stream()
                .map(achievement -> {
                    Badge badge = badgeRepository.findById(achievement.getBadgeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Badge not found"));
                    return AchievementResponse.fromAchievement(achievement, 
                            BadgeResponse.fromBadge(badge, 100, true));
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAchievementCategories() {
        return badgeRepository.findDistinctCategories();
    }

    @Override
    public List<String> getAchievementRules() {
        return Arrays.asList(
            "Complete 5 events to earn the 'Event Master' badge",
            "Accumulate 1000 points to earn the 'Point Master' badge",
            "Participate in events from 5 different categories to earn the 'Diversity' badge",
            "Complete 10 events in the same category to earn the 'Specialist' badge",
            "Refer 5 new volunteers to earn the 'Community Builder' badge",
            "Receive 10 positive reviews to earn the 'Star Volunteer' badge",
            "Complete events in 3 consecutive months to earn the 'Consistency' badge",
            "Lead 3 events to earn the 'Leadership' badge",
            "Mentor 3 new volunteers to earn the 'Mentor' badge",
            "Complete 100 hours of volunteering to earn the 'Time Champion' badge"
        );
    }

    @Override
    @Transactional
    public void checkAndAwardBadges(String volunteerId) {
        List<Badge> eligibleBadges = badgeRepository.findAutoAwardedBadges();
        for (Badge badge : eligibleBadges) {
            if (isEligibleForBadge(volunteerId, badge.getId())) {
                assignBadgeToVolunteer(volunteerId, badge.getId());
            }
        }
    }

    @Override
    @Transactional
    public void processEventCompletion(String volunteerId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        // Award points based on event duration and rating
        int points = event.getDurationHours() * 10; // Base points from duration
        if (event.getAverageRating() > 0) {
            points += event.getAverageRating() * 2; // Bonus points from rating
        }
        
        addPointsToVolunteer(volunteerId, points, "Event completion: " + event.getTitle());
        checkAndAwardBadges(volunteerId);
    }

    @Override
    @Transactional
    public void processVolunteerMilestone(String volunteerId, String milestoneType) {
        switch (milestoneType) {
            case "EVENT_COUNT":
                processEventCountMilestone(volunteerId);
                break;
            case "POINTS":
                processPointsMilestone(volunteerId);
                break;
            case "CATEGORY_DIVERSITY":
                processCategoryDiversityMilestone(volunteerId);
                break;
            case "TIME_SPENT":
                processTimeSpentMilestone(volunteerId);
                break;
            default:
                throw new IllegalArgumentException("Unknown milestone type: " + milestoneType);
        }
    }

    @Override
    public boolean validateAchievementCriteria(String volunteerId, String badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge", badgeId));
        
        switch (badge.getCategory()) {
            case "EVENT_COMPLETION":
                return validateEventCompletionCriteria(volunteerId, badge);
            case "POINTS":
                return validatePointsCriteria(volunteerId, badge);
            case "CATEGORY_MASTERY":
                return validateCategoryMasteryCriteria(volunteerId, badge);
            case "TIME_INVESTMENT":
                return validateTimeInvestmentCriteria(volunteerId, badge);
            default:
                return false;
        }
    }

    @Override
    @Transactional
    public void addPointsToVolunteer(String volunteerId, Integer points, String reason) {
        Achievement pointsAchievement = new Achievement();
        pointsAchievement.setVolunteerId(volunteerId);
        pointsAchievement.setPoints(points);
        pointsAchievement.setDescription(reason);
        pointsAchievement.setEarnedAt(LocalDateTime.now());
        pointsAchievement.setCategory("POINTS");
        pointsAchievement.setIsPublic(true);
        
        achievementRepository.save(pointsAchievement);
        checkAndAwardBadges(volunteerId);
    }

    @Override
    @Transactional
    public void deductPointsFromVolunteer(String volunteerId, Integer points, String reason) {
        Achievement deduction = new Achievement();
        deduction.setVolunteerId(volunteerId);
        deduction.setPoints(-points);
        deduction.setDescription(reason);
        deduction.setEarnedAt(LocalDateTime.now());
        deduction.setCategory("POINTS_DEDUCTION");
        deduction.setIsPublic(false);
        
        achievementRepository.save(deduction);
        checkAndAwardBadges(volunteerId);
    }

    @Override
    @Transactional
    public void updateVolunteerProgress(String volunteerId) {
        checkAndAwardBadges(volunteerId);
    }

    @Override
    public List<MilestoneResponse> getUpcomingMilestones(String volunteerId) {
        Integer currentPoints = calculateVolunteerPoints(volunteerId);
        List<MilestoneResponse> upcomingMilestones = new ArrayList<>();
        
        // Define milestone thresholds
        int[] thresholds = {100, 500, 1000, 2500, 5000, 10000};
        
        // Find next milestone
        for (int threshold : thresholds) {
            if (currentPoints < threshold) {
                MilestoneResponse milestone = new MilestoneResponse();
                milestone.setRequiredPoints(threshold);
                milestone.setCurrentPoints(currentPoints);
                milestone.setPointsToNext(threshold - currentPoints);
                milestone.setProgressPercentage((double) currentPoints / threshold * 100);
                milestone.setName("Points Milestone: " + threshold);
                milestone.setDescription("Reach " + threshold + " points");
                milestone.setCategory("POINTS");
                milestone.setStatus("IN_PROGRESS");
                
                upcomingMilestones.add(milestone);
                
                // Only include next 3 milestones
                if (upcomingMilestones.size() >= 3) {
                    break;
                }
            }
        }
        
        return upcomingMilestones;
    }

    @Override
    public MilestoneResponse getNextMilestone(String volunteerId, String category) {
        Integer currentPoints = calculateVolunteerPoints(volunteerId);
        int[] thresholds = {100, 500, 1000, 2500, 5000, 10000};
        
        // Find next milestone threshold
        int nextThreshold = Arrays.stream(thresholds)
                .filter(t -> t > currentPoints)
                .findFirst()
                .orElse(thresholds[thresholds.length - 1]);
        
        MilestoneResponse milestone = new MilestoneResponse();
        milestone.setRequiredPoints(nextThreshold);
        milestone.setCurrentPoints(currentPoints);
        milestone.setPointsToNext(nextThreshold - currentPoints);
        milestone.setProgressPercentage((double) currentPoints / nextThreshold * 100);
        milestone.setName("Next " + category + " Milestone: " + nextThreshold);
        milestone.setDescription("Reach " + nextThreshold + " points in " + category);
        milestone.setCategory(category);
        milestone.setStatus("IN_PROGRESS");
        
        return milestone;
    }

    @Override
    public void notifyAchievementEarned(String volunteerId, String achievementId) {
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", achievementId));
        
        Badge badge = badgeRepository.findById(achievement.getBadgeId())
                .orElseThrow(() -> new ResourceNotFoundException("Badge", achievement.getBadgeId()));

        String title = "Achievement Earned!";
        String message = String.format("Congratulations! You've earned the %s badge!", badge.getName());
        
        communicationService.sendNotification(
            volunteerId,
            title,
            message,
            CommunicationType.SYSTEM_ALERT,
            achievementId
        );
        
        // Update volunteer profile statistics
        volunteerProfileService.awardBadge(volunteerId, badge.getName());
    }

    @Override
    public void notifyMilestoneReached(String volunteerId, String milestoneId) {
        MilestoneResponse milestone = getNextMilestone(volunteerId, "POINTS");
        
        String title = "Milestone Reached!";
        String message = String.format("Congratulations! You've reached the %s milestone!", milestone.getName());
        
        communicationService.sendNotification(
            volunteerId,
            title,
            message,
            CommunicationType.SYSTEM_ALERT,
            milestoneId
        );
        
        // Update volunteer profile statistics
        volunteerProfileService.updateVolunteerStats(
            volunteerId,
            0, // No hours added
            0.0 // No rating change
        );
    }

    @Override
    public void notifyBadgeExpiring(String volunteerId, String badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found"));

        String title = "Badge Expiring Soon";
        String message = String.format("Your %s badge is about to expire!", badge.getName());
        
        communicationService.sendNotification(
            volunteerId,
            title,
            message,
            CommunicationType.SYSTEM_ALERT,
            badgeId
        );
    }

    @Override
    public boolean isEligibleForBadge(String volunteerId, String badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found"));
        
        // Check if volunteer already has the badge
        Achievement existing = achievementRepository.findByVolunteerIdAndBadgeId(volunteerId, badgeId);
        if (existing != null) {
            return false;
        }

        // Check if volunteer has enough points
        Integer volunteerPoints = calculateVolunteerPoints(volunteerId);
        return volunteerPoints >= badge.getRequiredPoints();
    }

    @Override
    public Integer calculateVolunteerPoints(String volunteerId) {
        return achievementRepository.findByVolunteerId(volunteerId)
                .stream()
                .mapToInt(Achievement::getPoints)
                .sum();
    }

    private Integer calculateEventPoints(Event event) {
        // Base points for completing an event
        int points = 50;
        
        // Additional points based on event duration
        points += event.getDurationHours() * 10;
        
        // Additional points based on impact
        points += event.getPointsAwarded() * 5;
        
        // Additional points for leadership roles
        if (event.getApprovedParticipants().contains(event.getCreatedBy())) {
            points += 100;
        }
        
        return points;
    }

    private void updateEventAchievements(String volunteerId, Event event) {
        // Check for first-time category achievement
        if (isFirstEventInCategory(volunteerId, event.getCategory().toString())) {
            List<Badge> categoryBadges = badgeRepository.findByCategory(event.getCategory().toString());
            if (!categoryBadges.isEmpty()) {
                assignBadgeToVolunteer(volunteerId, categoryBadges.get(0).getId());
            }
        }
        
        // Check for consecutive events achievement
        if (hasCompletedConsecutiveEvents(volunteerId, 5)) {
            Badge consistencyBadge = badgeRepository.findById("consistency_champion")
                    .orElseThrow(() -> new ResourceNotFoundException("Badge", "consistency_champion"));
            assignBadgeToVolunteer(volunteerId, consistencyBadge.getId());
        }
        
        // Check for high impact achievement
        if (event.getPointsAwarded() >= 90) {
            Badge impactBadge = badgeRepository.findById("high_impact")
                    .orElseThrow(() -> new ResourceNotFoundException("Badge", "high_impact"));
            assignBadgeToVolunteer(volunteerId, impactBadge.getId());
        }
    }

    private void checkAndAwardMilestones(String volunteerId) {
        Integer totalPoints = calculateVolunteerPoints(volunteerId);
        int[] milestonePoints = {100, 500, 1000, 2500, 5000, 10000};
        
        for (int points : milestonePoints) {
            if (totalPoints >= points) {
                String milestoneId = "POINTS_" + points;
                if (!hasAchievedMilestone(volunteerId, milestoneId)) {
                    awardMilestone(volunteerId, milestoneId);
                }
            }
        }
    }

    private void processEventCountMilestone(String volunteerId) {
        long eventCount = achievementRepository.findByVolunteerId(volunteerId)
                .stream()
                .filter(a -> a.getEventId() != null)
                .count();
        int[] milestones = {5, 10, 25, 50, 100};
        
        for (int count : milestones) {
            if (eventCount >= count) {
                String milestoneId = "EVENT_COUNT_" + count;
                if (!hasAchievedMilestone(volunteerId, milestoneId)) {
                    awardMilestone(volunteerId, milestoneId);
                }
            }
        }
    }

    private void processPointsMilestone(String volunteerId) {
        Integer points = calculateVolunteerPoints(volunteerId);
        int[] milestones = {100, 500, 1000, 2500, 5000, 10000};
        
        for (int milestone : milestones) {
            if (points >= milestone) {
                String milestoneId = "POINTS_" + milestone;
                if (!hasAchievedMilestone(volunteerId, milestoneId)) {
                    awardMilestone(volunteerId, milestoneId);
                }
            }
        }
    }

    private int calculateProgressForBadge(String volunteerId, Badge badge) {
        if (badge == null) {
            return 0;
        }

        int currentPoints = calculateVolunteerPoints(volunteerId);
        if (currentPoints >= badge.getRequiredPoints()) {
            return 100;
        }

        return (int) ((double) currentPoints / badge.getRequiredPoints() * 100);
    }

    private boolean validateEventCompletionCriteria(String volunteerId, Badge badge) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        long completedEvents = achievements.stream()
                .filter(a -> a.getEventId() != null)
                .count();
        return completedEvents >= badge.getRequiredPoints();
    }

    private boolean validatePointsCriteria(String volunteerId, Badge badge) {
        int totalPoints = calculateVolunteerPoints(volunteerId);
        return totalPoints >= badge.getRequiredPoints();
    }

    private boolean validateCategoryMasteryCriteria(String volunteerId, Badge badge) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        Map<String, Long> categoryCount = achievements.stream()
                .filter(a -> a.getEventId() != null)
                .collect(Collectors.groupingBy(Achievement::getCategory, Collectors.counting()));
        
        return categoryCount.values().stream()
                .anyMatch(count -> count >= badge.getRequiredPoints());
    }

    private boolean validateTimeInvestmentCriteria(String volunteerId, Badge badge) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        int totalHours = achievements.stream()
                .filter(a -> a.getEventId() != null)
                .mapToInt(Achievement::getPoints)
                .sum() / 10; // Convert points back to hours (10 points per hour)
        
        return totalHours >= badge.getRequiredPoints();
    }

    private void processCategoryDiversityMilestone(String volunteerId) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        Set<String> uniqueCategories = achievements.stream()
                .filter(a -> a.getEventId() != null)
                .map(Achievement::getCategory)
                .collect(Collectors.toSet());

        if (uniqueCategories.size() >= 5) {
            Badge diversityBadge = badgeRepository.findByCategory("DIVERSITY")
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (diversityBadge != null) {
                assignBadgeToVolunteer(volunteerId, diversityBadge.getId());
            }
        }
    }

    private void processTimeSpentMilestone(String volunteerId) {
        int totalHours = calculateVolunteerPoints(volunteerId) / 10;
        List<Badge> timeBadges = badgeRepository.findByCategory("TIME_INVESTMENT");
        
        for (Badge badge : timeBadges) {
            if (totalHours >= badge.getRequiredPoints() && 
                !isEligibleForBadge(volunteerId, badge.getId())) {
                assignBadgeToVolunteer(volunteerId, badge.getId());
            }
        }
    }

    private boolean hasAchievedMilestone(String volunteerId, String milestoneId) {
        return achievementRepository.findByVolunteerId(volunteerId)
                .stream()
                .anyMatch(a -> a.getDescription() != null && a.getDescription().contains(milestoneId));
    }

    private void awardMilestone(String volunteerId, String milestoneId) {
        Achievement milestone = new Achievement();
        milestone.setVolunteerId(volunteerId);
        milestone.setDescription("Milestone: " + milestoneId);
        milestone.setEarnedAt(LocalDateTime.now());
        milestone.setCategory("MILESTONE");
        milestone.setIsPublic(true);
        milestone.setPoints(100); // Bonus points for milestone
        
        achievementRepository.save(milestone);
        notifyMilestoneReached(volunteerId, milestoneId);
    }

    private boolean isFirstEventInCategory(String volunteerId, String category) {
        return achievementRepository.findByVolunteerId(volunteerId)
                .stream()
                .noneMatch(a -> category.equals(a.getCategory()) && a.getEventId() != null);
    }

    private boolean hasCompletedConsecutiveEvents(String volunteerId, int count) {
        List<Achievement> achievements = achievementRepository.findByVolunteerId(volunteerId);
        if (achievements.size() < count) return false;

        achievements.sort(Comparator.comparing(Achievement::getEarnedAt).reversed());
        
        for (int i = 0; i < count - 1; i++) {
            LocalDateTime current = achievements.get(i).getEarnedAt();
            LocalDateTime next = achievements.get(i + 1).getEarnedAt();
            
            if (current.minusDays(30).isAfter(next)) {
                return false;
            }
        }
        
        return true;
    }
} 