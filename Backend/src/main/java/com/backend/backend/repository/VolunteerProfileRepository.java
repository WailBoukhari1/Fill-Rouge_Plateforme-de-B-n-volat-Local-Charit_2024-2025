package com.backend.backend.repository;

import com.backend.backend.domain.model.Volunteer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

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