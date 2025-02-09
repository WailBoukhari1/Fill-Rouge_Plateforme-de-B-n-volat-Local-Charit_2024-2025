package com.backend.backend.dto.response;

import com.backend.backend.domain.model.UserRole;
import lombok.Builder;
import lombok.Data;
import java.util.List;

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