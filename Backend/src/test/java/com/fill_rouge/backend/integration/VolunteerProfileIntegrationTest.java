package com.fill_rouge.backend.integration;

import java.util.HashSet;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fill_rouge.backend.config.BaseMongoTestContainer;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.repository.VolunteerProfileRepository;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;
import com.fill_rouge.backend.util.TestDataFactory;

@SpringBootTest
@ActiveProfiles("test")
class VolunteerProfileIntegrationTest extends BaseMongoTestContainer {

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VolunteerProfileService volunteerProfileService;

    private User volunteerUser;
    private String userId;
    private VolunteerProfile testProfile;
    private String profileId;

    @BeforeEach
    void setUp() {
        // Clean repositories
        volunteerProfileRepository.deleteAll();
        userRepository.deleteAll();

        // Create volunteer user
        volunteerUser = TestDataFactory.createUser("volunteer@example.com");
        volunteerUser = userRepository.save(volunteerUser);
        userId = volunteerUser.getId();

        // Create a test volunteer profile manually
        testProfile = new VolunteerProfile();
        testProfile.setId(userId); // Use the same ID as the user
        testProfile.setUser(volunteerUser);
        testProfile.setBio("Test volunteer bio");
        testProfile.setAddress("Test Address");
        testProfile.setCity("Test City");
        testProfile.setCountry("Test Country");
        testProfile.setPhoneNumber("+212600000000");
        
        // Set required fields for validation
        HashSet<String> skills = new HashSet<>();
        skills.add("Testing");
        testProfile.setSkills(skills.stream()
            .map(skillName -> {
                com.fill_rouge.backend.domain.Skill skill = new com.fill_rouge.backend.domain.Skill();
                skill.setName(skillName);
                return skill;
            })
            .collect(java.util.stream.Collectors.toList()));
            
        HashSet<String> availableDays = new HashSet<>();
        availableDays.add("MONDAY");
        testProfile.setAvailableDays(availableDays);
        
        // Create emergency contact
        VolunteerProfile.EmergencyContact emergencyContact = new VolunteerProfile.EmergencyContact();
        emergencyContact.setName("Emergency Contact");
        emergencyContact.setPhone("+212600000001");
        testProfile.setEmergencyContact(emergencyContact);
        
        testProfile = volunteerProfileRepository.save(testProfile);
        profileId = testProfile.getId();
        
        // Make sure the user has a reference to the profile
        volunteerUser.setVolunteerProfile(testProfile);
        userRepository.save(volunteerUser);
    }

