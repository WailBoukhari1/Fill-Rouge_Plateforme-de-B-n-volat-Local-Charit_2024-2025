package com.backend.backend.controller;

import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.OrganizationResponse;
import com.backend.backend.service.interfaces.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody OrganizationRequest request,
            @RequestHeader("User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.createOrganization(request, userId),
            "Organization created successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganization(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getOrganization(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> searchOrganizations(
            @RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.searchOrganizations(query)
        ));
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getOrganizationEvents(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.getOrganizationEvents(id)
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION') and @securityService.isOrganizationOwner(#id, principal)")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @PathVariable String id,
            @Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.updateOrganization(id, request),
            "Organization updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("(hasRole('ORGANIZATION') and @securityService.isOrganizationOwner(#id, principal)) or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(@PathVariable String id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Organization deleted successfully"));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> verifyOrganization(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.verifyOrganization(id),
            "Organization verified successfully"
        ));
    }
} 