package com.backend.volunteering.dto.response;

import com.backend.volunteering.model.enums.AuthProvider;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String imageUrl;
    private boolean emailVerified;
    private AuthProvider provider;
    private Set<String> roles;
    private Instant createdAt;
    private Instant updatedAt;
} 