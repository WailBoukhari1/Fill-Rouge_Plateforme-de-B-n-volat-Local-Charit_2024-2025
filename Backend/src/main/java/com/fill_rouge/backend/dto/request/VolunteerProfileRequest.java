package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerProfileRequest {
    private static final String PHONE_REGEX = "^\\+?[1-9]\\d{1,14}$";
    private static final String DAYS_REGEX = "^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$";
    private static final String TIME_REGEX = "^(MORNING|AFTERNOON|EVENING|FLEXIBLE)$";
    private static final String NOTIFICATION_REGEX = "^(EMAIL|SMS|PUSH|IN_APP)$";

    @Size(min = 20, max = 1000, message = "Bio must be between {min} and {max} characters")
    private String bio;

    @Pattern(regexp = PHONE_REGEX, message = "Invalid phone number format")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Emergency contact name is required")
    @Size(min = 2, max = 100, message = "Emergency contact name must be between {min} and {max} characters")
    private String emergencyContact;

    @NotBlank(message = "Emergency phone is required")
    @Pattern(regexp = PHONE_REGEX, message = "Invalid emergency phone number format")
    private String emergencyPhone;

    @Builder.Default
    private Set<@NotBlank(message = "Category cannot be blank") String> preferredCategories = new HashSet<>();

    @Builder.Default
    private Set<@NotBlank(message = "Skill cannot be blank") String> skills = new HashSet<>();

    @Builder.Default
    private Set<@NotBlank(message = "Interest cannot be blank") String> interests = new HashSet<>();

    @Builder.Default
    private Set<@Pattern(regexp = DAYS_REGEX, message = "Invalid day format") String> availableDays = new HashSet<>();

    @Pattern(regexp = TIME_REGEX, message = "Invalid preferred time of day")
    @Builder.Default
    private String preferredTimeOfDay = "FLEXIBLE";

    @Builder.Default
    private List<@NotBlank(message = "Certification cannot be blank") String> certifications = new ArrayList<>();

    @Builder.Default
    private List<@NotBlank(message = "Language cannot be blank") String> languages = new ArrayList<>();

    @Builder.Default
    private boolean availableForEmergency = false;

    @Builder.Default
    private boolean receiveNotifications = true;

    @Builder.Default
    private Set<@Pattern(regexp = NOTIFICATION_REGEX, message = "Invalid notification preference") String> 
        notificationPreferences = new HashSet<>();

    @Builder.Default
    private boolean profileVisible = true;

    @AssertTrue(message = "At least one available day must be selected")
    private boolean isValidAvailability() {
        return availableDays != null && !availableDays.isEmpty();
    }

    @AssertTrue(message = "At least one notification preference must be selected when notifications are enabled")
    private boolean isValidNotificationPreferences() {
        if (receiveNotifications) {
            return notificationPreferences != null && !notificationPreferences.isEmpty();
        }
        return true;
    }
} 