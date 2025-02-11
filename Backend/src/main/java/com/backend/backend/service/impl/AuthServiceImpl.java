package com.backend.backend.service.impl;

import com.backend.backend.domain.model.User;
import com.backend.backend.dto.request.LoginRequest;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.response.AuthResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.repository.VerificationTokenRepository;
import com.backend.backend.security.jwt.JwtTokenProvider;
import com.backend.backend.service.interfaces.AuthService;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.service.interfaces.TokenBlacklistService;
import com.backend.backend.service.interfaces.OAuth2Service;
import org.springframework.security.oauth2.core.user.OAuth2User;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.backend.security.UserPrincipal;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
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
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
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

        User savedUser = userRepository.save(user);
        
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDetails.builder()
                    .id(savedUser.getId())
                    .email(savedUser.getEmail())
                    .roles(List.of(savedUser.getRole()))
                    .emailVerified(false)
                    .build())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email/password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("Invalid email/password", HttpStatus.UNAUTHORIZED);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

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

    @Override
    public void logout(String token) {
        tokenBlacklistService.blacklist(token);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (tokenBlacklistService.isBlacklisted(refreshToken)) {
            throw new CustomException("Token is blacklisted", HttpStatus.UNAUTHORIZED);
        }

        String email = jwtTokenProvider.getUsernameFromJWT(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String newAccessToken = jwtTokenProvider.generateAccessToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
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

    @Override
    public boolean validateToken(String token) {
        if (tokenBlacklistService.isBlacklisted(token)) {
            return false;
        }
        return jwtTokenProvider.validateToken(token);
    }

    @Override
    @Transactional
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
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String resetCode = generateVerificationCode();
        
        // Save the reset code immediately
        user.setResetPasswordCode(resetCode);
        user.setResetPasswordCodeExpiryDate(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        // Then send the email
        emailService.sendPasswordResetEmail(email, resetCode);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        // Add debug logging
        System.out.println("Stored code: " + user.getResetPasswordCode());
        System.out.println("Received code: " + code);
        System.out.println("Expiry date: " + user.getResetPasswordCodeExpiryDate());

        if (user.getResetPasswordCode() == null) {
            throw new CustomException("No reset code was requested", HttpStatus.BAD_REQUEST);
        }

        if (!user.getResetPasswordCode().equals(code)) {
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
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
    }

    @Override
    public AuthResponse handleOAuth2Callback(String provider, String code, String state) {
        OAuth2User oauth2User = oauth2Service.processOAuthPostLogin(code);
        User user = userRepository.findByEmail(oauth2User.getAttribute("email"))
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        
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

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }


    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }
    
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
} 