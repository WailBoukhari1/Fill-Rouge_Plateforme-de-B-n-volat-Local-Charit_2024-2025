package com.backend.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.backend.backend.model.Volunteer;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends MongoRepository<Volunteer, String> {
    Optional<Volunteer> findByUserId(String userId);
    boolean existsByUserId(String userId);
    List<Volunteer> findBySkillsContaining(String skill);
    List<Volunteer> findByLocationContainingIgnoreCase(String location);
} 