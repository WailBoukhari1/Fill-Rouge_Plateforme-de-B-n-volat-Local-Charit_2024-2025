package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.VolunteerAchievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerAchievementRepository extends MongoRepository<VolunteerAchievement, String> {
    List<VolunteerAchievement> findByVolunteerId(String volunteerId);
    Optional<VolunteerAchievement> findByVolunteerIdAndAchievementId(String volunteerId, String achievementId);
    List<VolunteerAchievement> findByVolunteerIdAndIsDisplayedTrue(String volunteerId);
    long countByVolunteerIdAndProgressEquals(String volunteerId, int progress);
    List<VolunteerAchievement> findByVolunteerIdAndProgressBetween(String volunteerId, int minProgress, int maxProgress);
} 