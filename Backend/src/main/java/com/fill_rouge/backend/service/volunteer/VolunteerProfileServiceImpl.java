package com.fill_rouge.backend.service.volunteer;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;

import com.fill_rouge.backend.domain.Skill;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.exception.ValidationException;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.repository.VolunteerProfileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Validated
@RequiredArgsConstructor
@Slf4j
public class VolunteerProfileServiceImpl implements VolunteerProfileService {
    private final VolunteerProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public VolunteerProfileResponse createProfile(@NonNull String volunteerId, @NonNull VolunteerProfileRequest request) {
        log.debug("Creating volunteer profile for volunteerId: {}", volunteerId);
        validateProfileRequest(request);
        
        if (profileRepository.findByUserId(volunteerId).isPresent()) {
            throw new ValidationException("Profile already exists for this volunteer");
        }

        // Get the User entity reference
        User user = userRepository.findById(volunteerId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + volunteerId));

        VolunteerProfile profile = new VolunteerProfile();
        profile.setId(volunteerId); // Use volunteerId as profile ID
        profile.setUser(user); // Set the user reference
    
    
        updateProfileFromRequest(profile, request);
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        
        return toVolunteerProfileResponse(saveProfile(profile));
    }

    @Override
    @Transactional
    @CacheEvict(value = "volunteerProfiles", key = "#volunteerId")
    public VolunteerProfileResponse updateProfile(@NonNull String volunteerId, @NonNull VolunteerProfileRequest request) {
        log.debug("Updating volunteer profile for volunteerId: {}", volunteerId);
        validateProfileRequest(request);
        
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        updateProfileFromRequest(profile, request);
        
        return toVolunteerProfileResponse(saveProfile(profile));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "volunteerProfiles", key = "#volunteerId")
    public VolunteerProfileResponse getProfile(@NonNull String volunteerId) {
        return toVolunteerProfileResponse(getVolunteerProfile(volunteerId));
    }

    @Override
    @Transactional
    @CacheEvict(value = "volunteerProfiles", key = "#volunteerId")
    public void deleteProfile(@NonNull String volunteerId) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        profileRepository.delete(profile);
        log.info("Deleted volunteer profile for volunteerId: {}", volunteerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerProfileResponse> searchVolunteers(String query) {
        return profileRepository.findAll().stream()
            .filter(profile -> matchesSearchCriteria(profile, query))
            .map(this::toVolunteerProfileResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateVolunteerStats(String volunteerId, int hoursVolunteered, double rating) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        
        profile.setTotalHoursVolunteered(profile.getTotalHoursVolunteered() + hoursVolunteered);
        profile.setTotalEventsAttended(profile.getTotalEventsAttended() + 1);
        updateAverageRating(profile, rating);
        
        saveProfile(profile);
        updateReliabilityScore(volunteerId);
    }

    @Override
    @Transactional
    public void updateReliabilityScore(String volunteerId) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        profile.updateReliabilityScore(calculateReliabilityScore(profile));
        saveProfile(profile);
    }

    @Override
    @Transactional
    public void awardBadge(String volunteerId, String badge) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        if (!profile.getBadges().contains(badge)) {
            profile.getBadges().add(badge);
            saveProfile(profile);
        }
    }

    @Override
    @Transactional
    public void updateBackgroundCheckStatus(String volunteerId, String status) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        profile.setBackgroundCheckStatus(status);
        profile.setBackgroundChecked("APPROVED".equals(status));
        profile.setBackgroundCheckDate(LocalDateTime.now());
        saveProfile(profile);
    }

    @Override
    public VolunteerProfileResponse updateVolunteerApprovalStatus(String volunteerId, String status, String reason) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        
        if (profile == null) {
            throw new ResourceNotFoundException("Volunteer profile not found with ID: " + volunteerId);
        }
        
        // Validate the status
        if (!Arrays.asList("PENDING", "APPROVED", "REJECTED").contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        
        // If rejecting, reason is required
        if ("REJECTED".equals(status) && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("Rejection reason is required");
        }
        
        profile.setApprovalStatus(status);
        
        if ("REJECTED".equals(status)) {
            profile.setRejectionReason(reason);
        } else {
            profile.setRejectionReason(null);
        }
        
        profile.setUpdatedAt(LocalDateTime.now());
        profile = saveProfile(profile);
        
        return toVolunteerProfileResponse(profile);
    }

    @Override
    public VolunteerProfileResponse updateVolunteerBanStatus(String volunteerId, boolean banned, String reason) {
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        
        if (profile == null) {
            throw new ResourceNotFoundException("Volunteer profile not found with ID: " + volunteerId);
        }
        
        // If banning, reason is required
        if (banned && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("Ban reason is required");
        }
        
        profile.setBanned(banned);
        
        if (banned) {
            profile.setBanReason(reason);
        } else {
            profile.setBanReason(null);
        }
        
        profile.setUpdatedAt(LocalDateTime.now());
        profile = saveProfile(profile);
        
        return toVolunteerProfileResponse(profile);
    }

    // Helper methods
    private VolunteerProfile saveProfile(VolunteerProfile profile) {
        try {
            profile.setUpdatedAt(LocalDateTime.now());
            return profileRepository.save(profile);
        } catch (Exception e) {
            log.error("Error saving volunteer profile: {}", e.getMessage());
            throw new RuntimeException("Failed to save volunteer profile", e);
        }
    }

    private void validateProfileRequest(VolunteerProfileRequest request) {
        if (request == null) {
            throw new ValidationException("Profile request cannot be null");
        }
        
        List<String> errors = new ArrayList<>();
        
        if (!StringUtils.hasText(request.getPhoneNumber())) {
            errors.add("Phone number is required");
        }
        if (!StringUtils.hasText(request.getEmergencyContact())) {
            errors.add("Emergency contact is required");
        }
        if (!StringUtils.hasText(request.getEmergencyPhone())) {
            errors.add("Emergency phone is required");
        }
        if (request.getSkills() == null || request.getSkills().isEmpty()) {
            errors.add("At least one skill is required");
        }
        if (request.getAvailableDays() == null || request.getAvailableDays().isEmpty()) {
            errors.add("Available days must be specified");
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException(String.join(", ", errors));
        }
    }

    @Override
    public VolunteerProfile getVolunteerProfile(@NonNull String volunteerId) {
        return profileRepository.findByUserId(volunteerId)
            .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found"));
    }

    private void updateProfileFromRequest(VolunteerProfile profile, VolunteerProfileRequest request) {
        profile.setBio(request.getBio());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setCountry(request.getCountry());
        
        // Create and set emergency contact
        VolunteerProfile.EmergencyContact emergencyContact = new VolunteerProfile.EmergencyContact();
        emergencyContact.setName(request.getEmergencyContact());
        emergencyContact.setPhone(request.getEmergencyPhone());
        profile.setEmergencyContact(emergencyContact);
        
        profile.setPreferredCategories(request.getPreferredCategories());
        profile.setProfilePicture(request.getProfilePicture());
        List<Skill> skills = request.getSkills().stream()
            .map(skillName -> {
                Skill skill = new Skill();
                skill.setName(skillName);
                return skill;
            })
            .collect(Collectors.toList());
        profile.setSkills(skills);
        profile.setInterests(request.getInterests());
        profile.setAvailableDays(request.getAvailableDays());
        profile.setPreferredTimeOfDay(request.getPreferredTimeOfDay());
        profile.setCertifications(request.getCertifications());
        profile.setLanguages(request.getLanguages());
        profile.setAvailableForEmergency(request.isAvailableForEmergency());
        profile.setReceiveNotifications(request.isReceiveNotifications());
        profile.setNotificationPreferences(request.getNotificationPreferences());
        profile.setProfileVisible(request.isProfileVisible());
    }

    private void updateAverageRating(VolunteerProfile profile, double newRating) {
        double currentTotal = profile.getAverageRating() * (profile.getTotalEventsAttended() - 1);
        profile.updateRating((int)Math.round((currentTotal + newRating) / profile.getTotalEventsAttended()));
    }

    private int calculateReliabilityScore(VolunteerProfile profile) {
        double attendanceScore = (profile.getTotalEventsAttended() > 0) ? 40 : 0;
        double ratingScore = (profile.getAverageRating() / 5.0) * 40;
        double verificationScore = profile.isBackgroundChecked() ? 20 : 0;
        
        return (int) (attendanceScore + ratingScore + verificationScore);
    }

    private boolean matchesSearchCriteria(VolunteerProfile profile, String query) {
        if (!StringUtils.hasText(query)) {
            return true;
        }
        
        String lowercaseQuery = query.toLowerCase();
        return profile.getSkills().stream().anyMatch(skill -> skill.getName().toLowerCase().contains(lowercaseQuery)) ||
               profile.getInterests().stream().anyMatch(interest -> interest.toLowerCase().contains(lowercaseQuery)) ||
               (profile.getCity() != null && profile.getCity().toLowerCase().contains(lowercaseQuery)) ||
               (profile.getCountry() != null && profile.getCountry().toLowerCase().contains(lowercaseQuery));
    }

    private VolunteerProfileResponse toVolunteerProfileResponse(VolunteerProfile profile) {
        return VolunteerProfileResponse.builder()
            .id(profile.getId())
            .phoneNumber(profile.getPhoneNumber())
            .address(profile.getAddress())
            .bio(profile.getBio())
            .profilePicture(profile.getProfilePicture())
            .joinedAt(profile.getCreatedAt())
            .isActive(profile.isActive())
            .status(profile.getStatus())
            .totalEventsAttended(profile.getTotalEventsAttended())
            .totalVolunteerHours(profile.getTotalHoursVolunteered())
            .averageEventRating(profile.getAverageRating() != null ? profile.getAverageRating() : 0.0)
            .skills(profile.getSkills().stream().map(Skill::getName).collect(Collectors.toSet()))
            .interests(profile.getInterests())
            .preferredCauses(profile.getPreferredCategories())
            .city(profile.getCity())
            .country(profile.getCountry())
            .emergencyContact(profile.getEmergencyContact() != null ? profile.getEmergencyContact().getName() : null)
            .emergencyPhone(profile.getEmergencyContact() != null ? profile.getEmergencyContact().getPhone() : null)
            .preferredCategories(profile.getPreferredCategories())
            .maxHoursPerWeek(profile.getMaxHoursPerWeek() != null ? profile.getMaxHoursPerWeek() : 20)
            .preferredRadius(profile.getPreferredRadius() != null ? profile.getPreferredRadius() : 10)
            .availableDays(profile.getAvailableDays())
            .preferredTimeOfDay(profile.getPreferredTimeOfDay())
            .certifications(profile.getCertifications())
            .languages(profile.getLanguages())
            .backgroundChecked(profile.isBackgroundChecked())
            .backgroundCheckDate(profile.getBackgroundCheckDate())
            .backgroundCheckStatus(profile.getBackgroundCheckStatus())
            .reliabilityScore(profile.getReliabilityScore() != null ? profile.getReliabilityScore().intValue() : 0)
            .impactScore(profile.getImpactScore() != null ? profile.getImpactScore().intValue() : 0)
            .availableForEmergency(profile.isAvailableForEmergency())
            .receiveNotifications(profile.isReceiveNotifications())
            .notificationPreferences(profile.getNotificationPreferences())
            .profileVisible(profile.isProfileVisible())
            .createdAt(profile.getCreatedAt())
            .updatedAt(profile.getUpdatedAt())
            .build();
    }
} 

