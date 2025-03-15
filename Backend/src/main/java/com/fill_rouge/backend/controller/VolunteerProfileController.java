package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;
import com.fill_rouge.backend.service.storage.GridFsService;
import com.fill_rouge.backend.domain.VolunteerProfile;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
@RequestMapping("/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteer Profile", description = "Volunteer profile management endpoints")
public class VolunteerProfileController {
    private final VolunteerProfileService profileService;
    private final GridFsService gridFsService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Create volunteer profile", description = "Create a new volunteer profile")
    @ApiResponse(responseCode = "201", description = "Profile created successfully")
    public ResponseEntity<VolunteerProfileResponse> createProfile(
            @RequestHeader("X-User-ID") String volunteerId,
            @Valid @RequestBody VolunteerProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.createProfile(volunteerId, request));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Update volunteer profile", description = "Update an existing volunteer profile")
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    public ResponseEntity<VolunteerProfileResponse> updateProfile(
            @RequestHeader("X-User-ID") String volunteerId,
            @Valid @RequestBody VolunteerProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(volunteerId, request));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Get volunteer profile", description = "Retrieve a volunteer profile")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Profile not found")
    public ResponseEntity<VolunteerProfileResponse> getProfile(
            @RequestHeader("X-User-ID") String volunteerId) {
        return ResponseEntity.ok(profileService.getProfile(volunteerId));
    }

    @DeleteMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Delete volunteer profile", description = "Delete a volunteer profile")
    @ApiResponse(responseCode = "204", description = "Profile deleted successfully")
    public ResponseEntity<Void> deleteProfile(@RequestHeader("X-User-ID") String volunteerId) {
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

    @PostMapping("/stats")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update volunteer stats", description = "Update volunteer statistics")
    @ApiResponse(responseCode = "200", description = "Stats updated successfully")
    public ResponseEntity<Void> updateStats(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @Positive int hoursVolunteered,
            @RequestParam @DecimalMin("0.0") @DecimalMax("5.0") double rating) {
        profileService.updateVolunteerStats(volunteerId, hoursVolunteered, rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/badges")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Award badge", description = "Award a badge to a volunteer")
    @ApiResponse(responseCode = "200", description = "Badge awarded successfully")
    public ResponseEntity<Void> awardBadge(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @NotBlank String badge) {
        profileService.awardBadge(volunteerId, badge);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/background-check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update background check", description = "Update volunteer background check status")
    @ApiResponse(responseCode = "200", description = "Background check status updated successfully")
    public ResponseEntity<Void> updateBackgroundCheckStatus(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @Pattern(regexp = "^(PENDING|APPROVED|REJECTED)$") String status) {
        profileService.updateBackgroundCheckStatus(volunteerId, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile/picture")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Upload profile picture", description = "Upload a profile picture for the volunteer")
    @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully")
    public ResponseEntity<VolunteerProfileResponse> uploadProfilePicture(
            @RequestHeader("X-User-ID") String volunteerId,
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

        // Store the file using GridFS
        String fileUrl = gridFsService.store(file);

        // Get current profile
        VolunteerProfile currentProfile = profileService.getVolunteerProfile(volunteerId);

        // Create update request with all required fields
        VolunteerProfileRequest request = VolunteerProfileRequest.builder()
            .profilePicture(fileUrl)
            .bio(currentProfile.getBio())
            .phoneNumber(currentProfile.getPhoneNumber())
            .address(currentProfile.getAddress())
            .city(currentProfile.getCity())
            .country(currentProfile.getCountry())
            .emergencyContact(currentProfile.getEmergencyContact())
            .emergencyPhone(currentProfile.getEmergencyPhone())
            .preferredCategories(currentProfile.getPreferredCategories())
            .skills(currentProfile.getSkills().stream().map(skill -> skill.getName()).collect(java.util.stream.Collectors.toSet()))
            .interests(currentProfile.getInterests())
            .availableDays(currentProfile.getAvailableDays())
            .preferredTimeOfDay(currentProfile.getPreferredTimeOfDay())
            .languages(currentProfile.getLanguages())
            .certifications(currentProfile.getCertifications())
            .availableForEmergency(currentProfile.isAvailableForEmergency())
            .receiveNotifications(currentProfile.isReceiveNotifications())
            .notificationPreferences(currentProfile.getNotificationPreferences())
            .profileVisible(currentProfile.isProfileVisible())
            .build();

        // Update profile and return response
        return ResponseEntity.ok(profileService.updateProfile(volunteerId, request));
    }
} 