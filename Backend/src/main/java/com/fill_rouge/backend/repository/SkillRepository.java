package com.fill_rouge.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.Skill;

@Repository
public interface SkillRepository extends MongoRepository<Skill, String> {
    // Add custom query methods if needed
} 