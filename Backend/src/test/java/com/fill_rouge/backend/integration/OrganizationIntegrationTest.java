package com.fill_rouge.backend.integration;

import com.fill_rouge.backend.config.BaseMongoTestContainer;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import com.fill_rouge.backend.repository.OrganizationRepository;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.service.organization.OrganizationService;
import com.fill_rouge.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class OrganizationIntegrationTest extends BaseMongoTestContainer {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationService organizationService;

    private User organizationUser;
    private String userId;
    private Organization testOrganization;
    private String organizationId;

    @BeforeEach
    void setUp() {
        // Clean repositories
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        // Create organization user
        organizationUser = TestDataFactory.createOrganizationUser("org@example.com");
        organizationUser = userRepository.save(organizationUser);
        userId = organizationUser.getId();

        // Create a test organization
        testOrganization = new Organization();
        testOrganization.setName("Test Organization");
        testOrganization.setDescription("Test organization description");
        testOrganization.setVerified(true);
        testOrganization.setUser(organizationUser);
        testOrganization.setRegistrationNumber("REG123456");
        testOrganization.setFocusAreas(new HashSet<>(java.util.Arrays.asList("Education")));
        testOrganization = organizationRepository.save(testOrganization);
        organizationId = testOrganization.getId();
    }

    @AfterEach
    void tearDown() {
        organizationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getOrganization_ShouldReturnOrganization_WhenOrganizationExists() {
        // Act
        OrganizationResponse result = organizationService.getOrganization(organizationId);

        // Assert
        assertNotNull(result);
        assertEquals(organizationId, result.getId());
        assertEquals("Test Organization", result.getName());
        assertEquals("Test organization description", result.getDescription());
        assertTrue(result.isVerified());
    }

    @Test
    void createOrganization_ShouldCreateNewOrganization() {
        // Arrange
        OrganizationRequest request = new OrganizationRequest();
        request.setName("New Organization");
        request.setDescription("New description");
        request.setWebsite("https://example.com");
        request.setRegistrationNumber("REG123456");
        request.setFocusAreas(new HashSet<>(java.util.Arrays.asList("Education", "Environment")));

        // Act
        OrganizationResponse result = organizationService.createOrganization(userId, request);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("New Organization", result.getName());
        assertEquals("New description", result.getDescription());
        assertEquals("https://example.com", result.getWebsite());

        // Verify in database
        Optional<Organization> savedOrg = organizationRepository.findById(result.getId());
        assertTrue(savedOrg.isPresent());
        assertEquals("New Organization", savedOrg.get().getName());
    }

    @Test
    void updateOrganization_ShouldUpdateExistingOrganization() {
        // Arrange
        OrganizationRequest request = new OrganizationRequest();
        request.setName("Updated Organization");
        request.setDescription("Updated description");
        request.setRegistrationNumber("REG123456");
        request.setFocusAreas(new HashSet<>(java.util.Arrays.asList("Healthcare", "Poverty")));

        // Act
        OrganizationResponse result = organizationService.updateOrganization(organizationId, request);

        // Assert
        assertNotNull(result);
        assertEquals(organizationId, result.getId());
        assertEquals("Updated Organization", result.getName());
        assertEquals("Updated description", result.getDescription());

        // Verify in database
        Optional<Organization> updatedOrg = organizationRepository.findById(organizationId);
        assertTrue(updatedOrg.isPresent());
        assertEquals("Updated Organization", updatedOrg.get().getName());
    }

    @Test
    void deleteOrganization_ShouldRemoveOrganization() {
        // Act
        organizationService.deleteOrganization(organizationId);

        // Assert
        Optional<Organization> result = organizationRepository.findById(organizationId);
        assertFalse(result.isPresent());
    }

    @Test
    void verifyOrganization_ShouldUpdateVerificationStatus() {
        // Arrange - Create unverified organization
        Organization unverifiedOrg = new Organization();
        unverifiedOrg.setName("Unverified Organization");
        unverifiedOrg.setDescription("Unverified description");
        unverifiedOrg.setVerified(false);
        unverifiedOrg.setUser(organizationUser);
        unverifiedOrg.setRegistrationNumber("REG789012");
        unverifiedOrg = organizationRepository.save(unverifiedOrg);

        // Act
        organizationService.verifyOrganization(unverifiedOrg.getId());

        // Assert
        Optional<Organization> result = organizationRepository.findById(unverifiedOrg.getId());
        assertTrue(result.isPresent());
        assertTrue(result.get().isVerified());
    }

    @Test
    void getAllOrganizations_ShouldReturnAllOrganizations() {
        // Arrange - Create another organization
        Organization anotherOrg = new Organization();
        anotherOrg.setName("Another Organization");
        anotherOrg.setDescription("Another description");
        anotherOrg.setUser(organizationUser);
        anotherOrg.setRegistrationNumber("REG456789");
        organizationRepository.save(anotherOrg);

        // Act
        List<OrganizationResponse> results = organizationService.getAllOrganizations();

        // Assert
        assertNotNull(results);
        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(org -> org.getName().equals("Test Organization")));
        assertTrue(results.stream().anyMatch(org -> org.getName().equals("Another Organization")));
    }
} 