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
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email already registered", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User savedUser = userRepository.save(user);
        
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail());

        return buildAuthResponse(savedUser, accessToken, refreshToken);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

            String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

            return buildAuthResponse(user, accessToken, refreshToken);
        } catch (BadCredentialsException e) {
            throw new CustomException("Invalid email/password", HttpStatus.UNAUTHORIZED);
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