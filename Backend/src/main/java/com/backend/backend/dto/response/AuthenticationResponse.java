package com.backend.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationResponse {
    private String token;
    private String type;
    private String email;
    private String role;
    private String message;

    public static AuthenticationResponse success(String token, String email, String role) {
        return AuthenticationResponse.builder()
                .token(token)
                .type("Bearer")
                .email(email)
                .role(role)
                .message("Authentication successful")
                .build();
    }

    public static AuthenticationResponse error(String message) {
        return AuthenticationResponse.builder()
                .message(message)
                .build();
    }
} 