package com.backend.backend.controller;

import com.backend.backend.dto.request.LoginRequest;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.AuthResponse;
import com.backend.backend.service.interfaces.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import com.backend.backend.exception.CustomException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.register(request),
            "Registration successful"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.login(request),
            "Login successful"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        // Check if token starts with "Bearer " and has content
        if (token != null && token.startsWith("Bearer ") && token.length() > 7) {
            authService.logout(token.substring(7));
            return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
        }
        throw new CustomException("Invalid token format", HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestHeader("Refresh-Token") String refreshToken) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.refreshToken(refreshToken),
            "Token refreshed successfully"
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String email, @RequestParam String code) {
        authService.verifyEmail(email, code);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(
            @RequestParam @jakarta.validation.constraints.Email String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification email resent successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestParam @jakarta.validation.constraints.Email String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String email,
            @RequestParam String code,
            @RequestParam @Size(min = 8, max = 32) String newPassword) {
        authService.resetPassword(email, code, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successful"));
    }

    @GetMapping("/oauth2/callback/{provider}")
    public ResponseEntity<ApiResponse<AuthResponse>> oauth2Callback(
            @PathVariable String provider,
            @RequestParam String code,
            @RequestParam(required = false) String state) {
        
        return ResponseEntity.ok(ApiResponse.success(
            authService.handleOAuth2Callback(provider, code, state),
            "OAuth2 login successful"
        ));
    }

    @GetMapping("/oauth2/current-user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OAuth2User>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        return ResponseEntity.ok(ApiResponse.success(oauth2User));
    }
} 