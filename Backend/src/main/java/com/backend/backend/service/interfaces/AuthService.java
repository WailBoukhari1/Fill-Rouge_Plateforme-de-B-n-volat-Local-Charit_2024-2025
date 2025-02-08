package com.backend.backend.service.interfaces;

import com.backend.backend.dto.request.LoginRequest;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    AuthResponse refreshToken(String refreshToken);
    boolean validateToken(String token);
    void verifyEmail(String email, String code);
    void resendVerificationEmail(String email);
    void forgotPassword(String email);
    void resetPassword(String email, String code, String newPassword);
    void cleanupExpiredTokens();
    AuthResponse handleOAuth2Callback(String provider, String code, String state);
} 