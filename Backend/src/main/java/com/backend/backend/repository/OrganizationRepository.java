package com.backend.backend.repository;

import com.backend.backend.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    boolean existsByUserId(String userId);
    Page<Organization> findByNameContainingIgnoreCase(String query, Pageable pageable);
    Page<Organization> findByVerifiedTrue(Pageable pageable);
    Page<Organization> findByActiveTrue(Pageable pageable);
    Optional<Organization> findByUserId(String userId);
} 