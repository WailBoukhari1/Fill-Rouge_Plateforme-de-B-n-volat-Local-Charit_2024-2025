package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    long countByOrganizationId(String organizationId);
} 