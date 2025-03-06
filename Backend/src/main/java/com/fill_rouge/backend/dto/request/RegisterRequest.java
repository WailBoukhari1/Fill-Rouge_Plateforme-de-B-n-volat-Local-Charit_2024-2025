package com.fill_rouge.backend.dto.request;

import com.fill_rouge.backend.constant.Role;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
        message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    private String password;

    // Role is now optional during registration
    private Role role;

    // Optional fields
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private String organizationName;  // Required if role is ORGANIZATION
    private String organizationWebsite;
    private String organizationDescription;

    @AssertTrue(message = "Organization name is required for organization role")
    private boolean isValidOrganizationData() {
        // Only validate if role is explicitly set to ORGANIZATION
        if (role == Role.ORGANIZATION) {
            return organizationName != null && !organizationName.trim().isEmpty();
        }
        return true;
    }
} 