package com.fill_rouge.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DbInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        // Check if admin exists
        long adminCount = userRepository.countByRole(Role.ADMIN);
        
        if (adminCount == 0) {
            log.info("No admin account found. Creating default admin account...");
            
            // Create admin user
            User adminUser = new User();
            adminUser.setEmail("admin@localcharity.org");
            adminUser.setPassword(passwordEncoder.encode("Admin123!"));
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setEmailVerified(true);
            adminUser.setAccountNonLocked(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            
            log.info("Default admin account created successfully.");
            log.info("Email: admin@localcharity.org");
            log.info("Password: Admin123!");
            log.warn("IMPORTANT: Please change the default admin password after first login!");
        } else {
            log.info("Admin account already exists. Skipping creation.");
        }
    }
} 