package com.backend.backend.dto.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class EventStatsResponse {
    private String eventId;
    private String eventName;
    private int totalRegistrations;
    private int confirmedAttendees;
    private int canceledRegistrations;
    private double attendanceRate;
    private int maleAttendees;
    private int femaleAttendees;
    private int otherAttendees;
    private double averageAge;
    private int totalVolunteerHours;
    private String mostCommonSkill;
    private String mostCommonLocation;
} 