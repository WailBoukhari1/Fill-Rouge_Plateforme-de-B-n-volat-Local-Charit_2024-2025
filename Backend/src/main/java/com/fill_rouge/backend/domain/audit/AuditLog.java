package com.fill_rouge.backend.domain.audit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Document(collection = "audit_logs")
public class AuditLog {
    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    @Indexed
    private String userId;

    @NotBlank(message = "Action is required")
    @Size(max = 100, message = "Action cannot exceed 100 characters")
    private String action;

    @Size(max = 2000, message = "Details cannot exceed 2000 characters")
    private String details;

    @Size(max = 45, message = "IP address cannot exceed 45 characters")
    private String ipAddress;

    @Size(max = 255, message = "User agent cannot exceed 255 characters")
    private String userAgent;

    @NotNull(message = "Timestamp is required")
    @Indexed
    private LocalDateTime timestamp;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public static AuditLog createLog(String userId, String action, String resourceType, String resourceId) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setStatus("SUCCESS");
        return log;
    }

    public void markAsFailed(String errorDetails) {
        this.status = "FAILED";
        this.details = errorDetails;
    }

    public void addDetails(String details) {
        this.details = details;
    }

    public void setClientInfo(String ipAddress, String userAgent) {
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
} 