package com.backend.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class VolunteerResponse {
    private String id;
    private String profilePicture;
    private Set<String> skills;
    private String availability;
} 