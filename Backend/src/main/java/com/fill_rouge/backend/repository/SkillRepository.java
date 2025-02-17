package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends MongoRepository<Skill, String> {
    
    List<Skill> findTop10ByOrderByPopularityDesc();
    
    @Query(value = "{ }", fields = "{ 'category': 1 }")
    List<String> findDistinctCategories();
    
    @Query("{ '_id': { $in: ?0 } }")
    @Update("{ $inc: { 'popularity': 1 } }")
    void incrementPopularityForSkills(List<String> skillIds);
    
    @Query("{ '_id': ?0 }")
    @Update("{ $inc: { 'popularity': -1 } }")
    void decrementPopularityForSkill(String skillId);
} 