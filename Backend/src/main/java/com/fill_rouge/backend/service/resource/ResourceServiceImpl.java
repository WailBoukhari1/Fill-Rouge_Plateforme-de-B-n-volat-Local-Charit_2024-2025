package com.fill_rouge.backend.service.resource;

import com.fill_rouge.backend.domain.Resource;
import com.fill_rouge.backend.dto.request.ResourceRequest;
import com.fill_rouge.backend.dto.response.ResourceResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.ResourceRepository;
import com.fill_rouge.backend.service.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.UUID;
import java.util.Comparator;
import java.time.format.DateTimeFormatter;
import java.awt.Image;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
@Service
@Transactional
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {
    private static final Logger logger = LoggerFactory.getLogger(ResourceServiceImpl.class);

    private final ResourceRepository resourceRepository;
    private final StorageService storageService;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
        "application/pdf", 
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    );

    @Override
    @Transactional
    public ResourceResponse uploadResource(MultipartFile file, String resourceType, String eventId) {
        validateResource(file);
        validateResourceType(resourceType);
        
        String filePath = storageService.store(file);
        
        Resource resource = new Resource();
        resource.setName(file.getOriginalFilename());
        resource.setType(resourceType);
        resource.setContentType(file.getContentType());
        resource.setFilePath(filePath);
        resource.setSize(file.getSize());
        resource.setUploadedAt(LocalDateTime.now());
        resource.setLastModified(LocalDateTime.now());
        resource.setEventId(eventId);
        resource.setStatus("PENDING");
        resource.setPublicAccess(false);
        resource.setAccessLevel("PRIVATE");
        resource.setSharedWith(new ArrayList<>());
        resource.setVersion("1.0");
        resource.setChecksum(calculateChecksum(file));
        
        Resource savedResource = resourceRepository.save(resource);
        processUploadedResource(savedResource.getId());
        
        return ResourceResponse.fromResource(savedResource);
    }

    @Override
    @Transactional
    public List<ResourceResponse> uploadMultipleResources(List<MultipartFile> files, String resourceType, String eventId) {
        validateResourceType(resourceType);
        return files.stream()
                .map(file -> uploadResource(file, resourceType, eventId))
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.core.io.Resource downloadResource(String resourceId) {
        Resource resource = getResourceById(resourceId);
        updateLastAccessedTime(resource);
        return storageService.loadAsResource(resource.getFilePath());
    }

    @Override
    public ResourceResponse getResource(String resourceId) {
        Resource resource = getResourceById(resourceId);
        updateLastAccessedTime(resource);
        return ResourceResponse.fromResource(resource);
    }

    @Override
    public List<ResourceResponse> getAllResources(String type, String eventId) {
        List<Resource> resources;
        if (StringUtils.hasText(type) && StringUtils.hasText(eventId)) {
            resources = resourceRepository.findByEventIdAndType(eventId, type);
        } else if (StringUtils.hasText(type)) {
            resources = resourceRepository.findByType(type);
        } else if (StringUtils.hasText(eventId)) {
            resources = resourceRepository.findByEventId(eventId);
        } else {
            resources = resourceRepository.findAll();
        }
        
        return resources.stream()
                .map(ResourceResponse::fromResource)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResourceResponse updateResource(String resourceId, ResourceRequest request) {
        validateResourceRequest(request);
        Resource resource = getResourceById(resourceId);
        
        updateResourceFromRequest(resource, request);
        resource.setLastModified(LocalDateTime.now());
        
        return ResourceResponse.fromResource(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public void deleteResource(String resourceId) {
        Resource resource = getResourceById(resourceId);
        
        try {
            storageService.delete(resource.getFilePath());
            if (resource.getThumbnailPath() != null) {
                storageService.delete(resource.getThumbnailPath());
            }
            resourceRepository.delete(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete resource: " + e.getMessage());
        }
    }

    @Override
    public List<String> getResourceCategories() {
        return resourceRepository.findDistinctTypes();
    }

    @Override
    public ResourceResponse getResourceStatistics() {
        ResourceResponse stats = new ResourceResponse();
        stats.setId("STATISTICS");
        stats.setName("Resource Statistics");
        
        long totalCount = resourceRepository.count();
        long totalSize = resourceRepository.findAll().stream()
                .mapToLong(Resource::getSize)
                .sum();
        
        stats.setDescription(String.format("Total Resources: %d, Total Size: %s", 
                totalCount, formatFileSize(totalSize)));
        stats.setSize(totalSize);
        
        Map<String, Long> typeDistribution = resourceRepository.findAll().stream()
                .collect(Collectors.groupingBy(Resource::getType, Collectors.counting()));
        
        stats.setType("STATISTICS");
        stats.setDownloadCount(calculateTotalDownloads());
        
        return stats;
    }

    @Override
    public List<ResourceResponse> getOrganizationResources(String organizationId) {
        return resourceRepository.findByOrganizationId(organizationId).stream()
                .map(ResourceResponse::fromResource)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> getEventResources(String eventId) {
        return resourceRepository.findByEventId(eventId).stream()
                .map(ResourceResponse::fromResource)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResourceResponse shareResource(String resourceId, List<String> recipientIds) {
        if (recipientIds == null || recipientIds.isEmpty()) {
            throw new IllegalArgumentException("Recipient IDs are required");
        }
        
        Resource resource = getResourceById(resourceId);
        resource.getSharedWith().addAll(recipientIds);
        resource.setLastModified(LocalDateTime.now());
        
        return ResourceResponse.fromResource(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponse updateResourceAccess(String resourceId, String accessLevel) {
        validateAccessLevel(accessLevel);
        
        Resource resource = getResourceById(resourceId);
        resource.setAccessLevel(accessLevel);
        resource.setLastModified(LocalDateTime.now());
        
        return ResourceResponse.fromResource(resourceRepository.save(resource));
    }

    @Override
    public void validateResource(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }
        if (!isAllowedFileType(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed");
        }
    }

    @Override
    public boolean isResourceAccessible(String resourceId, String userId) {
        Resource resource = getResourceById(resourceId);
        
        return resource.getPublicAccess() || 
               resource.getSharedWith().contains(userId) ||
               userId.equals(resource.getUploadedBy());
    }

    @Override
    @Transactional
    public void processUploadedResource(String resourceId) {
        Resource resource = getResourceById(resourceId);
        
        try {
            // Generate thumbnail if it's an image
            if (isImageResource(resource)) {
                generateResourceThumbnail(resource);
            }
            
            // Extract metadata
            extractResourceMetadata(resource);
            
            // Update status
            resource.setStatus("PROCESSED");
            resourceRepository.save(resource);
        } catch (Exception e) {
            resource.setStatus("PROCESSING_FAILED");
            resourceRepository.save(resource);
            throw new RuntimeException("Failed to process resource: " + e.getMessage());
        }
    }

    @Override
    public List<ResourceResponse> searchResources(String query) {
        if (!StringUtils.hasText(query)) {
            return new ArrayList<>();
        }
        
        return resourceRepository.searchByName(query).stream()
                .map(ResourceResponse::fromResource)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> findResourcesByDateRange(String startDate, String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        
        return resourceRepository.findByDateRange(start, end).stream()
                .map(ResourceResponse::fromResource)
                .collect(Collectors.toList());
    }

    @Override
    public void generateResourceThumbnail(String resourceId) {
        Resource resource = getResourceById(resourceId);
        if (!isImageResource(resource)) {
            return;
        }
        try {
            generateResourceThumbnail(resource);
            resourceRepository.save(resource);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate thumbnail: " + e.getMessage());
        }
    }

    @Override
    public void scanResourceForViruses(String resourceId) {
        // This is a placeholder for virus scanning
        // In a production environment, integrate with an antivirus service
        Resource resource = getResourceById(resourceId);
        resource.setStatus("SCANNED");
        resourceRepository.save(resource);
    }

    @Override
    public Integer getResourceCount(String organizationId) {
        return (int) resourceRepository.findByOrganizationId(organizationId).stream()
            .filter(r -> !r.getIsDeleted())
            .count();
    }

    @Override
    @Transactional
    public void cleanupUnusedResources() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(3);
        List<Resource> unusedResources = resourceRepository.findAll().stream()
            .filter(r -> r.getLastModified().isBefore(cutoffDate))
            .filter(r -> !r.getPublicAccess())
            .filter(r -> r.getDownloadCount() == 0)
            .collect(Collectors.toList());

        for (Resource resource : unusedResources) {
            try {
                deleteResource(resource.getId());
            } catch (Exception e) {
                // Log error but continue with other resources
                logger.error("Failed to cleanup resource: {}", resource.getId(), e);
            }
        }
    }

    @Override
    @Transactional
    public void archiveOldResources() {
        LocalDateTime archiveDate = LocalDateTime.now().minusYears(1);
        List<Resource> oldResources = resourceRepository.findAll().stream()
            .filter(r -> r.getLastModified().isBefore(archiveDate))
            .filter(r -> !r.getIsArchived())
            .collect(Collectors.toList());

        for (Resource resource : oldResources) {
            resource.setIsArchived(true);
            resource.setArchivedAt(LocalDateTime.now());
            resource.setStatus("ARCHIVED");
            resourceRepository.save(resource);
        }
    }

    @Override
    @Transactional
    public ResourceResponse createResourceVersion(String resourceId, MultipartFile file) {
        Resource currentResource = getResourceById(resourceId);
        validateResource(file);

        String newVersion = UUID.randomUUID().toString();
        String filePath = storageService.store(file);

        Resource versionResource = new Resource();
        versionResource.setName(currentResource.getName());
        versionResource.setDescription("Version " + newVersion + " of " + currentResource.getName());
        versionResource.setType(currentResource.getType());
        versionResource.setContentType(file.getContentType());
        versionResource.setFilePath(filePath);
        versionResource.setSize(file.getSize());
        versionResource.setUploadedAt(LocalDateTime.now());
        versionResource.setVersion(newVersion);
        versionResource.setStatus("ACTIVE");
        versionResource.setEventId(currentResource.getEventId());
        versionResource.setOrganizationId(currentResource.getOrganizationId());

        return ResourceResponse.fromResource(resourceRepository.save(versionResource));
    }

    @Override
    public List<ResourceResponse> getResourceVersions(String resourceId) {
        Resource resource = getResourceById(resourceId);
        return resourceRepository.findAll().stream()
            .filter(r -> r.getName().equals(resource.getName()))
            .filter(r -> r.getVersion() != null)
            .sorted((r1, r2) -> r2.getUploadedAt().compareTo(r1.getUploadedAt()))
            .map(ResourceResponse::fromResource)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResourceResponse rollbackToVersion(String resourceId, String versionId) {
        Resource currentResource = getResourceById(resourceId);
        Resource versionResource = getResourceById(versionId);

        if (!versionResource.getName().equals(currentResource.getName())) {
            throw new IllegalArgumentException("Version does not belong to this resource");
        }

        // Create backup of current version
        Resource backupResource = new Resource();
        backupResource.setName(currentResource.getName());
        backupResource.setDescription("Backup of " + currentResource.getName());
        backupResource.setType(currentResource.getType());
        backupResource.setContentType(currentResource.getContentType());
        backupResource.setFilePath(currentResource.getFilePath());
        backupResource.setSize(currentResource.getSize());
        backupResource.setUploadedAt(LocalDateTime.now());
        backupResource.setVersion("backup_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        backupResource.setStatus("BACKUP");
        resourceRepository.save(backupResource);

        // Update current resource with version data
        currentResource.setFilePath(versionResource.getFilePath());
        currentResource.setSize(versionResource.getSize());
        currentResource.setContentType(versionResource.getContentType());
        currentResource.setLastModified(LocalDateTime.now());
        currentResource.setVersion(versionResource.getVersion());

        return ResourceResponse.fromResource(resourceRepository.save(currentResource));
    }

    @Override
    @Transactional
    public void updateResourceMetadata(String resourceId, ResourceRequest request) {
        validateResourceMetadata(request);
        updateResource(resourceId, request);
    }

    @Override
    public void validateResourceMetadata(ResourceRequest metadata) {
        if (metadata == null) {
            throw new IllegalArgumentException("Metadata cannot be null");
        }
        if (!StringUtils.hasText(metadata.getName())) {
            throw new IllegalArgumentException("Resource name is required");
        }
        if (!StringUtils.hasText(metadata.getType())) {
            throw new IllegalArgumentException("Resource type is required");
        }
        if (metadata.getAccessLevel() != null) {
            validateAccessLevel(metadata.getAccessLevel());
        }
    }

    @Override
    public List<ResourceResponse> findResourcesByType(String type) {
        if (!StringUtils.hasText(type)) {
            return new ArrayList<>();
        }
        return resourceRepository.findByType(type).stream()
            .map(ResourceResponse::fromResource)
            .collect(Collectors.toList());
    }

    @Override
    public List<String> getMostUsedResourceTypes() {
        return resourceRepository.findDistinctTypes();
    }

    @Override
    public Long getTotalResourceSize(String organizationId) {
        return resourceRepository.findByOrganizationId(organizationId).stream()
            .mapToLong(Resource::getSize)
            .sum();
    }

    @Override
    @Transactional
    public void restoreArchivedResource(String resourceId) {
        Resource resource = getResourceById(resourceId);
        
        if (!resource.getIsArchived()) {
            throw new IllegalStateException("Resource is not archived");
        }
        
        resource.setIsArchived(false);
        resource.setArchivedAt(null);
        resource.setStatus("ACTIVE");
        resource.setLastModified(LocalDateTime.now());
        resourceRepository.save(resource);
    }

    @Override
    public void extractResourceMetadata(String resourceId) {
        Resource resource = getResourceById(resourceId);
        try {
            extractResourceMetadata(resource);
            resourceRepository.save(resource);
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract metadata: " + e.getMessage());
        }
    }

    // Helper methods
    private Resource getResourceById(String resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", resourceId));
    }

    private void updateLastAccessedTime(Resource resource) {
        resource.setLastAccessedAt(LocalDateTime.now());
        resource.setDownloadCount(resource.getDownloadCount() + 1);
        resourceRepository.save(resource);
    }

    private void validateResourceType(String resourceType) {
        if (!StringUtils.hasText(resourceType)) {
            throw new IllegalArgumentException("Resource type is required");
        }
    }

    private void validateResourceRequest(ResourceRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Resource request cannot be null");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("Resource name is required");
        }
        if (!StringUtils.hasText(request.getType())) {
            throw new IllegalArgumentException("Resource type is required");
        }
    }

    private void validateAccessLevel(String accessLevel) {
        Set<String> validLevels = Set.of("PUBLIC", "PRIVATE", "SHARED", "ORGANIZATION");
        if (!validLevels.contains(accessLevel.toUpperCase())) {
            throw new IllegalArgumentException("Invalid access level: " + accessLevel);
        }
    }

    private boolean isAllowedFileType(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType) || 
               ALLOWED_DOCUMENT_TYPES.contains(contentType);
    }

    private void updateResourceFromRequest(Resource resource, ResourceRequest request) {
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setEventId(request.getEventId());
        resource.setOrganizationId(request.getOrganizationId());
        resource.setSharedWith(request.getSharedWith());
        resource.setAccessLevel(request.getAccessLevel());
        resource.setPublicAccess(request.getPublicAccess());
        resource.setStatus(request.getStatus());
    }

    private void generateResourceThumbnail(Resource resource) throws IOException {
        Path originalFile = Paths.get(resource.getFilePath());
        String thumbnailPath = resource.getFilePath() + "_thumb";
        Path thumbnailFile = Paths.get(thumbnailPath);
        
        BufferedImage originalImage = ImageIO.read(originalFile.toFile());
        BufferedImage thumbnail = createThumbnail(originalImage, 200, 200);
        
        String format = resource.getContentType().substring(
            resource.getContentType().lastIndexOf('/') + 1);
        ImageIO.write(thumbnail, format, thumbnailFile.toFile());
        
        resource.setThumbnailPath(thumbnailPath);
        resource.setThumbnailSize(Files.size(thumbnailFile));
    }

    private BufferedImage createThumbnail(BufferedImage original, int width, int height) {
        BufferedImage thumbnail = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        thumbnail.createGraphics()
                .drawImage(original.getScaledInstance(width, height, java.awt.Image.SCALE_SMOOTH), 
                          0, 0, null);
        return thumbnail;
    }

    private void extractResourceMetadata(Resource resource) throws IOException {
        Map<String, String> metadata = new HashMap<>();
        Path filePath = Paths.get(resource.getFilePath());
        
        metadata.put("lastModified", 
            Files.getLastModifiedTime(filePath).toString());
        metadata.put("createdAt", 
            Files.getAttribute(filePath, "creationTime").toString());
        metadata.put("mimeType", 
            Files.probeContentType(filePath));
        
        if (isImageResource(resource)) {
            BufferedImage image = ImageIO.read(filePath.toFile());
            metadata.put("width", String.valueOf(image.getWidth()));
            metadata.put("height", String.valueOf(image.getHeight()));
        }
        
        resource.setMetadata(metadata);
        resource.setMimeType(metadata.get("mimeType"));
    }

    private boolean isImageResource(Resource resource) {
        return ALLOWED_IMAGE_TYPES.contains(resource.getContentType());
    }

    private String calculateChecksum(MultipartFile file) {
        try {
            return UUID.nameUUIDFromBytes(file.getBytes()).toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to calculate checksum: " + e.getMessage());
        }
    }

    private String formatFileSize(long size) {
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double fileSize = size;
        
        while (fileSize > 1024 && unitIndex < units.length - 1) {
            fileSize /= 1024;
            unitIndex++;
        }
        
        return String.format("%.2f %s", fileSize, units[unitIndex]);
    }

    private int calculateTotalDownloads() {
        return resourceRepository.findAll().stream()
                .mapToInt(Resource::getDownloadCount)
                .sum();
    }
} 
