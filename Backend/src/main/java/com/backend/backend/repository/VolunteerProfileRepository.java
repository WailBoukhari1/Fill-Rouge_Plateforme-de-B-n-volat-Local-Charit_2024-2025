package com.backend.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.model.Volunteer;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends MongoRepository<Volunteer, String> {
    Optional<Volunteer> findByEmail(String email);
    Optional<Volunteer> findByUserId(String userId);
    List<Volunteer> findByIsAvailableTrue();
    List<Volunteer> findBySkillsContaining(String skill);
    List<Volunteer> findByLocationContainingIgnoreCase(String location);
} 