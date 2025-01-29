package com.backend.backend.service.impl;

import com.backend.backend.domain.model.User;
import com.backend.backend.domain.model.VerificationToken;
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

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.backend.security.UserPrincipal;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;
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
        
        // Generate distinct tokens with different purposes
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .emailVerified(false)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Generate distinct tokens
            String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .email(user.getEmail())
                    .role(user.getRole())
                    .emailVerified(user.isEmailVerified())
                    .build();

        } catch (BadCredentialsException e) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
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

        Authentication authentication = new UsernamePasswordAuthenticationToken(
            UserPrincipal.create(user),
            null,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String newToken = jwtTokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(newToken)
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
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

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private void sendVerificationEmail(String email, String token) {
        String subject = "Please verify your email";
        String url = "http://localhost:4200/verify-email?token=" + token;
        String text = "Please click on the link below to verify your email:\n" + url;
        
        emailService.sendEmail(email, subject, text);
    }

    private void sendPasswordResetEmail(String email, String code) {
        emailService.sendPasswordResetEmail(email, code);
    }

    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }
    
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
} 