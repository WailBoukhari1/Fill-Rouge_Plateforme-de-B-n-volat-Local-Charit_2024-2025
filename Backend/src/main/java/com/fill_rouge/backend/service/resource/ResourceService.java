package com.fill_rouge.backend.service.resource;

import com.fill_rouge.backend.dto.request.ResourceRequest;
import com.fill_rouge.backend.dto.response.ResourceResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {
    // Upload Operations
    ResourceResponse uploadResource(MultipartFile file, String resourceType, String eventId);
    List<ResourceResponse> uploadMultipleResources(List<MultipartFile> files, String resourceType, String eventId);
    
    // Download Operations
    Resource downloadResource(String resourceId);
    ResourceResponse getResource(String resourceId);
    
    // Resource Management
    List<ResourceResponse> getAllResources(String type, String eventId);
    ResourceResponse updateResource(String resourceId, ResourceRequest request);
    void deleteResource(String resourceId);
    List<String> getResourceCategories();
    ResourceResponse getResourceStatistics();
    
    // Organization Resources
    List<ResourceResponse> getOrganizationResources(String organizationId);
    List<ResourceResponse> getEventResources(String eventId);
    
    // Resource Sharing
    ResourceResponse shareResource(String resourceId, List<String> recipientIds);
    ResourceResponse updateResourceAccess(String resourceId, String accessLevel);
    
    // Resource Validation
    void validateResource(MultipartFile file);
    boolean isResourceAccessible(String resourceId, String userId);
    
    // Resource Processing
    void processUploadedResource(String resourceId);
    void generateResourceThumbnail(String resourceId);
    void scanResourceForViruses(String resourceId);
    
    // Resource Search
    List<ResourceResponse> searchResources(String query);
    List<ResourceResponse> findResourcesByType(String type);
    List<ResourceResponse> findResourcesByDateRange(String startDate, String endDate);
    
    // Resource Analytics
    Long getTotalResourceSize(String organizationId);
    Integer getResourceCount(String organizationId);
    List<String> getMostUsedResourceTypes();
    
    // Resource Cleanup
    void cleanupUnusedResources();
    void archiveOldResources();
    void restoreArchivedResource(String resourceId);
    
    // Resource Versioning
    ResourceResponse createResourceVersion(String resourceId, MultipartFile file);
    List<ResourceResponse> getResourceVersions(String resourceId);
    ResourceResponse rollbackToVersion(String resourceId, String versionId);
    
    // Resource Metadata
    void updateResourceMetadata(String resourceId, ResourceRequest metadata);
    void extractResourceMetadata(String resourceId);
    void validateResourceMetadata(ResourceRequest metadata);
} 