package com.backend.backend.dto.response;

import lombok.Data;
import lombok.Builder;

import java.util.Map;

@Data
@Builder
public class UserStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long verifiedUsers;
    private Map<String, Long> usersByRole;
    private Map<String, Long> usersByLocation;
    private Map<String, Long> usersBySkill;
    private double averageEventsPerUser;
    private double averageVolunteerHours;
    private int totalEventsOrganized;
    private int totalEventsParticipated;
} 