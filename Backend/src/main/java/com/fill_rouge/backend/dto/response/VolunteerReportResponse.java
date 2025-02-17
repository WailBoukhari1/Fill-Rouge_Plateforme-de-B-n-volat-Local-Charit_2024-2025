package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VolunteerReportResponse {
    private String volunteerId;
    private String volunteerName;
    private int totalEventsAttended;
    private int totalHoursContributed;
    private double averageRating;
    private List<String> topSkills;
    private Map<String, Integer> eventsByCategory;
    private List<String> achievements;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, Object> additionalStats;
} 