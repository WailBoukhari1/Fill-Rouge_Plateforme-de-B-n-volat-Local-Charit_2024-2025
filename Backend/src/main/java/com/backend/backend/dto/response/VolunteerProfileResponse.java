package com.backend.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class VolunteerProfileResponse {
    private String id;
    private String email;
    private Set<String> skills;
    private List<String> interests;
    private Set<String> completedEvents;
    private int hoursContributed;
    private String availability;
    private String bio;
    private String location;
    private String phoneNumber;
    private boolean available;
    private int totalEvents;
} 