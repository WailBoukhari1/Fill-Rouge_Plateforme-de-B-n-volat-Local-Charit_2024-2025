package com.backend.backend.controller;

import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.OrganizationResponse;
import com.backend.backend.service.interfaces.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody OrganizationRequest request,
            @RequestHeader("User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.createOrganization(request, userId),
            "Organization created successfully"
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganization(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.getOrganization(id),
            "Organization retrieved successfully"
        ));
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<Page<OrganizationResponse>>> getAllOrganizations(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.getAllOrganizations(pageable),
            "Organizations retrieved successfully"
        ));
    }

    @GetMapping("/search")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<Page<OrganizationResponse>>> searchOrganizations(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.searchOrganizations(query, pageable),
            "Search results retrieved successfully"
        ));
    }

    @GetMapping("/{id}/events")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getOrganizationEvents(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.getOrganizationEvents(id),
            "Organization events retrieved successfully"
        ));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ORGANIZATION') and @securityService.isOrganizationOwner(#id, principal)")
    public ResponseEntity<ApiResponse<Object>> getOrganizationStats(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            Map.of(
                "activeVolunteers", organizationService.getActiveVolunteersCount(id),
                "totalEvents", organizationService.getTotalEventsCount(id)
            ),
            "Organization statistics retrieved successfully"
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
        return ResponseEntity.ok(ApiResponse.success(
            null,
            "Organization deleted successfully"
        ));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> verifyOrganization(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.verifyOrganization(id),
            "Organization verified successfully"
        ));
    }

    @GetMapping("/{id}/verification-status")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<Boolean>> isOrganizationVerified(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.isOrganizationVerified(id),
            "Organization verification status retrieved successfully"
        ));
    }
} 