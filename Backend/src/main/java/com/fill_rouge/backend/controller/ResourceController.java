package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.request.ResourceRequest;
import com.fill_rouge.backend.dto.response.ResourceResponse;
import com.fill_rouge.backend.service.resource.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // File Upload
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<ResourceResponse> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String resourceType,
            @RequestParam(required = false) String eventId) {
        return ResponseEntity.ok(resourceService.uploadResource(file, resourceType, eventId));
    }

    // Bulk Upload
    @PostMapping("/upload/bulk")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<ResourceResponse>> uploadMultipleResources(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("type") String resourceType,
            @RequestParam(required = false) String eventId) {
        return ResponseEntity.ok(resourceService.uploadMultipleResources(files, resourceType, eventId));
    }

    // Download Resource
    @GetMapping("/{resourceId}")
    public ResponseEntity<Resource> downloadResource(@PathVariable String resourceId) {
        ResourceResponse resource = resourceService.getResource(resourceId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resource.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getName() + "\"")
                .body(resourceService.downloadResource(resourceId));
    }

    // Resource Metadata
    @GetMapping("/{resourceId}/metadata")
    public ResponseEntity<ResourceResponse> getResourceMetadata(@PathVariable String resourceId) {
        return ResponseEntity.ok(resourceService.getResource(resourceId));
    }

    // List Resources
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String eventId) {
        return ResponseEntity.ok(resourceService.getAllResources(type, eventId));
    }

    // Update Resource Metadata
    @PutMapping("/{resourceId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<ResourceResponse> updateResourceMetadata(
            @PathVariable String resourceId,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(resourceId, request));
    }

    // Delete Resource
    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }

    // Resource Categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getResourceCategories() {
        return ResponseEntity.ok(resourceService.getResourceCategories());
    }

    // Resource Statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> getResourceStatistics() {
        return ResponseEntity.ok(resourceService.getResourceStatistics());
    }

    // Organization Resources
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<ResourceResponse>> getOrganizationResources(
            @PathVariable String organizationId) {
        return ResponseEntity.ok(resourceService.getOrganizationResources(organizationId));
    }

    // Event Resources
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ResourceResponse>> getEventResources(@PathVariable String eventId) {
        return ResponseEntity.ok(resourceService.getEventResources(eventId));
    }

    // Resource Sharing
    @PostMapping("/{resourceId}/share")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<ResourceResponse> shareResource(
            @PathVariable String resourceId,
            @RequestParam List<String> recipientIds) {
        return ResponseEntity.ok(resourceService.shareResource(resourceId, recipientIds));
    }

    // Resource Access Control
    @PutMapping("/{resourceId}/access")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<ResourceResponse> updateResourceAccess(
            @PathVariable String resourceId,
            @RequestParam String accessLevel) {
        return ResponseEntity.ok(resourceService.updateResourceAccess(resourceId, accessLevel));
    }
} 