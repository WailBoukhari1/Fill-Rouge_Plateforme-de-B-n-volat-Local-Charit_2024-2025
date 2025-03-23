package com.fill_rouge.backend.config;

import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Data initializer that runs on application startup.
 * Checks if an admin account exists, and creates one if none is found.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        // Check if admin role exists by counting users with ADMIN role
        long adminCount = userRepository.countByRole(Role.ADMIN);
        
        if (adminCount == 0) {
            log.info("No admin account found. Creating default admin account...");
            
            User adminUser = new User();
            adminUser.setEmail("admin@localcharity.org");
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setPassword(passwordEncoder.encode("  "));
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setEmailVerified(true);
            adminUser.setAccountNonLocked(true);
            adminUser.setFailedLoginAttempts(0);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            adminUser.setQuestionnaireCompleted(true);
            
            userRepository.save(adminUser);
            log.info("Default admin account created successfully with email: admin@localcharity.org");
            log.info("IMPORTANT: Please change the default admin password after first login!");
        } else {
            log.info("Admin account(s) already exist. Skipping admin creation.");
        }
    }
} 