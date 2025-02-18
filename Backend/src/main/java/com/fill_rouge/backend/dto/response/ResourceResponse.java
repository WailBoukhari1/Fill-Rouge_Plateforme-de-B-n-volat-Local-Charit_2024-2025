package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResourceResponse {
    private String id;
    private String name;
    private String description;
    private String type;        // EVENT, ORGANIZATION
    private String contentType; // DOCUMENT, IMAGE, VIDEO, etc.
    private String url;
    private Long size;
    
    // Resource Details
    private String eventId;
    private String eventTitle;
    private String organizationId;
    private String organizationName;
    
    // Access Control
    private String accessLevel;  // PUBLIC, PRIVATE, SHARED
    private boolean publicAccess;
    private String status;      // ACTIVE, ARCHIVED, DELETED
    
    // File Info
    private String version;
    private String checksum;
    private Map<String, String> metadata;
    private String mimeType;
    private String originalFilename;
    
    // Timestamps
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    private String createdBy;
    private String updatedBy;
}