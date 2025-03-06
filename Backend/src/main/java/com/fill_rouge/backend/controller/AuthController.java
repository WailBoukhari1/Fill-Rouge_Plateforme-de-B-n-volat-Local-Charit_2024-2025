package com.fill_rouge.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fill_rouge.backend.dto.request.LoginRequest;
import com.fill_rouge.backend.dto.request.RegisterRequest;
import com.fill_rouge.backend.dto.request.QuestionnaireRequest;
import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.AuthResponse;
import com.fill_rouge.backend.service.auth.AuthenticationService;
import com.fill_rouge.backend.config.security.JwtService;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"}, 
    allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
    RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authenticationService.register(request);
            return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
        } catch (Exception e) {
            // Log the exception
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            // Return a more specific error message
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Registration failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        AuthResponse response = authenticationService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        authenticationService.logout(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String email, @RequestParam String code) {
        authenticationService.verifyEmail(email, code);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationCode(@RequestParam String email) {
        authenticationService.resendVerificationCode(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification code sent successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        authenticationService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset instructions sent to email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String code,
            @RequestParam String newPassword) {
        authenticationService.resetPassword(code, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    /**
     * Complete the questionnaire for a user
     * @param request The questionnaire data
     * @param token The JWT token
     * @return The updated user information
     */
    @PostMapping("/questionnaire")
    public ResponseEntity<?> completeQuestionnaire(@RequestBody QuestionnaireRequest request,
                                                  @RequestHeader("Authorization") String token) {
        try {
            // Extract token
            String jwt = token.substring(7); // Remove "Bearer " prefix
            
            // Get user email from token
            String email = jwtService.extractUsername(jwt);
            
            // Complete questionnaire
            AuthResponse response = authenticationService.completeQuestionnaire(email, request);
            
            return ResponseEntity.ok(ApiResponse.success(response, "Questionnaire completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    /**
     * Check if the user has completed the questionnaire
     * @param token The JWT token
     * @return The questionnaire status
     */
    @GetMapping("/questionnaire/status")
    public ResponseEntity<?> checkQuestionnaireStatus(@RequestHeader("Authorization") String token) {
        try {
            // Extract token
            String jwt = token.substring(7); // Remove "Bearer " prefix
            
            // Get user email from token
            String email = jwtService.extractUsername(jwt);
            
            // Get user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Return questionnaire status
            return ResponseEntity.ok(ApiResponse.success(
                Map.of("completed", user.isQuestionnaireCompleted()),
                "Questionnaire status retrieved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
}
