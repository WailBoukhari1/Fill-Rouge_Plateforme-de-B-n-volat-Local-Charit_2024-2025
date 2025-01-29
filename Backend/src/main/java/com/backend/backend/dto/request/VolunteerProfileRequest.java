package com.backend.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import java.util.Set;

@Data
public class VolunteerProfileRequest {
    @NotEmpty(message = "Skills are required")
    private Set<String> skills;
    
    private List<String> interests;
    
    @NotBlank(message = "Availability information is required")
    private String availability;
    
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    private boolean available;
} 