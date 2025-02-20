package com.fill_rouge.backend.dto.response;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Volunteer statistics and metrics")
public class VolunteerStatsResponse {
    // Event Statistics
    @Schema(description = "Total number of events the volunteer has attended", example = "15")
    @Builder.Default
    private int totalEventsAttended = 0;
    
    @Schema(description = "Number of upcoming events the volunteer is scheduled for", example = "5")
    @Builder.Default
    private int upcomingEvents = 0;
    
    @Schema(description = "Number of completed events the volunteer has participated in", example = "10")
    @Builder.Default
    private int completedEvents = 0;
    
    @Schema(description = "Number of canceled events the volunteer has not attended", example = "1")
    @Builder.Default
    private int canceledEvents = 0;
    
    @Schema(description = "Number of events the volunteer has attended by category", example = "{'Community Service': 5, 'Environmental Conservation': 3}")
    private Map<String, Integer> eventsByCategory;
    
    // Time Statistics
    @Schema(description = "Total hours contributed to volunteer activities", example = "120")
    @Builder.Default
    private int totalHoursVolunteered = 0;
    
    @Schema(description = "Average hours volunteered per event", example = "2.4")
    @Builder.Default
    private double averageHoursPerEvent = 0.0;
    
    @Schema(description = "Hours volunteered by month", example = "{'January': 20, 'February': 15}")
    private Map<String, Integer> hoursByMonth;
    
    // Impact Statistics
    @Schema(description = "Number of people impacted by the volunteer's activities", example = "50")
    @Builder.Default
    private int peopleImpacted = 0;
    
    @Schema(description = "Number of organizations the volunteer has worked with", example = "3")
    @Builder.Default
    private int organizationsWorkedWith = 0;
    
    @Schema(description = "Top skills gained by the volunteer", example = "['Leadership', 'Communication']")
    private List<String> topSkillsGained;
    
    @Schema(description = "Number of projects completed by the volunteer", example = "2")
    @Builder.Default
    private int projectsCompleted = 0;
    
    // Performance Statistics
    @Schema(description = "Average rating across all events (0-5)", example = "4.5")
    @Builder.Default
    private double averageRating = 0.0;
    
    @Schema(description = "Volunteer reliability score (0-100)", example = "95")
    @Builder.Default
    private int reliabilityScore = 100;
    
    @Schema(description = "Number of badges earned by the volunteer", example = "5")
    @Builder.Default
    private int badgesEarned = 0;
    
    @Schema(description = "Recent achievements of the volunteer", example = "['Volunteer of the Month', 'Community Impact Award']")
    private List<String> recentAchievements;
    
    // Growth Statistics
    @Schema(description = "Participation growth rate", example = "0.2")
    @Builder.Default
    private double participationGrowthRate = 0.0;
    
    @Schema(description = "Hours growth rate", example = "0.15")
    @Builder.Default
    private double hoursGrowthRate = 0.0;
    
    @Schema(description = "Skills growth rate", example = "0.1")
    @Builder.Default
    private double skillsGrowthRate = 0.0;
    
    // Engagement Statistics
    @Schema(description = "Participation by day", example = "{'Monday': 2, 'Tuesday': 3}")
    private Map<String, Integer> participationByDay;
    
    @Schema(description = "Satisfaction trends", example = "{'January': 0.8, 'February': 0.9}")
    private Map<String, Double> satisfactionTrends;
    
    @Schema(description = "Preferred event types", example = "['Community Service', 'Environmental Conservation']")
    private List<String> preferredEventTypes;
} 