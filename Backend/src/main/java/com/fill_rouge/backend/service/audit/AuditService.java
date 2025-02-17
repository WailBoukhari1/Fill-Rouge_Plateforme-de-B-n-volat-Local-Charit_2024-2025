package com.fill_rouge.backend.service.audit;

import com.fill_rouge.backend.domain.audit.AuditLog;
import com.fill_rouge.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void logSecurityEvent(String userId, String action, String details, String status) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDetails(details);
        log.setStatus(status);
        log.setIpAddress(getClientIP(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        
        auditLogRepository.save(log);
    }

    @Async
    public void logResourceAccess(String userId, String resourceType, String resourceId, String action, String status) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setAction(action);
        log.setStatus(status);
        log.setIpAddress(getClientIP(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        
        auditLogRepository.save(log);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
} 