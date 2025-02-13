package com.backend.backend.service.interfaces;

import com.backend.backend.dto.request.LoginRequest;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.request.PasswordUpdateRequest;
import com.backend.backend.dto.response.AuthResponse;
import com.backend.backend.model.User;

import java.util.Optional;

public interface AuthService {
    // Authentication
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    AuthResponse refreshToken(String refreshToken);
    
    // Email Verification
    void verifyEmail(String email, String code);
    void resendVerificationEmail(String email);
    
    // Password Management
    void initiatePasswordReset(String email);
    void completePasswordReset(String email, String code, String newPassword);
    void changePassword(String userId, PasswordUpdateRequest request);
    
    // OAuth2 Operations
    AuthResponse handleOAuth2Login(String provider, String code);
    
    // Token Management
    void revokeToken(String token);
    void revokeAllUserTokens(String userId);
    void cleanupExpiredTokens();
    
    // User Management
    Optional<User> findByEmail(String email);
    User save(User user);
    
    // Session Management
    void invalidateAllUserSessions(String userId);
} 