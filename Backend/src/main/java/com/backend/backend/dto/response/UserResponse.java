package com.backend.backend.dto.response;

import com.backend.backend.domain.model.UserRole;
import lombok.Data;

import java.util.List;

@Data
public class UserResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private boolean emailVerified;
    private String profilePicture;
    private String bio;
    private List<String> skills;
    private List<String> interests;
    private String location;
} 