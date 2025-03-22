package com.fill_rouge.backend.util;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;

/**
 * Factory class for creating test data objects
 */
public class TestDataFactory {
    
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final String DEFAULT_PASSWORD = "Password123!";
    
    public static User createUser(String email) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setRole(Role.VOLUNTEER);
        user.setEnabled(true);
        user.setAccountNonLocked(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        // Create a volunteer profile for the user with the same email
        if (user.getRole() == Role.VOLUNTEER) {
            VolunteerProfile profile = new VolunteerProfile();
            user.setVolunteerProfile(profile);
        }
        
        return user;
    }
    
    public static User createAdminUser(String email) {
        User user = createUser(email);
        user.setRole(Role.ADMIN);
        return user;
    }
    
    public static User createOrganizationUser(String email) {
        User user = createUser(email);
        user.setRole(Role.ORGANIZATION);
        return user;
    }
    
    public static Event createEvent(String organizationId, String title) {
        Event event = new Event();
        event.setId(UUID.randomUUID().toString());
        event.setOrganizationId(organizationId);
        event.setTitle(title);
        event.setDescription("Test event description");
        event.setLocation("Test location");
        event.setStartDate(LocalDateTime.now().plusDays(1));
        event.setEndDate(LocalDateTime.now().plusDays(1).plusHours(2));
        return event;
    }
} 