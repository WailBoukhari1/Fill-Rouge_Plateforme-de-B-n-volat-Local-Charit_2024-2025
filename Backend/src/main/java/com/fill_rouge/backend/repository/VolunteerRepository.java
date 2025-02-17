package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.Volunteer;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VolunteerRepository extends MongoRepository<Volunteer, String> {
    Optional<Volunteer> findByUser(User user);
    boolean existsByUser(User user);
    Optional<Volunteer> findByUserId(String userId);
} 