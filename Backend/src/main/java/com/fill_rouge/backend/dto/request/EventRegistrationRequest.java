package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(?:\\+212|0)[5-7]\\d{8}$", message = "Please provide a valid Moroccan phone number")
    private String phoneNumber;
    
    private String specialRequirements;
    
    private String notes;
    
    @NotNull(message = "Terms and conditions must be accepted")
    private boolean termsAccepted;
    
    private String eventId;
    
    // Optional userId for authenticated users
    private String userId;
} 