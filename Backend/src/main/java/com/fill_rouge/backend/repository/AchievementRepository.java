package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findByVolunteerId(String volunteerId);
    
    @Query(value = "{ 'volunteerId': ?0, 'badgeId': ?1 }")
    Achievement findByVolunteerIdAndBadgeId(String volunteerId, String badgeId);
    
    @Query(value = "{}", sort = "{ 'points': -1 }")
    List<Achievement> findTopAchievements();
    
    @Query(value = "{ 'eventId': { $in: ?0 } }")
    List<Achievement> findByEventIds(List<String> eventIds);
    
    @Query(value = "{ 'organizationId': ?0 }")
    List<Achievement> findByOrganizationId(String organizationId);
} 