package com.backend.volunteering.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Login credential is required")
    private String loginId;

    @NotBlank(message = "Password is required")
    private String password;
} 