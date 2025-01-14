package com.backend.volunteering.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class EmailVerificationRequest {
    @NotBlank(message = "Verification code is required")
    private String code;
}