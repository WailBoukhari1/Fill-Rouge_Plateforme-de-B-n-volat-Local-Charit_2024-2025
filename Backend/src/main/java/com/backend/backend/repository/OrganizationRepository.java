package com.backend.backend.repository;

import com.backend.backend.domain.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    boolean existsByUserId(String userId);
    List<Organization> findByNameContainingIgnoreCase(String name);
    List<Organization> findByVerifiedTrue();
    Optional<Organization> findByUserId(String userId);
} 