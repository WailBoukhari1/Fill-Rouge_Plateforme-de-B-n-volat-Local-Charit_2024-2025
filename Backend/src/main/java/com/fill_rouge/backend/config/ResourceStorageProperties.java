package com.fill_rouge.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.resource.storage")
public class ResourceStorageProperties {
    private String uploadDir = "uploads";
    private long maxFileSize = 10485760L; // 10MB
    private String[] allowedFileTypes = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv"};
    private int maxVersions = 5;
    private int cleanupIntervalHours = 24;
    private int tempFileExpiryHours = 1;
} 