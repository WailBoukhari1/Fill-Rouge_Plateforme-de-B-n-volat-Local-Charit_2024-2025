package com.fill_rouge.backend.service.achievement;

import com.fill_rouge.backend.domain.Achievement;
import com.fill_rouge.backend.domain.VolunteerAchievement;
import com.fill_rouge.backend.repository.AchievementRepository;
import com.fill_rouge.backend.repository.VolunteerAchievementRepository;
import com.fill_rouge.backend.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AchievementServiceImpl implements AchievementService {

    private final AchievementRepository achievementRepository;
    private final VolunteerAchievementRepository volunteerAchievementRepository;

    @Override
    public Achievement createAchievement(Achievement achievement) {
        achievement.setCreatedAt(LocalDateTime.now());
        achievement.setUpdatedAt(LocalDateTime.now());
        return achievementRepository.save(achievement);
    }

    @Override
    public Achievement updateAchievement(String id, Achievement achievement) {
        Achievement existing = getAchievementById(id);
        achievement.setId(existing.getId());
        achievement.setCreatedAt(existing.getCreatedAt());
        achievement.setUpdatedAt(LocalDateTime.now());
        return achievementRepository.save(achievement);
    }

    @Override
    public void deleteAchievement(String id) {
        Achievement achievement = getAchievementById(id);
        achievementRepository.delete(achievement);
    }

    @Override
    public Achievement getAchievementById(String id) {
        return achievementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));
    }

    @Override
    public Page<Achievement> getAllAchievements(Pageable pageable) {
        return achievementRepository.findAll(pageable);
    }

    @Override
    public List<VolunteerAchievement> getVolunteerAchievements(String volunteerId) {
        return volunteerAchievementRepository.findByVolunteerId(volunteerId);
    }

    @Override
    public void checkAndAwardAchievements(String volunteerId) {
        List<Achievement> allAchievements = achievementRepository.findAll();
        for (Achievement achievement : allAchievements) {
            if (!hasEarnedAchievement(volunteerId, achievement.getId())) {
                int progress = calculateAchievementProgress(volunteerId, achievement.getId());
                if (progress == 100) {
                    awardAchievement(volunteerId, achievement.getId());
            } else {
                    updateProgress(volunteerId, achievement.getId(), progress);
                }
            }
        }
    }

    @Override
    public void updateAchievementProgress(String volunteerId, String achievementId) {
        int progress = calculateAchievementProgress(volunteerId, achievementId);
        updateProgress(volunteerId, achievementId, progress);
    }

    @Override
    public boolean hasEarnedAchievement(String volunteerId, String achievementId) {
        return volunteerAchievementRepository
            .findByVolunteerIdAndAchievementId(volunteerId, achievementId)
            .map(va -> va.getProgress() == 100)
            .orElse(false);
    }

    @Override
    public int calculateAchievementProgress(String volunteerId, String achievementId) {
        Achievement achievement = getAchievementById(achievementId);
        // Calculate progress based on achievement criteria
        return 0; // Implement actual calculation logic
    }

    @Override
    public void resetProgress(String volunteerId, String achievementId) {
        volunteerAchievementRepository
            .findByVolunteerIdAndAchievementId(volunteerId, achievementId)
            .ifPresent(va -> {
                va.setProgress(0);
                va.setProgressDetails(null);
                volunteerAchievementRepository.save(va);
            });
    }

    @Override
    public void toggleAchievementDisplay(String volunteerId, String achievementId, boolean display) {
        volunteerAchievementRepository
            .findByVolunteerIdAndAchievementId(volunteerId, achievementId)
            .ifPresent(va -> {
                va.setDisplayed(display);
                volunteerAchievementRepository.save(va);
            });
    }

    @Override
    public List<VolunteerAchievement> getDisplayedAchievements(String volunteerId) {
        return volunteerAchievementRepository.findByVolunteerIdAndIsDisplayedTrue(volunteerId);
    }

    @Override
    public long getTotalEarnedAchievements(String volunteerId) {
        return volunteerAchievementRepository.countByVolunteerIdAndProgressEquals(volunteerId, 100);
    }

    @Override
    public double getCompletionRate(String volunteerId) {
        long total = achievementRepository.count();
        if (total == 0) return 0.0;
        long earned = getTotalEarnedAchievements(volunteerId);
        return (earned * 100.0) / total;
    }

    @Override
    public List<Achievement> getAvailableAchievements(String volunteerId) {
        List<String> earnedIds = getVolunteerAchievements(volunteerId).stream()
            .filter(va -> va.getProgress() == 100)
            .map(VolunteerAchievement::getAchievementId)
            .collect(Collectors.toList());
        return achievementRepository.findByIdNotIn(earnedIds);
    }

    @Override
    public List<Achievement> getInProgressAchievements(String volunteerId) {
        List<String> inProgressIds = getVolunteerAchievements(volunteerId).stream()
            .filter(va -> va.getProgress() > 0 && va.getProgress() < 100)
            .map(VolunteerAchievement::getAchievementId)
            .collect(Collectors.toList());
        return achievementRepository.findByIdIn(inProgressIds);
    }

    private void awardAchievement(String volunteerId, String achievementId) {
        VolunteerAchievement va = volunteerAchievementRepository
            .findByVolunteerIdAndAchievementId(volunteerId, achievementId)
            .orElse(VolunteerAchievement.builder()
                .volunteerId(volunteerId)
                .achievementId(achievementId)
                .build());
        
        va.setProgress(100);
        va.setEarnedAt(LocalDateTime.now());
        va.setDisplayed(true);
        volunteerAchievementRepository.save(va);
    }

    private void updateProgress(String volunteerId, String achievementId, int progress) {
        VolunteerAchievement va = volunteerAchievementRepository
            .findByVolunteerIdAndAchievementId(volunteerId, achievementId)
            .orElse(VolunteerAchievement.builder()
                .volunteerId(volunteerId)
                .achievementId(achievementId)
                .progress(0)
                .build());
        
        va.setProgress(progress);
        va.setUpdatedAt(LocalDateTime.now());
        volunteerAchievementRepository.save(va);
    }
} 