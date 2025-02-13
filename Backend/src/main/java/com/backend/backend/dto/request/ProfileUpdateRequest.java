package com.backend.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateRequest {
    @Size(min = 2, max = 50)
    private String firstName;
    
    @Size(min = 2, max = 50)
    private String lastName;
    
    @Size(max = 500)
    private String bio;
    
    @Size(max = 100)
    private String location;
    
    private List<@Size(min = 2, max = 50) String> skills;
    private List<@Size(min = 2, max = 50) String> interests;
} 