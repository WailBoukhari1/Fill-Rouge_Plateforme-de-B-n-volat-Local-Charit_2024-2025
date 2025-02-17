package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VolunteerProfileResponse {
    // Basic Profile Info
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String bio;
    private String profilePicture;
    private LocalDateTime joinedAt;
    
    @Builder.Default
    private boolean isActive = true;
    
    private String status;

    // Statistics Summary
    private VolunteerStatsResponse stats;
    
    // Skills and Interests
    @Builder.Default
    private List<SkillResponse> skills = new ArrayList<>();
    
    @Builder.Default
    private List<String> interests = new ArrayList<>();
    
    @Builder.Default
    private List<String> preferredCauses = new ArrayList<>();
    
    // Activity Summary
    @Builder.Default
    private List<EventResponse> upcomingEvents = new ArrayList<>();
    
    @Builder.Default
    private List<EventResponse> pastEvents = new ArrayList<>();
    
    @Builder.Default
    private List<AchievementResponse> recentAchievements = new ArrayList<>();
    
    @Builder.Default
    private List<BadgeResponse> badges = new ArrayList<>();

    // Personal Information
    private String city;
    private String country;
    private String emergencyContact;
    private String emergencyPhone;

    // Volunteering Preferences
    @Builder.Default
    private Set<String> preferredCategories = new HashSet<>();
    
    @Builder.Default
    private int maxHoursPerWeek = 20;
    
    @Builder.Default
    private double preferredRadius = 10.0;
    
    @Builder.Default
    private Set<String> availableDays = new HashSet<>();
    
    @Builder.Default
    private String preferredTimeOfDay = "FLEXIBLE";

    // Experience & Verification
    @Builder.Default
    private List<String> certifications = new ArrayList<>();
    
    @Builder.Default
    private List<String> languages = new ArrayList<>();
    
    @Builder.Default
    private boolean backgroundChecked = false;
    
    private LocalDateTime backgroundCheckDate;
    private String backgroundCheckStatus;
    
    @Builder.Default
    private List<String> references = new ArrayList<>();

    // Statistics & Metrics
    @Builder.Default
    private int reliabilityScore = 100;
    
    @Builder.Default
    private int impactScore = 0;

    // Preferences & Settings
    @Builder.Default
    private boolean availableForEmergency = false;
    
    @Builder.Default
    private boolean receiveNotifications = true;
    
    @Builder.Default
    private Set<String> notificationPreferences = new HashSet<>();
    
    @Builder.Default
    private boolean profileVisible = true;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VolunteerProfileResponse fromVolunteerProfile(VolunteerProfile profile) {
        if (profile == null) {
            return null;
        }

        User user = profile.getVolunteer().getUser();
        
        VolunteerProfileResponseBuilder builder = VolunteerProfileResponse.builder()
                .id(profile.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .address(profile.getAddress())
                .bio(profile.getBio())
                .profilePicture(profile.getProfilePicture())
                .joinedAt(profile.getCreatedAt())
                .isActive(profile.isProfileVisible())
                .status(profile.getBackgroundCheckStatus())
                .preferredCategories(profile.getPreferredCategories())
                .certifications(profile.getCertifications())
                .languages(profile.getLanguages())
                .backgroundChecked(profile.isBackgroundChecked())
                .backgroundCheckDate(profile.getBackgroundCheckDate())
                .backgroundCheckStatus(profile.getBackgroundCheckStatus())
                .reliabilityScore(profile.getReliabilityScore())
                .availableForEmergency(profile.isAvailableForEmergency())
                .receiveNotifications(profile.isReceiveNotifications())
                .notificationPreferences(profile.getNotificationPreferences())
                .profileVisible(profile.isProfileVisible())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt());

        // Convert skills to SkillResponse objects
        if (profile.getSkills() != null) {
            List<SkillResponse> skillResponses = profile.getSkills().stream()
                .map(skill -> {
                    SkillResponse skillResponse = new SkillResponse();
                    skillResponse.setName(skill);
                    return skillResponse;
                })
                .collect(Collectors.toList());
            builder.skills(skillResponses);
        }

        // Convert interests
        if (profile.getInterests() != null) {
            builder.interests(new ArrayList<>(profile.getInterests()));
        }

        // Set stats
        VolunteerStatsResponse stats = VolunteerStatsResponse.builder()
                .totalEventsAttended(profile.getTotalEventsAttended())
                .totalVolunteerHours(profile.getTotalHoursVolunteered())
                .averageEventRating(profile.getAverageRating())
                .build();
        builder.stats(stats);

        return builder.build();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isVerified() {
        return backgroundChecked && "APPROVED".equals(backgroundCheckStatus);
    }

    public boolean hasCompletedProfile() {
        return bio != null && !bio.isEmpty() &&
               !languages.isEmpty() &&
               !preferredCategories.isEmpty() &&
               !availableDays.isEmpty();
    }

    public int getCompletionPercentage() {
        int totalFields = 10;
        int completedFields = 0;

        if (bio != null && !bio.isEmpty()) completedFields++;
        if (!languages.isEmpty()) completedFields++;
        if (!preferredCategories.isEmpty()) completedFields++;
        if (!availableDays.isEmpty()) completedFields++;
        if (phoneNumber != null && !phoneNumber.isEmpty()) completedFields++;
        if (address != null && !address.isEmpty()) completedFields++;
        if (emergencyContact != null && !emergencyContact.isEmpty()) completedFields++;
        if (emergencyPhone != null && !emergencyPhone.isEmpty()) completedFields++;
        if (!skills.isEmpty()) completedFields++;
        if (!interests.isEmpty()) completedFields++;

        return (completedFields * 100) / totalFields;
    }
} 