    @AfterEach
    void tearDown() {
        volunteerProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getProfile_ShouldReturnProfile_WhenProfileExists() {
        // Act
        VolunteerProfileResponse result = volunteerProfileService.getProfile(userId);

        // Assert
        assertNotNull(result);
        assertEquals(profileId, result.getId());
        assertEquals("Test", result.getFirstName());
        assertEquals("Volunteer", result.getLastName());
        assertEquals("Test volunteer bio", result.getBio());
    }

    @Test
    void createProfile_ShouldCreateNewProfile() {
        // Arrange - Create a new user without a profile
        User newUser = TestDataFactory.createUser("new.volunteer@example.com");
        newUser.setVolunteerProfile(null); // Ensure no profile exists
        newUser = userRepository.save(newUser);
        String newUserId = newUser.getId();
        
        VolunteerProfileRequest request = new VolunteerProfileRequest();
        request.setBio("New volunteer bio");
        request.setPhoneNumber("+212612345678");
        request.setAddress("New Address");
        request.setCity("New City");
        request.setCountry("New Country");
        request.setEmergencyContact("Emergency Contact");
        request.setEmergencyPhone("+212612345679");
        HashSet<String> skills = new HashSet<>();
        skills.add("Programming");
        request.setSkills(skills);
        HashSet<String> availableDays = new HashSet<>();
        availableDays.add("MONDAY");
        availableDays.add("FRIDAY");
        request.setAvailableDays(availableDays);

        // Act
        VolunteerProfileResponse result = volunteerProfileService.createProfile(newUserId, request);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("New volunteer bio", result.getBio());
        assertEquals("+212612345678", result.getPhoneNumber());

        // Verify in database
        Optional<VolunteerProfile> savedProfileOpt = volunteerProfileRepository.findById(result.getId());
        assertTrue(savedProfileOpt.isPresent());
        VolunteerProfile savedProfile = savedProfileOpt.get();
        assertEquals("New volunteer bio", savedProfile.getBio());
        
        // Make sure the user is set before trying to access its ID
        assertNotNull(savedProfile.getUser(), "User should not be null in the saved profile");
        assertEquals(newUserId, savedProfile.getUser().getId());
    }

    @Test
    void updateProfile_ShouldUpdateExistingProfile() {
        // Arrange
        VolunteerProfileRequest request = new VolunteerProfileRequest();
        request.setBio("Updated volunteer bio");
        request.setPhoneNumber("+212612345678");
        request.setAddress("Updated Address");
        request.setCity("Updated City");
        request.setCountry("Updated Country");
        request.setEmergencyContact("Emergency Contact");
        request.setEmergencyPhone("+212612345679");
        HashSet<String> skills = new HashSet<>();
        skills.add("Programming");
        request.setSkills(skills);
        HashSet<String> availableDays = new HashSet<>();
        availableDays.add("MONDAY");
        availableDays.add("FRIDAY");
        request.setAvailableDays(availableDays);

        // Act
        VolunteerProfileResponse result = volunteerProfileService.updateProfile(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(profileId, result.getId());
        assertEquals("Updated volunteer bio", result.getBio());
        assertEquals("Updated Address", result.getAddress());

        // Verify in database
        Optional<VolunteerProfile> updatedProfile = volunteerProfileRepository.findById(profileId);
        assertTrue(updatedProfile.isPresent());
        assertEquals("Updated volunteer bio", updatedProfile.get().getBio());
    }

    @Test
    void deleteProfile_ShouldRemoveProfile() {
        // Act
        volunteerProfileService.deleteProfile(userId);

        // Assert
        Optional<VolunteerProfile> result = volunteerProfileRepository.findById(profileId);
        assertFalse(result.isPresent());
    }

    // @Test
    // void searchVolunteers_ShouldReturnMatchingProfiles() {
    //     // Arrange - Create additional profiles for searching
    //     User user1 = TestDataFactory.createUser("john@example.com");
    //     user1 = userRepository.save(user1);
    //     String user1Id = user1.getId();
        
    //     VolunteerProfile profile1 = new VolunteerProfile();
    //     profile1.setId(user1Id);
    //     profile1.setFirstName("John");
    //     profile1.setLastName("Doe");
    //     profile1.setUser(user1);
    //     profile1.setEmail("john@example.com");
    //     profile1.setAddress("Test Address");
    //     profile1.setCity("Test City");
    //     profile1.setCountry("Test Country");
    //     profile1.setPhoneNumber("+212600000002");
        
    //     // Set required fields
    //     HashSet<String> skills1 = new HashSet<>();
    //     skills1.add("Java");
    //     profile1.setSkills(skills1.stream()
    //         .map(skillName -> {
    //             com.fill_rouge.backend.domain.Skill skill = new com.fill_rouge.backend.domain.Skill();
    //             skill.setName(skillName);
    //             return skill;
    //         })
    //         .collect(java.util.stream.Collectors.toList()));
            
    //     HashSet<String> availableDays1 = new HashSet<>();
    //     availableDays1.add("TUESDAY");
    //     profile1.setAvailableDays(availableDays1);
        
    //     VolunteerProfile.EmergencyContact emergencyContact1 = new VolunteerProfile.EmergencyContact();
    //     emergencyContact1.setName("Emergency Contact 1");
    //     emergencyContact1.setPhone("+212600000003");
    //     profile1.setEmergencyContact(emergencyContact1);
        
    //     profile1 = volunteerProfileRepository.save(profile1);
        
    //     // Update user with profile reference
    //     user1.setVolunteerProfile(profile1);
    //     userRepository.save(user1);

    //     // Act
    //     List<VolunteerProfileResponse> results = volunteerProfileService.searchVolunteers("Jo");

    //     // Assert
    //     assertNotNull(results);
    //     assertTrue(results.size() >= 1);
    //     assertTrue(results.stream().anyMatch(profile -> profile.getFirstName().equals("John")));
    // }
} 