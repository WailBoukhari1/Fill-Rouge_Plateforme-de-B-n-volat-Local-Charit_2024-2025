package com.fill_rouge.backend.service.statistics;

import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.constant.Role;

public interface StatisticsService {
    StatisticsResponse.VolunteerStats getVolunteerStats(String userId);
    StatisticsResponse.OrganizationStats getOrganizationStats(String organizationId);
    StatisticsResponse.AdminStats getAdminStats();
    StatisticsResponse getStatisticsByRole(String userId, Role role);
} 