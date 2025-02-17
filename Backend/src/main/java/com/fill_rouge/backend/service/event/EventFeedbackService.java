package com.fill_rouge.backend.service.event;

import com.fill_rouge.backend.domain.EventFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventFeedbackService {
    EventFeedback submitFeedback(String eventId, String volunteerId, EventFeedback feedback);
    Page<EventFeedback> getEventFeedbacks(String eventId, Pageable pageable);
    Page<EventFeedback> getVolunteerFeedbacks(String volunteerId, Pageable pageable);
    double getEventAverageRating(String eventId);
    int getTotalVolunteerHours(String eventId);
    boolean hasVolunteerSubmittedFeedback(String eventId, String volunteerId);
    void deleteFeedback(String feedbackId);
} 