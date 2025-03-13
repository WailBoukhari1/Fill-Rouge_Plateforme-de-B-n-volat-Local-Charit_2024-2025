package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/volunteer-profiles")
@RequiredArgsConstructor
@Tag(name = "Volunteer Profile", description = "Volunteer profile management endpoints")
public class VolunteerProfileController {
    private final VolunteerProfileService profileService;

    @PostMapping("/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER') and #volunteerId == authentication.principal.id")
    @Operation(summary = "Create volunteer profile", description = "Create a new volunteer profile")
    @ApiResponse(responseCode = "201", description = "Profile created successfully")
    public ResponseEntity<VolunteerProfileResponse> createProfile(
            @PathVariable String volunteerId,
            @Valid @RequestBody VolunteerProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.createProfile(volunteerId, request));
    }

    @PutMapping("/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER') and #volunteerId == authentication.principal.id")
    @Operation(summary = "Update volunteer profile", description = "Update an existing volunteer profile")
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    public ResponseEntity<VolunteerProfileResponse> updateProfile(
            @PathVariable String volunteerId,
            @Valid @RequestBody VolunteerProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(volunteerId, request));
    }

    @GetMapping("/{volunteerId}")
    @Operation(summary = "Get volunteer profile", description = "Retrieve a volunteer profile by ID")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Profile not found")
    public ResponseEntity<VolunteerProfileResponse> getProfile(@PathVariable String volunteerId) {
        return ResponseEntity.ok(profileService.getProfile(volunteerId));
    }

    @DeleteMapping("/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER') and #volunteerId == authentication.principal.id")
    @Operation(summary = "Delete volunteer profile", description = "Delete a volunteer profile")
    @ApiResponse(responseCode = "204", description = "Profile deleted successfully")
    public ResponseEntity<Void> deleteProfile(@PathVariable String volunteerId) {
        profileService.deleteProfile(volunteerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search volunteers", description = "Search volunteers by query string")
    @ApiResponse(responseCode = "200", description = "Search completed successfully")
    public ResponseEntity<List<VolunteerProfileResponse>> searchVolunteers(
            @RequestParam(required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(profileService.searchVolunteers(query));
    }

    @PostMapping("/{volunteerId}/stats")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update volunteer stats", description = "Update volunteer statistics")
    @ApiResponse(responseCode = "200", description = "Stats updated successfully")
    public ResponseEntity<Void> updateStats(
            @PathVariable String volunteerId,
            @RequestParam @Positive int hoursVolunteered,
            @RequestParam @DecimalMin("0.0") @DecimalMax("5.0") double rating) {
        profileService.updateVolunteerStats(volunteerId, hoursVolunteered, rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{volunteerId}/badges")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Award badge", description = "Award a badge to a volunteer")
    @ApiResponse(responseCode = "200", description = "Badge awarded successfully")
    public ResponseEntity<Void> awardBadge(
            @PathVariable String volunteerId,
            @RequestParam @NotBlank String badge) {
        profileService.awardBadge(volunteerId, badge);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{volunteerId}/background-check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update background check", description = "Update volunteer background check status")
    @ApiResponse(responseCode = "200", description = "Background check status updated successfully")
    public ResponseEntity<Void> updateBackgroundCheckStatus(
            @PathVariable String volunteerId,
            @RequestParam @Pattern(regexp = "^(PENDING|APPROVED|REJECTED)$") String status) {
        profileService.updateBackgroundCheckStatus(volunteerId, status);
        return ResponseEntity.ok().build();
    }
} 