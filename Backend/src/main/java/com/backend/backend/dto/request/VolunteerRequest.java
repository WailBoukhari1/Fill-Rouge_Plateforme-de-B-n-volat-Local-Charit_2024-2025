package com.backend.backend.dto.request;

import lombok.Data;
import java.util.Set;

@Data
public class VolunteerRequest {
    private String profilePicture;
    private Set<String> skills;
    private String availability;
} 