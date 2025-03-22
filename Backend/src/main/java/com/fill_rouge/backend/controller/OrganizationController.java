package com.fill_rouge.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fill_rouge.backend.constant.ValidationConstants;
import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.request.DocumentUrlRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.service.organization.OrganizationService;
import com.fill_rouge.backend.constant.OrganizationStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
@Tag(name = "Organization Management", description = "Endpoints for managing organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @Operation(summary = "Create organization", description = "Create a new organization profile")
    @ApiResponse(responseCode = "201", description = "Organization created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request data")
    public ResponseEntity<OrganizationResponse> createOrganization(
            @RequestHeader("X-User-ID") String userId,
            @Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(organizationService.createOrganization(userId, request));
    }

    @PutMapping("/{organizationId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update organization", description = "Update an existing organization profile")
    @ApiResponse(responseCode = "200", description = "Organization updated successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable String organizationId,
            @Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.ok(organizationService.updateOrganization(organizationId, request));
    }

    @GetMapping("/{organizationId}")
    @Operation(summary = "Get organization", description = "Retrieve organization details by ID")
    @ApiResponse(responseCode = "200", description = "Organization retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable String organizationId) {
        return ResponseEntity.ok(organizationService.getOrganization(organizationId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get organization by user ID", description = "Retrieve organization details by user ID")
    @ApiResponse(responseCode = "200", description = "Organization retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> getOrganizationByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(organizationService.getOrganizationByUserId(userId));
    }

    @DeleteMapping("/{organizationId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Delete organization", description = "Delete an organization profile")
    @ApiResponse(responseCode = "204", description = "Organization deleted successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String organizationId) {
        organizationService.deleteOrganization(organizationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search organizations", description = "Search organizations by query string")
    @ApiResponse(responseCode = "200", description = "Search completed successfully")
    public ResponseEntity<List<OrganizationResponse>> searchOrganizations(
            @RequestParam(required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(organizationService.searchOrganizations(query));
    }

    @GetMapping("/focus-areas")
    @Operation(summary = "Find by focus areas", description = "Find organizations by their focus areas")
    @ApiResponse(responseCode = "200", description = "Organizations retrieved successfully")
    public ResponseEntity<List<OrganizationResponse>> findByFocusAreas(
            @RequestParam @NotEmpty(message = "At least one focus area is required") List<String> areas) {
        return ResponseEntity.ok(organizationService.findByFocusAreas(areas));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby organizations", description = "Find organizations within specified radius")
    @ApiResponse(responseCode = "200", description = "Organizations retrieved successfully")
    public ResponseEntity<List<OrganizationResponse>> findNearbyOrganizations(
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") double latitude,
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") double longitude,
            @RequestParam @Positive double radius) {
        return ResponseEntity.ok(organizationService.findNearbyOrganizations(latitude, longitude, radius));
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Find by city", description = "Find organizations in a specific city")
    @ApiResponse(responseCode = "200", description = "Organizations retrieved successfully")
    public ResponseEntity<List<OrganizationResponse>> findByCity(
            @PathVariable @NotBlank String city) {
        return ResponseEntity.ok(organizationService.findByCity(city));
    }

    @GetMapping("/country/{country}")
    @Operation(summary = "Find by country", description = "Find organizations in a specific country")
    @ApiResponse(responseCode = "200", description = "Organizations retrieved successfully")
    public ResponseEntity<List<OrganizationResponse>> findByCountry(
            @PathVariable @NotBlank String country) {
        return ResponseEntity.ok(organizationService.findByCountry(country));
    }

    @GetMapping("/rating")
    @Operation(summary = "Find by minimum rating", description = "Find organizations with minimum rating")
    @ApiResponse(responseCode = "200", description = "Organizations retrieved successfully")
    public ResponseEntity<List<OrganizationResponse>> findByMinimumRating(
            @RequestParam @DecimalMin("0.0") @DecimalMax("5.0") double minRating) {
        return ResponseEntity.ok(organizationService.findByMinimumRating(minRating));
    }

    @GetMapping("/accepting-volunteers")
    @Operation(summary = "Find accepting volunteers", description = "Find organizations currently accepting volunteers")
    @ApiResponse(responseCode = "200", description = "Organizations retrieved successfully")
    public ResponseEntity<List<OrganizationResponse>> findAcceptingVolunteers() {
        return ResponseEntity.ok(organizationService.findAcceptingVolunteers());
    }

    @PostMapping("/{organizationId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify organization", description = "Verify an organization's profile")
    @ApiResponse(responseCode = "204", description = "Organization verified successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> verifyOrganization(@PathVariable String organizationId) {
        organizationService.verifyOrganization(organizationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{organizationId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject organization verification", description = "Reject an organization's verification request")
    @ApiResponse(responseCode = "204", description = "Verification rejected successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> rejectVerification(
            @PathVariable String organizationId,
            @RequestParam @NotBlank(message = "Rejection reason is required") 
            @Size(min = ValidationConstants.MIN_REASON_LENGTH, max = ValidationConstants.MAX_REASON_LENGTH, 
                  message = "Reason must be between {min} and {max} characters") String reason) {
        organizationService.rejectVerification(organizationId, reason);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{organizationId}/documents")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Add document to organization", description = "Add a document to an organization using the document URL")
    @ApiResponse(responseCode = "200", description = "Document added successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> addDocument(
            @PathVariable String organizationId,
            @RequestBody DocumentUrlRequest request) {
        organizationService.addDocument(organizationId, request.getDocumentUrl(), request.getDocumentType());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{organizationId}/documents/{documentId}")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Remove document from organization", description = "Remove a document from an organization")
    @ApiResponse(responseCode = "200", description = "Document removed successfully")
    @ApiResponse(responseCode = "404", description = "Organization or document not found")
    public ResponseEntity<Void> removeDocument(
            @PathVariable String organizationId,
            @PathVariable String documentId) {
        organizationService.removeDocument(organizationId, documentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{organizationId}/statistics/update")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update statistics", description = "Update organization statistics")
    @ApiResponse(responseCode = "204", description = "Statistics updated successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> updateStatistics(@PathVariable String organizationId) {
        organizationService.updateStatistics(organizationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{organizationId}/impact-score/update")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update impact score", description = "Recalculate and update organization impact score")
    @ApiResponse(responseCode = "204", description = "Impact score updated successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> updateImpactScore(@PathVariable String organizationId) {
        organizationService.updateImpactScore(organizationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{organizationId}/volunteer-count/update")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update volunteer count", description = "Update organization's active volunteer count")
    @ApiResponse(responseCode = "204", description = "Volunteer count updated successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<Void> updateVolunteerCount(@PathVariable String organizationId) {
        organizationService.updateVolunteerCount(organizationId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{organizationId}/accepting-volunteers")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Set accepting volunteers status", description = "Update organization's volunteer acceptance status")
    @ApiResponse(responseCode = "204", description = "Status updated successfully")
    public ResponseEntity<Void> setAcceptingVolunteers(
            @PathVariable String organizationId,
            @RequestParam boolean accepting) {
        organizationService.setAcceptingVolunteers(organizationId, accepting);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validate/name")
    @Operation(summary = "Validate organization name", description = "Check if organization name is available")
    @ApiResponse(responseCode = "200", description = "Validation completed")
    public ResponseEntity<Boolean> isNameAvailable(
            @RequestParam @NotBlank String name) {
        return ResponseEntity.ok(organizationService.isNameAvailable(name));
    }

    @GetMapping("/validate/registration-number")
    @Operation(summary = "Validate registration number", description = "Check if registration number is valid")
    @ApiResponse(responseCode = "200", description = "Validation completed")
    public ResponseEntity<Boolean> isRegistrationNumberValid(
            @RequestParam @Pattern(regexp = "^[A-Z0-9-]{5,20}$") String registrationNumber) {
        return ResponseEntity.ok(organizationService.isRegistrationNumberValid(registrationNumber));
    }

    @GetMapping("/validate/tax-id")
    @Operation(summary = "Validate tax ID", description = "Check if tax ID is valid")
    @ApiResponse(responseCode = "200", description = "Validation completed")
    public ResponseEntity<Boolean> isTaxIdValid(
            @RequestParam @Pattern(regexp = "^[A-Z0-9-]{5,20}$") String taxId) {
        return ResponseEntity.ok(organizationService.isTaxIdValid(taxId));
    }

    @PostMapping("/{organizationId}/profile-picture")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Upload profile picture", description = "Upload a profile picture for the organization")
    @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully")
    @ApiResponse(responseCode = "400", description = "Invalid file type or size")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> uploadProfilePicture(
            @PathVariable String organizationId,
            @RequestParam("file") MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid file type. Only image files are allowed.");
        }

        // Validate file size (5MB limit)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit.");
        }

        return ResponseEntity.ok(organizationService.uploadProfilePicture(organizationId, file));
    }

    @GetMapping("/{organizationId}/volunteers")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Get organization volunteers", description = "Get all volunteers associated with an organization")
    @ApiResponse(responseCode = "200", description = "Volunteers retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<List<VolunteerProfileResponse>> getOrganizationVolunteers(
            @PathVariable String organizationId,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder) {
        return ResponseEntity.ok(organizationService.getOrganizationVolunteers(organizationId, sortBy, sortOrder));
    }

    @PatchMapping("/{organizationId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve organization", description = "Approve an organization to create events")
    @ApiResponse(responseCode = "200", description = "Organization approved successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> approveOrganization(@PathVariable String organizationId) {
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(organizationId, OrganizationStatus.APPROVED.name(), null));
    }

    @PatchMapping("/{organizationId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject organization", description = "Reject an organization from creating events")
    @ApiResponse(responseCode = "200", description = "Organization rejected successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> rejectOrganization(
            @PathVariable String organizationId,
            @RequestParam String reason) {
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(organizationId, OrganizationStatus.REJECTED.name(), reason));
    }

    @PatchMapping("/{organizationId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ban organization", description = "Ban an organization from the platform")
    @ApiResponse(responseCode = "200", description = "Organization banned successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> banOrganization(
            @PathVariable String organizationId,
            @RequestParam String reason) {
        return ResponseEntity.ok(organizationService.updateOrganizationBanStatus(organizationId, true, reason));
    }

    @PatchMapping("/{organizationId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unban organization", description = "Unban a previously banned organization")
    @ApiResponse(responseCode = "200", description = "Organization unbanned successfully")
    @ApiResponse(responseCode = "404", description = "Organization not found")
    public ResponseEntity<OrganizationResponse> unbanOrganization(@PathVariable String organizationId) {
        return ResponseEntity.ok(organizationService.updateOrganizationBanStatus(organizationId, false, null));
    }
}
