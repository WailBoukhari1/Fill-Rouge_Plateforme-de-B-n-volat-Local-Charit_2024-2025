package com.fill_rouge.backend.service.organization;

import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.OrganizationRepository;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private OrganizationServiceImpl organizationService;

    private User testUser;
    private String userId;
    private Organization testOrganization;
    private String organizationId;

    @BeforeEach
    void setUp() {
        userId = "user123";
        organizationId = "org123";
        
        testUser = TestDataFactory.createUser("org@example.com");
        testUser.setId(userId);
        
        testOrganization = new Organization();
        testOrganization.setId(organizationId);
        testOrganization.setName("Test Organization");
        testOrganization.setDescription("Test description");
        testOrganization.setVerified(true);
        testOrganization.setUser(testUser);
    }

    @Test
    void getOrganization_ShouldReturnOrganization_WhenOrganizationExists() {
        // Arrange
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(testOrganization));

        // Act
        OrganizationResponse result = organizationService.getOrganization(organizationId);

        // Assert
        assertNotNull(result);
        assertEquals(organizationId, result.getId());
        assertEquals("Test Organization", result.getName());
        assertEquals("Test description", result.getDescription());
        assertTrue(result.isVerified());
    }

    @Test
    void getOrganization_ShouldThrowException_WhenOrganizationDoesNotExist() {
        // Arrange
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            organizationService.getOrganization(organizationId);
        });
    }

    @Test
    void createOrganization_ShouldReturnCreatedOrganization() {
        // Arrange
        OrganizationRequest request = new OrganizationRequest();
        request.setName("New Organization");
        request.setDescription("New description");
        request.setRegistrationNumber("REG123456");
        request.setFocusAreas(new HashSet<>(java.util.Arrays.asList("Education", "Environment")));
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
            Organization savedOrg = invocation.getArgument(0);
            savedOrg.setId(organizationId);
            return savedOrg;
        });

        // Act
        OrganizationResponse result = organizationService.createOrganization(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(organizationId, result.getId());
        assertEquals("New Organization", result.getName());
        assertEquals("New description", result.getDescription());
        verify(organizationRepository).save(any(Organization.class));
    }


    @Test
    void deleteOrganization_ShouldCallRepository() {
        // Arrange
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(testOrganization));
        when(eventRepository.findByOrganizationId(anyString(), any(Pageable.class)))
            .thenReturn(Collections.emptyList());

        // Act
        organizationService.deleteOrganization(organizationId);

        // Assert
        verify(organizationRepository).delete(testOrganization);
    }

    @Test
    void searchOrganizations_ShouldReturnMatchingOrganizations() {
        // Arrange
        String searchQuery = "Test";
        when(organizationRepository.searchByName(searchQuery)).thenReturn(Arrays.asList(testOrganization));

        // Act
        List<OrganizationResponse> results = organizationService.searchOrganizations(searchQuery);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test Organization", results.get(0).getName());
        assertEquals("Test description", results.get(0).getDescription());
    }

    @Test
    void getAllOrganizations_ShouldReturnAllOrganizations() {
        // Arrange
        Organization org2 = new Organization();
        org2.setId("org456");
        org2.setName("Another Organization");
        
        // Set User objects for both organizations to prevent NullPointerException
        testOrganization.setUser(testUser);
        User user2 = TestDataFactory.createUser("another@example.com");
        user2.setId("user456");
        org2.setUser(user2);
        
        when(organizationRepository.findAll()).thenReturn(Arrays.asList(testOrganization, org2));

        // Act
        List<OrganizationResponse> results = organizationService.getAllOrganizations();

        // Assert
        assertNotNull(results);
        assertEquals(2, results.size());
    }


    @Test
    void updateOrganization_ShouldReturnUpdatedOrganization() {
        // Arrange
        OrganizationRequest request = new OrganizationRequest();
        request.setName("Updated Organization");
        request.setDescription("Updated description");
        request.setRegistrationNumber("REG123456");
        request.setFocusAreas(new HashSet<>(java.util.Arrays.asList("Healthcare", "Poverty")));
        
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(testOrganization));
        when(organizationRepository.existsByName(request.getName())).thenReturn(false);
        when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        OrganizationResponse result = organizationService.updateOrganization(organizationId, request);

        // Assert
        assertNotNull(result);
        assertEquals(organizationId, result.getId());
        assertEquals("Updated Organization", result.getName());
        assertEquals("Updated description", result.getDescription());
        verify(organizationRepository).save(any(Organization.class));
    }
} 