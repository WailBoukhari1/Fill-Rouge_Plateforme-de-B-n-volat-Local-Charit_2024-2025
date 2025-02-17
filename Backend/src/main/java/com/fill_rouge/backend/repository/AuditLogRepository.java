package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.audit.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
} 