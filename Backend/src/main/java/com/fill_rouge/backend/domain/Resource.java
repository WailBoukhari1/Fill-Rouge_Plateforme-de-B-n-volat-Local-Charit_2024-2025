package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Resource name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Resource type is required")
    private String type;

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotBlank(message = "File path is required")
    private String filePath;

    @NotNull(message = "File size is required")
    private Long size;

    @NotBlank(message = "Uploader ID is required")
    private String uploadedBy;

    @NotNull(message = "Upload date is required")
    private LocalDateTime uploadedAt;

    @NotNull(message = "Last modified date is required")
    private LocalDateTime lastModified;

    private String eventId;
    private String organizationId;
    private List<String> sharedWith = new ArrayList<>();
    private String accessLevel = "PRIVATE";
    private Boolean publicAccess = false;
    private String status = "PENDING";
    private String version = "1.0";
    private String checksum;
    private Map<String, String> metadata = new HashMap<>();
    private Integer downloadCount = 0;
    private LocalDateTime lastAccessedAt;
    private String mimeType;
    private Long thumbnailSize;
    private String thumbnailPath;
    private String originalFilename;
    private Boolean isArchived = false;
    private LocalDateTime archivedAt;
    private String archivedBy;
    private Boolean isDeleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;
} 