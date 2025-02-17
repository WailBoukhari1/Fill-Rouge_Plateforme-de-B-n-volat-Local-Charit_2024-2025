package com.fill_rouge.backend.service.volunteer;

import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.domain.Volunteer;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.repository.VolunteerProfileRepository;
import com.fill_rouge.backend.repository.VolunteerRepository;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.lang.NonNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Validated
@RequiredArgsConstructor
@Slf4j
public class VolunteerProfileServiceImpl implements VolunteerProfileService {
    private final VolunteerProfileRepository profileRepository;
    private final VolunteerRepository volunteerRepository;

    @Override
    @Transactional
    public VolunteerProfileResponse createProfile(@NonNull String volunteerId, @NonNull VolunteerProfileRequest request) {
        log.debug("Creating volunteer profile for volunteerId: {}", volunteerId);
        validateProfileRequest(request);
        
        if (profileRepository.findByVolunteerId(volunteerId).isPresent()) {
            throw new ValidationException("Profile already exists for this volunteer");
        }

        Volunteer volunteer = volunteerRepository.findById(volunteerId)
            .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        VolunteerProfile profile = new VolunteerProfile();
        updateProfileFromRequest(profile, request);
        profile.setVolunteer(volunteer);
        
        return saveProfile(profile);
    }

    @Override
    @Transactional
    @CacheEvict(value = "volunteerProfiles", key = "#volunteerId")
    public VolunteerProfileResponse updateProfile(@NonNull String volunteerId, @NonNull VolunteerProfileRequest request) {
        log.debug("Updating volunteer profile for volunteerId: {}", volunteerId);
        validateProfileRequest(request);
        
        VolunteerProfile profile = getVolunteerProfile(volunteerId);
        updateProfileFromRequest(profile, request);
        
        return saveProfile(profile);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "volunteerProfiles", key = "#volunteerId")
    public VolunteerProfileResponse getProfile(@NonNull String volunteerId) {
        return VolunteerProfileResponse.fromVolunteerProfile(getVolunteerProfile(volunteerId));
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
            .map(VolunteerProfileResponse::fromVolunteerProfile)
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

    // Helper methods
    private VolunteerProfileResponse saveProfile(VolunteerProfile profile) {
        try {
            profile.setUpdatedAt(LocalDateTime.now());
            VolunteerProfile savedProfile = profileRepository.save(profile);
            return VolunteerProfileResponse.fromVolunteerProfile(savedProfile);
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
        return profileRepository.findByVolunteerId(volunteerId)
            .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found"));
    }

    private void updateProfileFromRequest(VolunteerProfile profile, VolunteerProfileRequest request) {
        profile.setBio(request.getBio());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setCountry(request.getCountry());
        profile.setEmergencyContact(request.getEmergencyContact());
        profile.setEmergencyPhone(request.getEmergencyPhone());
        profile.setPreferredCategories(request.getPreferredCategories());
        profile.setSkills(request.getSkills());
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
        profile.updateRating((currentTotal + newRating) / profile.getTotalEventsAttended());
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
        return profile.getSkills().stream().anyMatch(skill -> skill.toLowerCase().contains(lowercaseQuery)) ||
               profile.getInterests().stream().anyMatch(interest -> interest.toLowerCase().contains(lowercaseQuery)) ||
               profile.getCity().toLowerCase().contains(lowercaseQuery) ||
               profile.getCountry().toLowerCase().contains(lowercaseQuery);
    }
} 

