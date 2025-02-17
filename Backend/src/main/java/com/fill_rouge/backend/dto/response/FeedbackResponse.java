package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.EventFeedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private double rating;
    private String comment;
    private int hoursContributed;
    private LocalDateTime submittedAt;
    private boolean isAnonymous;

    public static FeedbackResponse fromFeedback(EventFeedback feedback) {
        if (feedback == null) {
            return null;
        }

        return FeedbackResponse.builder()
                .id(feedback.getId())
                .eventId(feedback.getEventId())
                .volunteerId(feedback.getVolunteerId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .hoursContributed(feedback.getHoursContributed())
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }

    public static FeedbackResponse fromFeedbackWithDetails(
            EventFeedback feedback,
            String volunteerName,
            String eventTitle,
            boolean isAnonymous) {
        FeedbackResponse response = fromFeedback(feedback);
        if (response != null) {
            response.setVolunteerName(isAnonymous ? "Anonymous" : volunteerName);
            response.setEventTitle(eventTitle);
            response.setAnonymous(isAnonymous);
        }
        return response;
    }

    public String getSentiment() {
        if (rating >= 4.0) return "POSITIVE";
        if (rating <= 2.0) return "NEGATIVE";
        return "NEUTRAL";
    }
} 