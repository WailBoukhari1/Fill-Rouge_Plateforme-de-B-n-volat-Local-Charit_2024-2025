package com.fill_rouge.backend.service.auth;

import com.fill_rouge.backend.config.security.JwtService;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.LoginRequest;
import com.fill_rouge.backend.dto.request.RegisterRequest;
import com.fill_rouge.backend.dto.request.QuestionnaireRequest;
import com.fill_rouge.backend.dto.response.AuthResponse;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.repository.VolunteerProfileRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationServiceImpl.class);
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_TIME_MINUTES = 30;

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
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

            // Validate password
            validatePassword(registerRequest.getPassword());

            // Create user
            User user = new User();
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole(Role.VOLUNTEER);
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiry(LocalDateTime.now().plusHours(24));
            user.setEnabled(false);
            user.setEmailVerified(false);
            user.setPasswordLastChanged(LocalDateTime.now());
            user.setPreviousPasswords(new ArrayList<>());
            
            user = userRepository.save(user);

            // Create volunteer profile
            VolunteerProfile profile = new VolunteerProfile();
            profile.setUser(user);
            profile.setFirstName(user.getFirstName());
            profile.setLastName(user.getLastName());
            profile.setEmail(user.getEmail());
            profile.setCreatedAt(LocalDateTime.now());
            profile.setUpdatedAt(LocalDateTime.now());
            profile.setStatus("ACTIVE");
            profile.setActive(true);
            profile.setProfileVisible(true);
            volunteerProfileRepository.save(profile);

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
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is locked
            if (user.getAccountLockedUntil() != null && LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
                throw new RuntimeException("Account is locked. Try again later");
            }

            try {
                Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
                );

                // Reset failed attempts on successful login
                user.setFailedLoginAttempts(0);
                user.setLastLoginDate(LocalDateTime.now());
                user.setLastLoginIp(request.getRemoteAddr());
                userRepository.save(user);

                String jwt = jwtService.generateToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                return createAuthResponse(user, jwt, refreshToken);
            } catch (BadCredentialsException e) {
                // Increment failed attempts
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                user.setLastLoginAttempt(LocalDateTime.now());

                if (user.getFailedLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
                    user.setAccountNonLocked(false);
                    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIME_MINUTES));
                }

                userRepository.save(user);
                throw new RuntimeException("Invalid credentials");
            }
        } catch (DisabledException e) {
            logger.error("Login failed: Account is disabled", e);
            throw new RuntimeException("Account is disabled");
        } catch (AuthenticationException e) {
            logger.error("Login failed: Authentication error", e);
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Login failed: Unexpected error", e);
            throw new RuntimeException("Login failed: " + e.getMessage());
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update user information based on questionnaire
        // We'll store these in the volunteer profile instead of the user entity
        boolean isOrganization = "ORGANIZATION".equals(request.getRole());
        
        user.setQuestionnaireCompleted(true);
        
        // Handle role-specific information
        if (isOrganization) {
            user.setRole(Role.ORGANIZATION);
            // Additional organization-specific logic can be added here
            // For example, creating an organization profile
        } else {
            // Update volunteer profile
            Optional<VolunteerProfile> profileOpt = volunteerProfileRepository.findByUserEmail(email);
            
            if (profileOpt.isEmpty()) {
                throw new RuntimeException("Volunteer profile not found");
            }
            
            VolunteerProfile profile = profileOpt.get();
            
            // Update profile with questionnaire data
            profile.setBio(request.getBio());
            profile.setPhoneNumber(request.getPhoneNumber());
            profile.setAddress(request.getAddress());
            profile.setCity(request.getCity());
            profile.setCountry(request.getCountry());
            
            // For now, we'll skip updating skills, interests, and availability
            // These can be implemented in a future update
            
            profile.setUpdatedAt(LocalDateTime.now());
            
            volunteerProfileRepository.save(profile);
        }
        
        // Save updated user
        user = userRepository.save(user);
        
        // Generate new tokens
        String jwt = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        return createAuthResponse(user, jwt, refreshToken);
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
                .roles(user.getAuthorities().stream().map(Object::toString).collect(java.util.stream.Collectors.toSet()))
                .emailVerified(user.isEmailVerified())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .lastLoginIp(user.getLastLoginIp())
                .lastLoginAt(user.getLastLoginDate())
                .accountLocked(!user.isAccountNonLocked())
                .accountExpired(!user.isAccountNonExpired())
                .credentialsExpired(!user.isCredentialsNonExpired())
                .questionnaireCompleted(user.isQuestionnaireCompleted())
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
} 