package com.fill_rouge.backend.service.volunteer;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.repository.VolunteerProfileRepository;
import com.fill_rouge.backend.util.TestDataFactory;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class VolunteerProfileServiceTest {

    @Mock
    private VolunteerProfileRepository volunteerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VolunteerProfileServiceImpl volunteerProfileService;

    private User testUser;
    private String volunteerId;
    private VolunteerProfile testProfile;

    @BeforeEach
    void setUp() {
        volunteerId = "volunteer123";
        testUser = TestDataFactory.createUser("volunteer@example.com");
        testUser.setId(volunteerId);
        
        testProfile = new VolunteerProfile();
        testProfile.setId("profile123");
        testProfile.setBio("Test bio");
    }

    @Test
    void getProfile_ShouldReturnProfile_WhenProfileExists() {
        // Arrange
        when(volunteerProfileRepository.findByUserId(volunteerId)).thenReturn(Optional.of(testProfile));

        // Act
        VolunteerProfileResponse result = volunteerProfileService.getProfile(volunteerId);

        // Assert
        assertNotNull(result);
        assertEquals(testProfile.getId(), result.getId());
        assertEquals("Test", result.getFirstName());
        assertEquals("Volunteer", result.getLastName());
    }

    @Test
    void getProfile_ShouldThrowException_WhenProfileDoesNotExist() {
        // Arrange
        when(volunteerProfileRepository.findByUserId(volunteerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            volunteerProfileService.getProfile(volunteerId);
        });
    }

    @Test
    void createProfile_ShouldCreateNewProfile() {
        // Arrange
        VolunteerProfileRequest request = new VolunteerProfileRequest();
        request.setBio("New volunteer bio");
        request.setPhoneNumber("+212612345678");
        request.setAddress("Test Address");
        request.setCity("Test City");
        request.setCountry("Test Country");
        request.setEmergencyContact("Emergency Contact");
        request.setEmergencyPhone("+212612345679");
        // Add required fields for validation
        request.setSkills(new HashSet<>(Collections.singleton("Programming")));
        request.setAvailableDays(new HashSet<>(Collections.singleton("MONDAY")));

        when(userRepository.findById(volunteerId)).thenReturn(Optional.of(testUser));
        when(volunteerProfileRepository.findByUserId(volunteerId)).thenReturn(Optional.empty());
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(invocation -> {
            VolunteerProfile savedProfile = invocation.getArgument(0);
            savedProfile.setId("newProfile123");
            return savedProfile;
        });

        // Act
        VolunteerProfileResponse result = volunteerProfileService.createProfile(volunteerId, request);

        // Assert
        assertNotNull(result);
        assertEquals("New volunteer bio", result.getBio());
        verify(volunteerProfileRepository).save(any(VolunteerProfile.class));
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
        request.setSkills(new HashSet<>(Collections.singleton("Programming")));
        request.setAvailableDays(new HashSet<>(Collections.singleton("MONDAY")));

        when(volunteerProfileRepository.findByUserId(volunteerId)).thenReturn(Optional.of(testProfile));
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        VolunteerProfileResponse result = volunteerProfileService.updateProfile(volunteerId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated volunteer bio", result.getBio());
        verify(volunteerProfileRepository).save(any(VolunteerProfile.class));
    }

    @Test
    void deleteProfile_ShouldDeleteExistingProfile() {
        // Arrange
        when(volunteerProfileRepository.findByUserId(volunteerId)).thenReturn(Optional.of(testProfile));

        // Act
        volunteerProfileService.deleteProfile(volunteerId);

        // Assert
        verify(volunteerProfileRepository).delete(testProfile);
    }

    @Test
    void searchVolunteers_ShouldReturnMatchingProfiles() {
        // Arrange
        String searchQuery = "Test";
        when(volunteerProfileRepository.findAll()).thenReturn(Collections.singletonList(testProfile));

        // Act
        List<VolunteerProfileResponse> results = volunteerProfileService.searchVolunteers(searchQuery);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test", results.get(0).getFirstName());
        assertEquals("Volunteer", results.get(0).getLastName());
    }

    @Test
    void updateVolunteerApprovalStatus_ShouldUpdateStatus() {
        // Arrange
        when(volunteerProfileRepository.findByUserId(volunteerId)).thenReturn(Optional.of(testProfile));
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        VolunteerProfileResponse result = volunteerProfileService.updateVolunteerApprovalStatus(volunteerId, "APPROVED", null);

        // Assert
        assertNotNull(result);
        // Add assertions for approval status when you know the exact field names
        verify(volunteerProfileRepository).save(any(VolunteerProfile.class));
    }
} 