package com.backend.volunteering.controller;

import com.backend.volunteering.dto.request.LoginRequest;
import com.backend.volunteering.dto.request.SignupRequest;
import com.backend.volunteering.dto.request.PasswordResetRequest;
import com.backend.volunteering.dto.response.ApiResponse;
import com.backend.volunteering.dto.response.AuthResponse;
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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for user: {}", loginRequest.getEmail());
        AuthResponse response = authService.login(loginRequest);
        log.info("Login successful for user: {}", loginRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("Signup request received for email: {}", signupRequest.getEmail());
        AuthResponse response = authService.signup(signupRequest);
        log.info("Signup successful for email: {}", signupRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        log.info("Refresh token request received");
        AuthResponse response = authService.refreshToken(refreshToken);
        log.info("Refresh token successful");
        return ResponseEntity.ok(response);
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
        log.info("Email verification request received for token: {}", token);
        userService.verifyEmail(token);
        log.info("Email verification successful for token: {}", token);
        return ResponseEntity.ok(new ApiResponse(true, "Email verified successfully"));
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<ApiResponse> resendVerificationEmail(@RequestParam @Email String email) {
        log.info("Resend verification email request received for email: {}", email);
        userService.resendVerificationEmail(email);
        log.info("Verification email resent to: {}", email);
        return ResponseEntity.ok(new ApiResponse(true, "Verification email sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestParam @Email String email) {
        log.info("Forgot password request received for email: {}", email);
        userService.requestPasswordReset(email);
        log.info("Password reset instructions sent to: {}", email);
        return ResponseEntity.ok(new ApiResponse(true,
                "If an account exists with this email, you will receive password reset instructions"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset request received for token: {}", request.getToken());
        userService.resetPassword(request.getToken(), request.getNewPassword());
        log.info("Password reset successful for token: {}", request.getToken());
        return ResponseEntity.ok(new ApiResponse(true, "Password has been reset successfully"));
    }
}