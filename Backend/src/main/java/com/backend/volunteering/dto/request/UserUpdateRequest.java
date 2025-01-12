package com.backend.volunteering.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;
    
    private String imageUrl;
} 