package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedbackResponse {
    private String id;
    private String eventId;
    private String volunteerId;
    private String volunteerName;
    private String eventTitle;
    
    private int rating;
    private String comment;
    private int hoursContributed;
    private String sentiment;  // POSITIVE, NEUTRAL, NEGATIVE
    
    private boolean isAnonymous;
    private LocalDateTime submittedAt;
    
    // Metrics
    private double averageRating;
    private int totalHours;
    private int feedbackCount;
} 