package com.fill_rouge.backend.service.auth;

import com.fill_rouge.backend.dto.request.LoginRequest;
import com.fill_rouge.backend.dto.request.RegisterRequest;
import com.fill_rouge.backend.dto.request.QuestionnaireRequest;
import com.fill_rouge.backend.dto.response.AuthResponse;

public interface AuthenticationService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String jwt);
    void verifyEmail(String email, String code);
    void resendVerificationCode(String email);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    AuthResponse completeQuestionnaire(String userId, QuestionnaireRequest request);
} 