package com.fill_rouge.backend.dto.response;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsResponse {
    private String userId;
    private String userRole;
    private AdminStats adminStats;
    private OrganizationStats organizationStats;
    private VolunteerStats volunteerStats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminStats {
        // Platform Overview
        private long totalUsers;
        private long activeUsers;
        private long totalVolunteers;
        private long totalOrganizations;
        private long activeOrganizations;
        private long totalEvents;
        private double platformEngagementRate;
        
        // Organization Metrics
        private long verifiedOrganizations;
        private long pendingVerifications;
        
        // Activity Metrics
        private long activeEvents;
        private long completedEvents;
        private long canceledEvents;
        private long totalVolunteerHours;
        private long totalResources;
        private long totalEventCategories;
        private long totalPeopleImpacted;
        private double averageVolunteerHoursPerEvent;
        
        // Growth Metrics
        private List<TimeSeriesData> userGrowth;
        private List<TimeSeriesData> eventGrowth;
        private Map<String, Long> eventsByCategory;
        private List<TimeSeriesData> platformGrowth;
        private List<TimeSeriesData> userEngagement;
        
        // Engagement Metrics
        private double averageVolunteersPerEvent;
        private double volunteerRetentionRate;
        private Map<String, Long> volunteersByLocation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrganizationStats {
        // Event Statistics
        private long totalEvents;
        private long activeEvents;
        private long completedEvents;
        private long upcomingEvents;
        
        // Volunteer Engagement
        private long totalVolunteers;
        private long activeVolunteers;
        private double averageVolunteersPerEvent;
        private long totalVolunteerHours;
        
        // Performance Metrics
        private double eventSuccessRate;
        private double volunteerRetentionRate;
        private double averageEventRating;
        
        // Time-based Analysis
        private List<TimeSeriesData> eventTrends;
        private List<TimeSeriesData> volunteerTrends;
        private Map<String, Long> eventsByCategory;
        private Map<String, Long> volunteersBySkill;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VolunteerStats {
        // Participation Metrics
        private long totalEventsParticipated;
        private long activeEvents;
        private long completedEvents;
        private long registeredEvents;
        private long totalVolunteerHours;
        
        // Performance Metrics
        private double reliabilityScore;
        private double averageEventRating;
        private long skillsEndorsements;
        
        // Progress Tracking
        private List<TimeSeriesData> hoursContributed;
        private List<TimeSeriesData> eventsParticipation;
        private Map<String, Long> eventsByCategory;
        
        // Impact Metrics
        private long peopleImpacted;
        private long organizationsSupported;
        private Map<String, Long> impactByCategory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSeriesData {
        private String date;
        private long value;
        private String category;
    }
} 