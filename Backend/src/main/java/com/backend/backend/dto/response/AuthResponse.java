package com.backend.backend.dto.response;

import java.util.List;

import com.backend.backend.model.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDetails user;
    private String message;
    private boolean success;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetails {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private List<UserRole> roles;
        private boolean emailVerified;
        private String profilePicture;
    }
} 