package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {
    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Resource type is required")
    private String type;

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotNull(message = "File size is required")
    @Positive(message = "File size must be positive")
    private Long size;

    private String eventId;
    private String organizationId;
    private List<String> sharedWith = new ArrayList<>();
    private String accessLevel = "PRIVATE";
    private Boolean publicAccess = false;
    private String status = "PENDING";
    private String version = "1.0";
    private String checksum;
    private Map<String, String> metadata = new HashMap<>();
    private String mimeType;
    private String originalFilename;
    private Boolean isArchived = false;
    private Boolean isDeleted = false;

    @AssertTrue(message = "Organization ID is required for organization resources")
    private boolean isValidOrganizationResource() {
        if (type != null && type.equalsIgnoreCase("ORGANIZATION")) {
            return organizationId != null && !organizationId.trim().isEmpty();
        }
        return true;
    }

    @AssertTrue(message = "Event ID is required for event resources")
    private boolean isValidEventResource() {
        if (type != null && type.equalsIgnoreCase("EVENT")) {
            return eventId != null && !eventId.trim().isEmpty();
        }
        return true;
    }

    @AssertTrue(message = "Shared with list is required for shared resources")
    private boolean isValidSharedResource() {
        if ("SHARED".equalsIgnoreCase(accessLevel)) {
            return sharedWith != null && !sharedWith.isEmpty();
        }
        return true;
    }
} 