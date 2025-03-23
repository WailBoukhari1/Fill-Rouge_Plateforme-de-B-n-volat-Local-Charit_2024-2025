package com.fill_rouge.backend.dto.response;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsResponse {
    private long totalUsers;
    private long totalOrganizations;
    private long totalEvents;
    private long totalVolunteers;
    private long pendingOrganizations;
    private long activeEvents;
    private long completedEvents;
    private Map<String, Long> usersByRole;
    private Map<String, Long> organizationsByStatus;
    private Map<String, Long> eventsByStatus;
    private Map<String, Long> eventsByCategory;
    private Map<String, Long> userRegistrationsByMonth;
    private Map<String, Long> eventCreationsByMonth;
} 