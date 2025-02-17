package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends MongoRepository<Badge, String> {
    @Query(value = "{ 'isActive': true }")
    List<Badge> findAllActiveBadges();
    
    @Query(value = "{}", fields = "{ 'category': 1 }")
    List<String> findDistinctCategories();
    
    @Query(value = "{ 'organizationId': ?0 }")
    List<Badge> findByOrganizationId(String organizationId);
    
    @Query(value = "{ 'category': ?0 }")
    List<Badge> findByCategory(String category);
    
    @Query(value = "{ 'isAutoAwarded': true }")
    List<Badge> findAutoAwardedBadges();
    
    @Query(value = "{ 'isSeasonalBadge': true, 'seasonId': ?0 }")
    List<Badge> findBySeasonId(String seasonId);
} 