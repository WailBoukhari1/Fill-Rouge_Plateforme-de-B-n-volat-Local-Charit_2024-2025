package com.backend.volunteering.service.interfaces;

import com.backend.volunteering.dto.request.LoginRequest;
import com.backend.volunteering.dto.request.SignupRequest;
import com.backend.volunteering.dto.response.AuthResponse;

public interface IAuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse signup(SignupRequest signupRequest);
    AuthResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
} 