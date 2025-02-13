package com.backend.backend.dto.response;

import java.util.List;

import com.backend.backend.model.UserRole;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDetails user;

    @Data
    @Builder
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