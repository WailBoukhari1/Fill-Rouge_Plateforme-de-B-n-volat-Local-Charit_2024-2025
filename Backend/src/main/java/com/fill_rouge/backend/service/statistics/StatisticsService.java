package com.fill_rouge.backend.service.statistics;

import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.constant.Role;
import java.time.LocalDateTime;

public interface StatisticsService {
    StatisticsResponse.VolunteerStats getVolunteerStats(String userId);
    StatisticsResponse.OrganizationStats getOrganizationStats(String organizationId);
    StatisticsResponse.AdminStats getAdminStats();
    StatisticsResponse getStatisticsByRole(String userId, Role role);
    
    // Time-series data methods
    StatisticsResponse.AdminStats getAdminStatsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    StatisticsResponse.OrganizationStats getOrganizationStatsByDateRange(String organizationId, LocalDateTime startDate, LocalDateTime endDate);
    StatisticsResponse.VolunteerStats getVolunteerStatsByDateRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate);
} 