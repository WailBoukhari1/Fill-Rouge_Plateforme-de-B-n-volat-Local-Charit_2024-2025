package com.fill_rouge.backend.integration;

import com.fill_rouge.backend.config.BaseMongoTestContainer;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class UserRepositoryIntegrationTest extends BaseMongoTestContainer {

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        // Clean repository
        userRepository.deleteAll();

        // Create test user
        testUser = TestDataFactory.createUser(testEmail);
        testUser = userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    void findById_ShouldReturnUser_WhenUserExists() {
        // Act
        Optional<User> result = userRepository.findById(testUser.getId());

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
        assertEquals(testEmail, result.get().getEmail());
    }

    @Test
    void findByEmail_ShouldReturnUser_WhenUserExists() {
        // Act
        Optional<User> result = userRepository.findByEmail(testEmail);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
        assertEquals(testEmail, result.get().getEmail());
    }

    @Test
    void save_ShouldCreateNewUser() {
        // Arrange
        String newEmail = "new@example.com";
        User newUser = TestDataFactory.createUser(newEmail);

        // Act
        User savedUser = userRepository.save(newUser);

        // Assert
        assertNotNull(savedUser.getId());
        assertEquals(newEmail, savedUser.getEmail());

        // Verify in database
        Optional<User> found = userRepository.findById(savedUser.getId());
        assertTrue(found.isPresent());
        assertEquals(newEmail, found.get().getEmail());
    }

    @Test
    void findUsersWithDifferentRoles() {
        // Arrange
        // Create admin user
        User adminUser = TestDataFactory.createAdminUser("admin@example.com");
        userRepository.save(adminUser);

        // Create organization user
        User orgUser = TestDataFactory.createOrganizationUser("org@example.com");
        userRepository.save(orgUser);

        // Act
        List<User> allUsers = userRepository.findAll();
        
        // Filter manually by role
        List<User> volunteerUsers = allUsers.stream()
                .filter(user -> user.getRole() == Role.VOLUNTEER)
                .toList();
                
        List<User> adminUsers = allUsers.stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .toList();
                
        List<User> orgUsers = allUsers.stream()
                .filter(user -> user.getRole() == Role.ORGANIZATION)
                .toList();

        // Assert
        assertEquals(1, volunteerUsers.size());
        assertEquals(1, adminUsers.size());
        assertEquals(1, orgUsers.size());
        
        assertEquals(testEmail, volunteerUsers.get(0).getEmail());
        assertEquals("admin@example.com", adminUsers.get(0).getEmail());
        assertEquals("org@example.com", orgUsers.get(0).getEmail());
    }

    @Test
    void delete_ShouldRemoveUser() {
        // Act
        userRepository.delete(testUser);

        // Assert
        Optional<User> result = userRepository.findById(testUser.getId());
        assertFalse(result.isPresent());
    }
} 