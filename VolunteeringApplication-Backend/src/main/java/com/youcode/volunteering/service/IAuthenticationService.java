package com.youcode.volunteering.service;

import com.youcode.volunteering.dto.auth.AuthResponse;
import com.youcode.volunteering.dto.auth.LoginRequest;
import com.youcode.volunteering.dto.auth.RegisterRequest;

public interface IAuthenticationService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void initiatePasswordReset(String email);
    void resetPassword(String token, String newPassword);
} 