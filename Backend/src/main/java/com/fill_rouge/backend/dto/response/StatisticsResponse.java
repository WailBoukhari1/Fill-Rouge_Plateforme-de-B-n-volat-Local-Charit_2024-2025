package com.fill_rouge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private VolunteerStats volunteerStats;
    private OrganizationStats organizationStats;
    private AdminStats adminStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolunteerStats {
        // Core metrics
        private int totalHoursVolunteered;
        private int eventsParticipated;
        private int upcomingEvents;
        private int completedEvents;
        
        // Performance metrics
        private double attendanceRate;
        private double averageRating;
        private int impactScore;
        
        // Growth metrics
        private int skillsAcquired;
        private int certificatesEarned;
        private int organizationsSupported;
        
        // Recent activity
        private List<RecentEvent> recentEvents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationStats {
        // Volunteer engagement
        private int totalVolunteers;
        private int activeVolunteers;
        private int newVolunteersThisMonth;
        private double volunteerRetentionRate;
        
        // Event metrics
        private int totalEvents;
        private int ongoingEvents;
        private int upcomingEvents;
        private double averageEventRating;
        
        // Impact metrics
        private int totalVolunteerHours;
        private int impactScore;
        private int resourcesShared;
        
        // Top volunteers
        private List<TopVolunteer> topVolunteers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminStats {
        // Platform overview
        private int totalUsers;
        private int activeUsers;
        private double platformEngagementRate;
        
        // Organization metrics
        private int totalOrganizations;
        private int verifiedOrganizations;
        private int pendingVerifications;
        
        // Event metrics
        private int totalEvents;
        private int activeEvents;
        private int completedEvents;
        private int canceledEvents;
        
        // Resource metrics
        private int totalResources;
        private Map<String, Integer> resourcesByCategory;
        
        // Growth metrics
        private double userGrowthRate;
        private double eventGrowthRate;
        private List<Integer> monthlyActiveUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentEvent {
        private String eventId;
        private String eventName;
        private LocalDateTime date;
        private int hours;
        private String organizationName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopVolunteer {
        private String volunteerId;
        private String name;
        private int hoursContributed;
        private int eventsAttended;
    }
} 