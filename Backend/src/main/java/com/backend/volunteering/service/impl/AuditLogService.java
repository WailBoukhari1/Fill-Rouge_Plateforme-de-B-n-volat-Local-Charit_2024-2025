package com.backend.volunteering.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import java.time.Instant;
import com.backend.volunteering.model.AuditLog;
import com.backend.volunteering.util.SecurityUtil;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final MongoTemplate mongoTemplate;
    
    public void logSecurityEvent(String userId, String eventType, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setEventType(eventType);
        log.setDetails(details);
        log.setTimestamp(Instant.now());
        log.setIpAddress(SecurityUtil.getCurrentUserIp());
        
        mongoTemplate.save(log, "audit_logs");
    }
} 