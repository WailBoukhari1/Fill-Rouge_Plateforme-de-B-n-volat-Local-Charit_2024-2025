package com.backend.backend.service.impl;

import com.backend.backend.dto.request.LoginRequest;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.request.PasswordUpdateRequest;
import com.backend.backend.dto.response.AuthResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.repository.VerificationTokenRepository;
import com.backend.backend.security.jwt.JwtTokenProvider;
import com.backend.backend.service.interfaces.AuthService;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.service.interfaces.TokenBlacklistService;
import com.backend.backend.service.interfaces.OAuth2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklistService tokenBlacklistService;
    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final OAuth2Service oauth2Service;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already registered", HttpStatus.BAD_REQUEST);
        }

        // Create new user
        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(request.getRole())
            .enabled(true)
            .emailVerified(false)
            .build();

        // Save user
        user = userRepository.save(user);

        // Generate verification code
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiryDate(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        // Return response without tokens since user needs to verify email first
        return AuthResponse.builder()
            .success(true)
            .message("Registration successful. Please check your email to verify your account.")
            .user(AuthResponse.UserDetails.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(List.of(user.getRole()))
                .emailVerified(false)
                .build())
            .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            // First check if user exists and get their status
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

            // Check email verification before attempting authentication
            if (!user.isEmailVerified()) {
                throw new CustomException("Email not verified. Please verify your email to activate your account.", HttpStatus.FORBIDDEN);
            }

            // Check if user is enabled
            if (!user.isEnabled()) {
                throw new CustomException("Account is disabled. Please contact support.", HttpStatus.FORBIDDEN);
            }

            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Generate tokens
            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(request.getEmail());

            return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDetails.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .roles(List.of(user.getRole()))
                    .emailVerified(user.isEmailVerified())
                    .profilePicture(user.getProfilePicture())
                    .build())
                .build();
        } catch (BadCredentialsException e) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }

    @Override
    public void logout(String token) {
        revokeToken(token);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (tokenBlacklistService.isBlacklisted(refreshToken)) {
            throw new CustomException("Token is blacklisted", HttpStatus.UNAUTHORIZED);
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String newAccessToken = jwtTokenProvider.generateAccessToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Override
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new CustomException("Email already verified", HttpStatus.BAD_REQUEST);
        }

        if (!user.getVerificationCode().equals(code)) {
            throw new CustomException("Invalid verification code", HttpStatus.BAD_REQUEST);
        }

        if (LocalDateTime.now().isAfter(user.getVerificationCodeExpiryDate())) {
            throw new CustomException("Verification code has expired", HttpStatus.BAD_REQUEST);
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiryDate(null);
        userRepository.save(user);
    }

    @Override
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new CustomException("Email already verified", HttpStatus.BAD_REQUEST);
        }

        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiryDate(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendVerificationEmail(email, verificationCode);
    }

    @Override
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String resetCode = generateVerificationCode();
        user.setResetPasswordCode(resetCode);
        user.setResetPasswordCodeExpiryDate(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(email, resetCode);
    }

    @Override
    public void completePasswordReset(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (user.getResetPasswordCode() == null || !user.getResetPasswordCode().equals(code)) {
            throw new CustomException("Invalid reset code", HttpStatus.BAD_REQUEST);
        }

        if (LocalDateTime.now().isAfter(user.getResetPasswordCodeExpiryDate())) {
            throw new CustomException("Reset code has expired", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordCode(null);
        user.setResetPasswordCodeExpiryDate(null);
        userRepository.save(user);
    }

    @Override
    public void changePassword(String userId, PasswordUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException("New passwords don't match", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        revokeAllUserTokens(userId);
    }

    @Override
    public AuthResponse handleOAuth2Login(String provider, String code) {
        OAuth2User oauth2User = oauth2Service.processOAuthPostLogin(code);
        User user = userRepository.findByEmail(oauth2User.getAttribute("email"))
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public void revokeToken(String token) {
        tokenBlacklistService.blacklist(token);
    }

    @Override
    public void revokeAllUserTokens(String userId) {
        // Implementation depends on your token storage strategy
        // This is a simplified version that just invalidates the current token
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        // For now, we just invalidate the current session
        // In a production environment, you would want to track and revoke all active tokens
        tokenBlacklistService.blacklist(jwtTokenProvider.generateAccessToken(user.getEmail()));
    }

    @Override
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public void invalidateAllUserSessions(String userId) {
        revokeAllUserTokens(userId);
    }

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDetails.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .roles(List.of(user.getRole()))
                    .emailVerified(user.isEmailVerified())
                    .profilePicture(user.getProfilePicture())
                    .build())
                .build();
    }
} 