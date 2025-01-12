package com.backend.volunteering.service.impl;

import com.backend.volunteering.model.VerificationToken;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;

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
    public void verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (verificationToken.isExpired()) {
            throw new BadRequestException("Token has expired");
        }

        if (verificationToken.isUsed()) {
            throw new BadRequestException("Token has already been used");
        }

        if (verificationToken.getType() != VerificationToken.TokenType.EMAIL_VERIFICATION) {
            throw new BadRequestException("Invalid token type");
        }

        User user = userRepository.findById(verificationToken.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", verificationToken.getUserId()));

        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
    }

    public void sendVerificationEmail(User user) {
        // Delete any existing verification tokens for this user
        tokenRepository.findByUserIdAndType(user.getId(), VerificationToken.TokenType.EMAIL_VERIFICATION)
            .ifPresent(tokenRepository::delete);

        // Create new verification token
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(generateToken());
        verificationToken.setUserId(user.getId());
        verificationToken.setType(VerificationToken.TokenType.EMAIL_VERIFICATION);
        verificationToken.setExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        tokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
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
        resetToken.setToken(generateToken());
        resetToken.setUserId(user.getId());
        resetToken.setType(VerificationToken.TokenType.PASSWORD_RESET);
        resetToken.setExpiryDate(Instant.now().plus(1, ChronoUnit.HOURS)); // 1 hour expiry for password reset
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
} 