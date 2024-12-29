package com.youcode.volunteering.controller;

import com.youcode.volunteering.dto.auth.AuthResponse;
import com.youcode.volunteering.dto.auth.LoginRequest;
import com.youcode.volunteering.dto.auth.RegisterRequest;
import com.youcode.volunteering.dto.auth.ForgotPasswordRequest;
import com.youcode.volunteering.dto.auth.ResetPasswordRequest;
import com.youcode.volunteering.dto.response.ApiResponse;
import com.youcode.volunteering.service.IAuthenticationService;
import com.youcode.volunteering.security.jwt.TokenBlacklistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IAuthenticationService authenticationService;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            "User registered successfully",
            authenticationService.register(request)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            "Login successful",
            authenticationService.login(request)
        ));
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<ApiResponse<AuthResponse>> oauthSuccess(@RequestParam String token) {
        return ResponseEntity.ok(ApiResponse.success(
            "OAuth2 login successful",
            AuthResponse.builder().token(token).build()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        tokenBlacklistService.blacklistToken(token, 24 * 60 * 60 * 1000); // 24 hours
        return ResponseEntity.ok(ApiResponse.<Void>success("Logged out successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authenticationService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.<Void>success("Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.<Void>success("Password reset successfully", null));
    }
} 