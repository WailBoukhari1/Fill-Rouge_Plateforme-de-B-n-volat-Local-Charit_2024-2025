package com.backend.volunteering.controller;

import com.backend.volunteering.dto.request.LoginRequest;
import com.backend.volunteering.dto.request.SignupRequest;
import com.backend.volunteering.dto.request.PasswordResetRequest;
import com.backend.volunteering.dto.response.ApiResponse;
import com.backend.volunteering.dto.response.AuthResponse;
import com.backend.volunteering.exception.BadRequestException;
import com.backend.volunteering.service.interfaces.IAuthService;
import com.backend.volunteering.service.interfaces.IUserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final IAuthService authService;
    private final IUserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for user: {}", loginRequest.getLoginId());
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("Signup request received for email: {}", signupRequest.getEmail());
        AuthResponse response = authService.signup(signupRequest);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        log.info("Refresh token request received");
        try {
            AuthResponse response = authService.refreshToken(refreshToken);
            log.info("Refresh token successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Refresh token failed", e);
            throw new BadRequestException("Invalid refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@RequestParam String refreshToken) {
        log.info("Logout request received");
        authService.logout(refreshToken);
        log.info("Logout successful");
        return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestParam String token) {
        log.info("Email verification request received");
        try {
            userService.verifyEmail(token);
            log.info("Email verification successful");
            return ResponseEntity.ok(new ApiResponse(true, "Email verified successfully"));
        } catch (Exception e) {
            log.error("Email verification failed", e);
            throw new BadRequestException("Invalid or expired verification token");
        }
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<ApiResponse> resendVerificationEmail(@RequestParam @Email String email) {
        log.info("Resend verification email request received");
        userService.resendVerificationEmail(email);
        return ResponseEntity.ok(new ApiResponse(true, 
            "If an account exists with this email, a verification email will be sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestParam @Email String email) {
        log.info("Forgot password request received");
        userService.requestPasswordReset(email);
        return ResponseEntity.ok(new ApiResponse(true,
            "If an account exists with this email, password reset instructions will be sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset request received");
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            log.info("Password reset successful");
            return ResponseEntity.ok(new ApiResponse(true, "Password has been reset successfully"));
        } catch (Exception e) {
            log.error("Password reset failed", e);
            throw new BadRequestException("Invalid or expired reset token");
        }
    }
}