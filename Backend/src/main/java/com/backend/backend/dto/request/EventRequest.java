package com.backend.backend.dto.request;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class EventRequest {
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private String location;
    private Set<String> requiredSkills;
    private int volunteersNeeded;
    private double latitude;
    private double longitude;
} 