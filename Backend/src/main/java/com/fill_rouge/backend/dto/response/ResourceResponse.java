package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResourceResponse {
    private String id;
    private String name;
    private String description;
    private String type;
    private String contentType;
    private String filePath;
    private Long size;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private LocalDateTime lastModified;
    private String eventId;
    private String organizationId;
    
    @Builder.Default
    private List<String> sharedWith = new ArrayList<>();
    
    private String accessLevel;
    
    @Builder.Default
    private Boolean publicAccess = false;
    
    @Builder.Default
    private String status = "PENDING";
    
    @Builder.Default
    private String version = "1.0";
    
    private String checksum;
    private String downloadUrl;
    private String thumbnailUrl;
    
    @Builder.Default
    private Integer downloadCount = 0;
    
    private String organizationName;
    private String eventName;

    public static ResourceResponse fromResource(Resource resource) {
        if (resource == null) {
            return null;
        }

        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .contentType(resource.getContentType())
                .filePath(resource.getFilePath())
                .size(resource.getSize())
                .uploadedBy(resource.getUploadedBy())
                .uploadedAt(resource.getUploadedAt())
                .lastModified(resource.getLastModified())
                .eventId(resource.getEventId())
                .organizationId(resource.getOrganizationId())
                .sharedWith(resource.getSharedWith())
                .accessLevel(resource.getAccessLevel())
                .publicAccess(resource.getPublicAccess())
                .status(resource.getStatus())
                .version(resource.getVersion())
                .checksum(resource.getChecksum())
                .build();
    }

    public static ResourceResponse fromResourceWithDetails(Resource resource, String organizationName, String eventName) {
        ResourceResponse response = fromResource(resource);
        if (response != null) {
            response.setOrganizationName(organizationName);
            response.setEventName(eventName);
        }
        return response;
    }

    public boolean isAccessible(String userId, List<String> userRoles) {
        if (Boolean.TRUE.equals(publicAccess)) {
            return true;
        }

        if ("PRIVATE".equals(accessLevel)) {
            return uploadedBy.equals(userId);
        }

        if ("SHARED".equals(accessLevel)) {
            return sharedWith.contains(userId);
        }

        if ("ORGANIZATION".equals(accessLevel)) {
            return userRoles.contains("ORGANIZATION_MEMBER") || 
                   userRoles.contains("ORGANIZATION_ADMIN");
        }

        return false;
    }

    public String getFileExtension() {
        if (name == null) return "";
        int lastDotIndex = name.lastIndexOf('.');
        return lastDotIndex > 0 ? name.substring(lastDotIndex + 1) : "";
    }

    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }

    public boolean isDocument() {
        return contentType != null && 
               (contentType.startsWith("application/pdf") ||
                contentType.startsWith("application/msword") ||
                contentType.startsWith("application/vnd.openxmlformats-officedocument"));
    }

    public String getFormattedSize() {
        if (size == null) return "0 B";
        final String[] units = new String[] { "B", "KB", "MB", "GB", "TB" };
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}