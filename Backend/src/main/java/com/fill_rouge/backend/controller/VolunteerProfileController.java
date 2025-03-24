package com.fill_rouge.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.service.storage.GridFsService;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;
import com.fill_rouge.backend.constant.VolunteerStatus;
import com.fill_rouge.backend.dto.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteer Profiles", description = "Volunteer profile management APIs")
@SecurityRequirement(name = "bearerAuth")
public class VolunteerProfileController {
    private final VolunteerProfileService profileService;
    private final GridFsService gridFsService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Create volunteer profile", description = "Create a new volunteer profile")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Volunteer profile created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Volunteer role required")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> createProfile(
            @RequestHeader("X-User-ID") String volunteerId,
            @Valid @RequestBody VolunteerProfileRequest request) {
        VolunteerProfileResponse profile = profileService.createProfile(volunteerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(profile, "Volunteer profile created successfully"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Update volunteer profile", description = "Update an existing volunteer profile")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer profile updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Volunteer role required"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer profile not found")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> updateProfile(
            @RequestHeader("X-User-ID") String volunteerId,
            @Valid @RequestBody VolunteerProfileRequest request) {
        VolunteerProfileResponse profile = profileService.updateProfile(volunteerId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Volunteer profile updated successfully"));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Get volunteer profile", description = "Retrieve a volunteer profile")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer profile retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer profile not found")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> getProfile(
            @RequestHeader("X-User-ID") String volunteerId) {
        VolunteerProfileResponse profile = profileService.getProfile(volunteerId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @DeleteMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Delete volunteer profile", description = "Delete a volunteer profile")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Volunteer profile deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Volunteer role required"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer profile not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@RequestHeader("X-User-ID") String volunteerId) {
        profileService.deleteProfile(volunteerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search volunteers", description = "Search volunteers by query string")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<ApiResponse<List<VolunteerProfileResponse>>> searchVolunteers(
            @RequestParam(required = false, defaultValue = "") String query) {
        List<VolunteerProfileResponse> profiles = profileService.searchVolunteers(query);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    @PostMapping("/stats")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Update volunteer stats", description = "Update volunteer statistics")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Stats updated successfully")
    })
    public ResponseEntity<ApiResponse<Void>> updateStats(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @Positive int hoursVolunteered,
            @RequestParam @DecimalMin("0.0") @DecimalMax("5.0") double rating) {
        profileService.updateVolunteerStats(volunteerId, hoursVolunteered, rating);
        return ResponseEntity.ok(ApiResponse.success(null, "Stats updated successfully"));
    }

    @PostMapping("/badges")
    @PreAuthorize("hasRole('ORGANIZATION')")
    @Operation(summary = "Award badge", description = "Award a badge to a volunteer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Badge awarded successfully")
    })
    public ResponseEntity<ApiResponse<Void>> awardBadge(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @NotBlank String badge) {
        profileService.awardBadge(volunteerId, badge);
        return ResponseEntity.ok(ApiResponse.success(null, "Badge awarded successfully"));
    }

    @PutMapping("/background-check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update background check", description = "Update volunteer background check status")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Background check status updated successfully")
    })
    public ResponseEntity<ApiResponse<Void>> updateBackgroundCheckStatus(
            @RequestHeader("X-User-ID") String volunteerId,
            @RequestParam @Pattern(regexp = "^(PENDING|APPROVED|REJECTED)$") String status) {
        profileService.updateBackgroundCheckStatus(volunteerId, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Background check status updated successfully"));
    }

    @PostMapping("/profile/picture")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Upload profile picture", description = "Upload a profile picture for the volunteer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> uploadProfilePicture(
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
            .emergencyContact(currentProfile.getEmergencyContact() != null ? currentProfile.getEmergencyContact().getName() : null)
            .emergencyPhone(currentProfile.getEmergencyContact() != null ? currentProfile.getEmergencyContact().getPhone() : null)
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
        VolunteerProfileResponse profile = profileService.updateProfile(volunteerId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile picture uploaded successfully"));
    }

    @PatchMapping("/{volunteerId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve volunteer", description = "Approve a volunteer's profile")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer approved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> approveVolunteer(@PathVariable String volunteerId) {
        VolunteerProfileResponse profile = profileService.updateVolunteerApprovalStatus(volunteerId, VolunteerStatus.APPROVED.name(), null);
        return ResponseEntity.ok(ApiResponse.success(profile, "Volunteer approved successfully"));
    }

    @PatchMapping("/{volunteerId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject volunteer", description = "Reject a volunteer's profile")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer rejected successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> rejectVolunteer(
            @PathVariable String volunteerId,
            @RequestParam String reason) {
        VolunteerProfileResponse profile = profileService.updateVolunteerApprovalStatus(volunteerId, VolunteerStatus.REJECTED.name(), reason);
        return ResponseEntity.ok(ApiResponse.success(profile, "Volunteer rejected successfully"));
    }

    @PatchMapping("/{volunteerId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ban volunteer", description = "Ban a volunteer from using the platform")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer banned successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> banVolunteer(
            @PathVariable String volunteerId,
            @RequestParam String reason) {
        VolunteerProfileResponse profile = profileService.updateVolunteerBanStatus(volunteerId, true, reason);
        return ResponseEntity.ok(ApiResponse.success(profile, "Volunteer banned successfully"));
    }

    @PatchMapping("/{volunteerId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unban volunteer", description = "Unban a previously banned volunteer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Volunteer unbanned successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> unbanVolunteer(@PathVariable String volunteerId) {
        VolunteerProfileResponse profile = profileService.updateVolunteerBanStatus(volunteerId, false, null);
        return ResponseEntity.ok(ApiResponse.success(profile, "Volunteer unbanned successfully"));
    }
} 