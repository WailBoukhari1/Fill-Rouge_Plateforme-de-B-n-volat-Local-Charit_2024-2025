package com.fill_rouge.backend.service.auth;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fill_rouge.backend.config.security.JwtService;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.Skill;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.LoginRequest;
import com.fill_rouge.backend.dto.request.QuestionnaireRequest;
import com.fill_rouge.backend.dto.request.RegisterRequest;
import com.fill_rouge.backend.dto.response.AuthResponse;
import com.fill_rouge.backend.repository.OrganizationRepository;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.repository.VolunteerProfileRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationServiceImpl.class);
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_TIME_MINUTES = 30;

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final HttpServletRequest request;


    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        try {
            // Check if email exists
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                throw new RuntimeException("Email already exists");
            }

            // Validate password match
            if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
                throw new RuntimeException("Passwords do not match");
            }

            // Validate password
            validatePassword(registerRequest.getPassword());

            // Create user
            User user = new User();
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            // Set initial role as UNASSIGNED
            user.setRole(Role.UNASSIGNED);
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiry(LocalDateTime.now().plusHours(24));
            user.setEnabled(false);
            user.setEmailVerified(false);
            user.setPasswordLastChanged(LocalDateTime.now());
            user.setPreviousPasswords(new ArrayList<>());
            
            user = userRepository.save(user);

            // Generate tokens
            String jwt = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Send verification email
            sendVerificationEmail(user);

            return createAuthResponse(user, jwt, refreshToken);
        } catch (Exception e) {
            logger.error("Registration failed", e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        logger.debug("Attempting login for email: {}", request.getEmail());
        
        try {
            // First check if user exists
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

            // Check if account is locked
            if (!user.isAccountNonLocked()) {
                logger.warn("Account is locked for user: {}", request.getEmail());
                throw new DisabledException("Account is locked. Please contact support.");
            }

            // Check if email is verified
            if (!user.isEmailVerified()) {
                logger.warn("Email not verified for user: {}", request.getEmail());
                throw new DisabledException("Please verify your email before logging in.");
            }

            try {
                // Attempt authentication using Spring Security
                Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                    )
                );

                // If authentication successful, reset failed attempts
                user.setFailedLoginAttempts(0);
                user.setLastLoginAttempt(null);
                user.setAccountLockedUntil(null);

                // Ensure user has a role
                if (user.getRole() == null) {
                    logger.warn("User {} has no role assigned, setting default UNASSIGNED role", user.getEmail());
                    user.setRole(Role.UNASSIGNED);
                }

                // Generate tokens
                String token = jwtService.generateToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                // Update last login info
                user.setLastLoginDate(LocalDateTime.now());
                user.setLastLoginIp(request.getIpAddress());
                userRepository.save(user);

                // Build response
                return AuthResponse.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .roles(Set.of(user.getRole().name()))
                        .emailVerified(user.isEmailVerified())
                        .twoFactorEnabled(user.isTwoFactorEnabled())
                        .accountLocked(!user.isAccountNonLocked())
                        .accountExpired(!user.isAccountNonExpired())
                        .credentialsExpired(!user.isCredentialsNonExpired())
                        .token(token)
                        .refreshToken(refreshToken)
                        .lastLoginIp(user.getLastLoginIp())
                        .lastLoginAt(user.getLastLoginDate())
                        .questionnaireCompleted(user.isQuestionnaireCompleted())
                        .build();

            } catch (BadCredentialsException e) {
                // Handle failed login attempt
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                user.setLastLoginAttempt(LocalDateTime.now());

                // Check if account should be locked
                if (user.getFailedLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
                    user.setAccountNonLocked(false);
                    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIME_MINUTES));
                    logger.warn("Account locked for user {} due to too many failed attempts", user.getEmail());
                }

                userRepository.save(user);
                throw new BadCredentialsException("Invalid email or password");
            }

        } catch (DisabledException e) {
            logger.error("Login failed - Account disabled: {}", e.getMessage());
            throw e;
        } catch (BadCredentialsException e) {
            logger.error("Login failed - Bad credentials for email: {}", request.getEmail());
            throw e;
        } catch (Exception e) {
            logger.error("Login failed - Unexpected error: {}", e.getMessage());
            throw new RuntimeException("An unexpected error occurred during login");
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        try {
            String userEmail = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (jwtService.isTokenValid(refreshToken, user)) {
                String jwt = jwtService.generateToken(user);
                return createAuthResponse(user, jwt, refreshToken);
            }
            throw new RuntimeException("Invalid refresh token");
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String code) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getVerificationCode().equals(code)) {
                throw new RuntimeException("Invalid verification code");
            }

            if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code has expired");
            }

            user.setEmailVerified(true);
            user.setEnabled(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiry(null);
            userRepository.save(user);
        } catch (Exception e) {
            logger.error("Email verification failed", e);
            throw new RuntimeException("Email verification failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void resendVerificationCode(String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.isEmailVerified()) {
                throw new RuntimeException("Email is already verified");
            }

            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            sendVerificationEmail(user);
        } catch (Exception e) {
            logger.error("Resend verification code failed", e);
            throw new RuntimeException("Failed to resend verification code: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String resetCode = generateVerificationCode();
            user.setResetPasswordToken(resetCode);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            sendPasswordResetEmail(user);
        } catch (Exception e) {
            logger.error("Password reset request failed", e);
            throw new RuntimeException("Password reset request failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void resetPassword(String code, String newPassword) {
        try {
            User user = userRepository.findByResetPasswordToken(code)
                    .orElseThrow(() -> new RuntimeException("Invalid reset code"));

            if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Reset code has expired");
            }

            validatePassword(newPassword);
            validatePasswordHistory(user, newPassword);

            // Update password history
            if (user.getPreviousPasswords() == null) {
                user.setPreviousPasswords(new ArrayList<>());
            }
            user.getPreviousPasswords().add(user.getPassword());
            if (user.getPreviousPasswords().size() > 5) { // Keep last 5 passwords
                user.getPreviousPasswords().remove(0);
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            user.setPasswordLastChanged(LocalDateTime.now());
            userRepository.save(user);
        } catch (Exception e) {
            logger.error("Password reset failed", e);
            throw new RuntimeException("Password reset failed: " + e.getMessage());
        }
    }

    @Override
    public void logout(String jwt) {
        // Implement token blacklisting or other logout logic if needed
    }

    @Override
    @Transactional
    public AuthResponse completeQuestionnaire(String email, QuestionnaireRequest request) {
        final User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate that the user has an UNASSIGNED role
        if (!Role.UNASSIGNED.equals(user.getRole())) {
            throw new RuntimeException("User role has already been assigned");
        }
        
        // Update user information based on questionnaire
        user.setQuestionnaireCompleted(true);
        
        // Handle role-specific information
        if (Role.VOLUNTEER.equals(request.getRole())) {
            user.setRole(Role.VOLUNTEER);
            // Create or update volunteer profile
            final String finalEmail = email;
            final User finalUser = user;
            VolunteerProfile profile = volunteerProfileRepository.findByUserEmail(finalEmail)
                .orElseGet(() -> {
                    VolunteerProfile newProfile = new VolunteerProfile();
                    newProfile.setUser(finalUser);
                    newProfile.setCreatedAt(LocalDateTime.now());
                    newProfile.setStatus("ACTIVE");
                    newProfile.setActive(true);
                    newProfile.setProfileVisible(true);
                    return newProfile;
                });
            
            // Update profile with questionnaire data
            profile.setBio(request.getBio());
            profile.setPhoneNumber(request.getPhoneNumber());
            profile.setAddress(request.getAddress());
            profile.setCity(request.getCity());
            profile.setCountry(request.getCountry());
            
            // Update volunteer-specific fields
            if (request.getEducation() != null) {
                profile.setEducation(request.getEducation());
            }
            if (request.getExperience() != null) {
                profile.setExperience(request.getExperience());
            }
            if (request.getSpecialNeeds() != null) {
                profile.setSpecialNeeds(request.getSpecialNeeds());
            }
            if (request.getSkills() != null) {
                List<Skill> skillsList = new ArrayList<>();
                for (String skillName : request.getSkills()) {
                    Skill skill = new Skill();
                    skill.setName(skillName);
                    skillsList.add(skill);
                }
                profile.setSkills(skillsList);
            }
            if (request.getInterests() != null) {
                profile.setInterests(new HashSet<>(request.getInterests()));
            }
            if (request.getAvailableDays() != null) {
                profile.setAvailableDays(new HashSet<>(request.getAvailableDays()));
            }
            if (request.getPreferredTimeOfDay() != null) {
                profile.setPreferredTimeOfDay(request.getPreferredTimeOfDay());
            }
            if (request.getLanguages() != null) {
                profile.setLanguages(new ArrayList<>(request.getLanguages()));
            }
            if (request.getCertifications() != null) {
                profile.setCertifications(new ArrayList<>(request.getCertifications()));
            }
            
            profile.setAvailableForEmergency(request.isAvailableForEmergency());
            
            // Handle emergency contact
            if (request.getEmergencyContact() != null) {
                VolunteerProfile.EmergencyContact emergencyContact = new VolunteerProfile.EmergencyContact();
                emergencyContact.setName(request.getEmergencyContact().getName());
                emergencyContact.setRelationship(request.getEmergencyContact().getRelationship());
                emergencyContact.setPhone(request.getEmergencyContact().getPhone());
                profile.setEmergencyContact(emergencyContact);
            }
            
            // Save the volunteer profile
            profile = volunteerProfileRepository.save(profile);
            
        } else if (Role.ORGANIZATION.equals(request.getRole())) {
            user.setRole(Role.ORGANIZATION);
            // Create or update organization profile
            final User finalUser = user;
            Organization org = organizationRepository.findByUserId(finalUser.getId())
                .orElseGet(() -> {
                    Organization newOrg = new Organization();
                    newOrg.setUser(finalUser);
                    newOrg.setCreatedAt(LocalDateTime.now());
                    newOrg.setVerified(false);
                    newOrg.setAcceptingVolunteers(true);
                    return newOrg;
                });
            
            // Update organization with questionnaire data
            org.setName(request.getName());
            org.setDescription(request.getDescription());
            org.setMission(request.getMissionStatement());
            org.setVision(request.getVision());
            org.setWebsite(request.getWebsite());
            org.setPhoneNumber(request.getPhoneNumber());
            org.setAddress(request.getAddress());
            org.setCity(request.getCity());
            org.setProvince(request.getProvince());
            org.setCountry(request.getCountry());
            
            // Update organization-specific fields
            if (request.getFocusAreas() != null) {
                org.setFocusAreas(new HashSet<>(request.getFocusAreas()));
            }
            if (request.getRegistrationNumber() != null) {
                org.setRegistrationNumber(request.getRegistrationNumber());
            }
            if (request.getTaxId() != null) {
                org.setTaxId(request.getTaxId());
            }
            
            // Update social media links if provided
            if (request.getSocialMediaLinks() != null) {
                Organization.SocialMediaLinks socialMediaLinks = new Organization.SocialMediaLinks();
                socialMediaLinks.setFacebook(request.getSocialMediaLinks().getFacebook());
                socialMediaLinks.setTwitter(request.getSocialMediaLinks().getTwitter());
                socialMediaLinks.setInstagram(request.getSocialMediaLinks().getInstagram());
                socialMediaLinks.setLinkedin(request.getSocialMediaLinks().getLinkedin());
                org.setSocialMediaLinks(socialMediaLinks);
            }
            
            // Save the organization
            org = organizationRepository.save(org);
        } else {
            throw new RuntimeException("Invalid role selected");
        }
        
        // Save updated user
        User savedUser = userRepository.save(user);
        
        // Generate new tokens with updated role
        String jwtToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .userId(savedUser.getId())
                .roles(Set.of(savedUser.getRole().name()))
                .emailVerified(savedUser.isEmailVerified())
                .twoFactorEnabled(savedUser.isTwoFactorEnabled())
                .lastLoginIp(savedUser.getLastLoginIp())
                .lastLoginAt(savedUser.getLastLoginDate())
                .accountLocked(!savedUser.isAccountNonLocked())
                .accountExpired(!savedUser.isAccountNonExpired())
                .credentialsExpired(!savedUser.isCredentialsNonExpired())
                .questionnaireCompleted(savedUser.isQuestionnaireCompleted())
                .build();
    }

    private void validatePassword(String password) {
        if (!password.matches("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$")) {
            throw new RuntimeException("Password must be at least 8 characters long and contain at least one digit, " +
                    "one uppercase letter, one lowercase letter, and one special character");
        }
    }

    private void validatePasswordHistory(User user, String newPassword) {
        if (user.getPreviousPasswords() != null) {
            for (String oldPassword : user.getPreviousPasswords()) {
                if (passwordEncoder.matches(newPassword, oldPassword)) {
                    throw new RuntimeException("Password has been used before");
                }
            }
        }
    }

    private AuthResponse createAuthResponse(User user, String jwt, String refreshToken) {
        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userId(user.getId())
                .roles(Set.of(user.getRole().name()))
                .emailVerified(user.isEmailVerified())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .lastLoginIp(user.getLastLoginIp())
                .lastLoginAt(user.getLastLoginDate())
                .accountLocked(!user.isAccountNonLocked())
                .accountExpired(!user.isAccountNonExpired())
                .credentialsExpired(!user.isCredentialsNonExpired())
                .questionnaireCompleted(user.isQuestionnaireCompleted())
                .success(true)
                .build();
    }

    private void sendVerificationEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject("Verify Your Email");
            
            String emailContent = String.format(
                "Hello %s,\n\n" +
                "Your email verification code is: %s\n" +
                "This code will expire in 24 hours.\n\n" +
                "If you didn't request this verification, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Your Application Team",
                user.getFirstName(),
                user.getVerificationCode()
            );
            
            helper.setText(emailContent, false);
            
            mailSender.send(message);
            logger.info("Verification email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            logger.error("Failed to send verification email", e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    private void sendPasswordResetEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject("Reset Your Password");
            
            String emailContent = String.format(
                "Hello %s,\n\n" +
                "Your password reset code is: %s\n" +
                "This code will expire in 1 hour.\n\n" +
                "If you didn't request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Your Application Team",
                user.getFirstName(),
                user.getResetPasswordToken()
            );
            
            helper.setText(emailContent, false);
            
            mailSender.send(message);
            logger.info("Password reset email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email", e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private String createVerificationEmailContent(String firstName, String verificationLink) {
        return String.format("""
            <html>
                <body>
                    <h2>Welcome to Our Platform, %s!</h2>
                    <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
                    <p><a href="%s">Verify Email Address</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you did not create an account, please ignore this email.</p>
                </body>
            </html>
            """, firstName, verificationLink);
    }

    private String createPasswordResetEmailContent(String firstName, String resetCode) {
        return String.format("""
            <html>
                <body>
                    <h2>Hello %s,</h2>
                    <p>We received a request to reset your password. Your password reset code is:</p>
                    <h3>%s</h3>
                    <p>This code will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                </body>
            </html>
            """, firstName, resetCode);
    }

    private String generateVerificationCode() {
        return String.format("%06d", new java.util.Random().nextInt(1000000));
    }

    private void createVolunteerProfile(User user) {
        VolunteerProfile profile = new VolunteerProfile();
        profile.setUser(user);
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        profile.setStatus("ACTIVE");
        profile.setActive(true);
        profile.setProfileVisible(true);
        volunteerProfileRepository.save(profile);
    }
} 