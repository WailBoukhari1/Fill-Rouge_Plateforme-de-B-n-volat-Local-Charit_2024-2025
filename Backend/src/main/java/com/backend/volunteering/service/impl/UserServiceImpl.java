package com.backend.volunteering.service.impl;

import com.backend.volunteering.model.VerificationToken;
import com.backend.volunteering.model.enums.UserStatus;
import com.backend.volunteering.repository.UserRepository;
import com.backend.volunteering.repository.VerificationTokenRepository;
import com.backend.volunteering.service.interfaces.IEmailService;
import com.backend.volunteering.service.interfaces.IUserService;
import com.backend.volunteering.model.User;
import com.backend.volunteering.dto.request.UserUpdateRequest;
import com.backend.volunteering.dto.response.UserResponse;
import com.backend.volunteering.exception.BadRequestException;
import com.backend.volunteering.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.volunteering.util.ValidationUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToUserResponse);
    }

    @Override
    public UserResponse updateUser(String id, UserUpdateRequest updateRequest) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getImageUrl() != null) {
            user.setImageUrl(updateRequest.getImageUrl());
        }
        
        return mapToUserResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    @Override
    public void changePassword(String id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setImageUrl(user.getImageUrl());
        response.setEmailVerified(user.isEmailVerified());
        response.setProvider(user.getProvider());
        response.setRoles(user.getRoles());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    @Override
    @Transactional
    public void verifyEmail(String code) {
        User user = userRepository.findByVerificationToken(code)
            .orElseThrow(() -> new BadRequestException("Invalid verification code"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationToken(null);
        userRepository.save(user);
        
        log.info("User email verified successfully: {}", user.getEmail());
    }

    private String generateVerificationCode() {
        // Generate a 6-digit code
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Async
    @Override
    public void sendVerificationEmail(User user) {
        String code = generateVerificationCode();
        user.setVerificationToken(code); // Reuse verificationToken field for the code
        user = userRepository.save(user);
        
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), code);
    }

    @Override
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Delete any existing password reset tokens for this user
        tokenRepository.findByUserIdAndType(user.getId(), VerificationToken.TokenType.PASSWORD_RESET)
            .ifPresent(tokenRepository::delete);

        // Create new password reset token
        VerificationToken resetToken = new VerificationToken();
        resetToken.setToken(generateVerificationCode());
        resetToken.setUserId(user.getId());
        resetToken.setType(VerificationToken.TokenType.PASSWORD_RESET);
        resetToken.setExpiryDate(Instant.now().plus(1, ChronoUnit.HOURS));
        tokenRepository.save(resetToken);

        // Send password reset email
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        VerificationToken resetToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid password reset token"));

        if (resetToken.isExpired()) {
            throw new BadRequestException("Token has expired");
        }

        if (resetToken.isUsed()) {
            throw new BadRequestException("Token has already been used");
        }

        if (resetToken.getType() != VerificationToken.TokenType.PASSWORD_RESET) {
            throw new BadRequestException("Invalid token type");
        }

        User user = userRepository.findById(resetToken.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", resetToken.getUserId()));

        // Validate new password
        ValidationUtil.validatePassword(newPassword);

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Override
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        sendVerificationEmail(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
} 