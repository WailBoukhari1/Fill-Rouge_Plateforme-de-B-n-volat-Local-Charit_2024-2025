package com.backend.backend.controller;

import com.backend.backend.dto.request.VolunteerProfileRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.VolunteerProfileResponse;
import com.backend.backend.security.SecurityUtils;
import com.backend.backend.service.interfaces.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;
    private final SecurityUtils securityUtils;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> createProfile(
            @Valid @RequestBody VolunteerProfileRequest request) {
        VolunteerProfileResponse response = volunteerService.createProfile(
                securityUtils.getCurrentUserEmail(), 
                request
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Profile created successfully"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<VolunteerProfileResponse> updateProfile(
            @Valid @RequestBody VolunteerProfileRequest request) {
        return ResponseEntity.ok(volunteerService.updateProfile(securityUtils.getCurrentUserEmail(), request));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> getProfile() {
        VolunteerProfileResponse response = volunteerService.getProfile(
                securityUtils.getCurrentUserEmail()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<Void> deleteProfile() {
        volunteerService.deleteProfile(securityUtils.getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/skills/{skill}")
    public ResponseEntity<ApiResponse<List<VolunteerProfileResponse>>> findBySkill(@PathVariable String skill) {
        return ResponseEntity.ok(ApiResponse.success(volunteerService.findVolunteersBySkill(skill)));
    }

    @GetMapping("/search/location/{location}")
    public ResponseEntity<ApiResponse<List<VolunteerProfileResponse>>> findByLocation(@PathVariable String location) {
        return ResponseEntity.ok(ApiResponse.success(volunteerService.findVolunteersByLocation(location)));
    }

    @PostMapping("/events/{eventId}/register")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<Void> registerForEvent(@PathVariable String eventId) {
        volunteerService.registerForEvent(securityUtils.getCurrentUserEmail(), eventId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/events/{eventId}/register")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<Void> cancelEventRegistration(@PathVariable String eventId) {
        volunteerService.cancelEventRegistration(securityUtils.getCurrentUserEmail(), eventId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/events/registered")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<List<EventResponse>> getRegisteredEvents() {
        return ResponseEntity.ok(volunteerService.getRegisteredEvents(securityUtils.getCurrentUserEmail()));
    }
} 