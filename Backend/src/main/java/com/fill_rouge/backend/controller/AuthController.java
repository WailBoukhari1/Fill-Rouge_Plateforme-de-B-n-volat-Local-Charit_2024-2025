package com.fill_rouge.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fill_rouge.backend.dto.request.LoginRequest;
import com.fill_rouge.backend.dto.request.RegisterRequest;
import com.fill_rouge.backend.dto.request.QuestionnaireRequest;
import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.AuthResponse;
import com.fill_rouge.backend.service.auth.AuthenticationService;
import com.fill_rouge.backend.config.security.JwtService;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"}, 
    allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
    RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Operation(summary = "Register a new user", description = "Register a new user with the provided details")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User successfully registered"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already exists")
    })
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

    @Operation(summary = "Login user", description = "Authenticate user and return JWT token")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Account is disabled")
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                         jakarta.servlet.http.HttpServletRequest servletRequest) {
        // Set the client's IP address
        request.setIpAddress(servletRequest.getRemoteAddr());
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token successfully refreshed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        AuthResponse response = authenticationService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @Operation(summary = "Logout user", description = "Invalidate the current JWT token")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully logged out"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid token")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        authenticationService.logout(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @Operation(summary = "Verify email", description = "Verify user's email address with verification code")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Email successfully verified"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired code"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String email, @RequestParam String code) {
        authenticationService.verifyEmail(email, code);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @Operation(summary = "Check email verification status", description = "Check if user's email is verified")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/verify-email/status")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailVerificationStatus(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(user.isEmailVerified(), "Email verification status retrieved"));
    }

    @Operation(summary = "Resend verification code", description = "Send a new verification code to user's email")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Code sent successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationCode(@RequestParam String email) {
        authenticationService.resendVerificationCode(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification code sent successfully"));
    }

    @Operation(summary = "Request password reset", description = "Send password reset instructions to user's email")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reset instructions sent successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        authenticationService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset instructions sent to email"));
    }

    @Operation(summary = "Reset password", description = "Reset user's password using reset code")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password successfully reset"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired code"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String code,
            @RequestParam String newPassword) {
        authenticationService.resetPassword(code, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @Operation(summary = "Complete questionnaire", description = "Complete the user questionnaire and assign role")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Questionnaire completed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid questionnaire data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User role already assigned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/questionnaire")
    public ResponseEntity<?> completeQuestionnaire(@RequestBody QuestionnaireRequest request,
                                                  @RequestHeader("Authorization") String token) {
        try {
            // Extract token
            String jwt = token.substring(7); // Remove "Bearer " prefix
            
            // Get user email from token
            String email = jwtService.extractUsername(jwt);
            
            // Get user and validate role
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!Role.UNASSIGNED.equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Questionnaire is only available for users with unassigned role", HttpStatus.FORBIDDEN));
            }
            
            // Complete questionnaire
            AuthResponse response = authenticationService.completeQuestionnaire(email, request);
            
            return ResponseEntity.ok(ApiResponse.success(response, "Questionnaire completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Operation(summary = "Check questionnaire status", description = "Check if user has completed the questionnaire")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid token"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @SecurityRequirement(name = "bearerAuth")
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
            
            // Return questionnaire status with role information
            return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                    "completed", user.isQuestionnaireCompleted(),
                    "canAccess", Role.UNASSIGNED.equals(user.getRole()),
                    "currentRole", user.getRole().name()
                ),
                "Questionnaire status retrieved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
}
