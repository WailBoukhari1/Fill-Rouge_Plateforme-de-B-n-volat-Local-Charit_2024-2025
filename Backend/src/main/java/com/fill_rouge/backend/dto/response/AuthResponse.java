package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String refreshToken;
    
    @Builder.Default
    private String type = "Bearer";
    
    private String email;
    private String firstName;
    private String lastName;
    private String userId;
    private Set<String> roles;
    private boolean emailVerified;
    private boolean twoFactorEnabled;
    private LocalDateTime tokenExpiresAt;
    private LocalDateTime refreshTokenExpiresAt;
    private String sessionId;
    private String lastLoginIp;
    private LocalDateTime lastLoginAt;
    private boolean accountLocked;
    private boolean accountExpired;
    private boolean credentialsExpired;
    private String profilePicture;
    
    @Builder.Default
    private boolean success = true;
    
    private String errorMessage;

    public String getFullName() {
        return firstName != null && lastName != null 
            ? firstName + " " + lastName 
            : null;
    }

    public static AuthResponse createErrorResponse(String errorMessage) {
        return AuthResponse.builder()
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }

    public static AuthResponse createSuccessResponse(String token, String refreshToken, 
            String email, String firstName, String lastName, String userId, 
            Set<String> roles, LocalDateTime tokenExpiresAt) {
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .userId(userId)
                .roles(roles)
                .tokenExpiresAt(tokenExpiresAt)
                .success(true)
                .build();
    }
}
