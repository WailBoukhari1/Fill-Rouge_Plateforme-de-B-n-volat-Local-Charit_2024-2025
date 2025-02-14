package com.backend.backend.controller;

import com.backend.backend.dto.request.LoginRequest;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.request.PasswordUpdateRequest;
import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.dto.response.AuthResponse;
import com.backend.backend.service.interfaces.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.register(request),
            "Registration successful"
        ));
    }

    @PostMapping("/login")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.login(request),
            "Login successful"
        ));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ") && token.length() > 7) {
            authService.logout(token.substring(7));
            return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
        }
        throw new CustomException("Invalid token format", HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/refresh-token")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestHeader("Refresh-Token") @NotBlank String refreshToken) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.refreshToken(refreshToken),
            "Token refreshed successfully"
        ));
    }

    @PostMapping("/verify-email")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam @Email String email,
            @RequestParam @NotBlank String code) {
        authService.verifyEmail(email, code);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(
            @RequestParam @Email String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification email resent successfully"));
    }

    @PostMapping("/password/reset-request")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<Void>> initiatePasswordReset(
            @RequestParam @Email String email) {
        authService.initiatePasswordReset(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset email sent"));
    }

    @PostMapping("/password/reset")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<Void>> completePasswordReset(
            @RequestParam @Email String email,
            @RequestParam @NotBlank String code,
            @RequestParam @NotBlank String newPassword) {
        authService.completePasswordReset(email, code, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successful"));
    }

    @PostMapping("/password/change")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal OAuth2User user,
            @Valid @RequestBody PasswordUpdateRequest request) {
        authService.changePassword(user.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @PostMapping("/oauth2/login/{provider}")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<ApiResponse<AuthResponse>> handleOAuth2Login(
            @PathVariable String provider,
            @RequestParam String code) {
        return ResponseEntity.ok(ApiResponse.success(
            authService.handleOAuth2Login(provider, code),
            "OAuth2 login successful"
        ));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OAuth2User>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        return ResponseEntity.ok(ApiResponse.success(oauth2User, "Current user retrieved successfully"));
    }
} 