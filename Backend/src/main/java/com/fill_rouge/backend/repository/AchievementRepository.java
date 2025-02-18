package com.fill_rouge.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.Achievement;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    @Query(value = "{}", sort = "{ 'points': -1 }")
    List<Achievement> findTopAchievements();
    
    List<Achievement> findByCategory(String category);
    List<Achievement> findByIsSpecial(boolean isSpecial);
    List<Achievement> findByIdIn(List<String> ids);
    List<Achievement> findByIdNotIn(List<String> ids);
} 