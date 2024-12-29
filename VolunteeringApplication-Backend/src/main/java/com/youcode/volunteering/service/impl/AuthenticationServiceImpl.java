package com.youcode.volunteering.service.impl;

import com.youcode.volunteering.dto.auth.AuthResponse;
import com.youcode.volunteering.dto.auth.LoginRequest;
import com.youcode.volunteering.dto.auth.RegisterRequest;
import com.youcode.volunteering.model.Role;
import com.youcode.volunteering.model.User;
import com.youcode.volunteering.repository.UserRepository;
import com.youcode.volunteering.security.jwt.JwtService;
import com.youcode.volunteering.service.EmailService;
import com.youcode.volunteering.service.IAuthenticationService;
import com.youcode.volunteering.mapper.AuthMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final RedisTemplate<String, String> redisTemplate;
    private final AuthMapper authMapper;
    
    private static final String PASSWORD_RESET_PREFIX = "password:reset:";
    private static final long PASSWORD_RESET_EXPIRATION = 15; // 15 minutes

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = authMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        userRepository.save(user);
        var token = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        
        var token = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    @Override
    public void initiatePasswordReset(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        
        // Store the reset token in Redis with expiration
        redisTemplate.opsForValue().set(
            PASSWORD_RESET_PREFIX + resetToken,
            user.getEmail(),
            PASSWORD_RESET_EXPIRATION,
            TimeUnit.MINUTES
        );

        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        // Get email from reset token
        String email = redisTemplate.opsForValue().get(PASSWORD_RESET_PREFIX + token);
        if (email == null) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        // Find and update user
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete used token
        redisTemplate.delete(PASSWORD_RESET_PREFIX + token);
    }
} 