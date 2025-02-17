package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportResponse {
    private String id;
    private String type;
    private String name;
    private String description;
    private String format;
    private String status;
    private String generatedBy;
    private LocalDateTime generatedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, Object> metadata;
    private Map<String, Object> summary;
    private String downloadUrl;
    private long fileSize;
    private boolean isArchived;
    private LocalDateTime archivedAt;
    private String archivedBy;
    private LocalDateTime expiresAt;
    private int version;
    private Map<String, Object> additionalData;
} 