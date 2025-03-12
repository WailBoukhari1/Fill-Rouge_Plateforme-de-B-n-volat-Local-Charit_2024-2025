package com.fill_rouge.backend.service.event;

import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface EventService {
    // Core Event Operations
    Event createEvent(EventRequest eventRequest, String organizationId);
    Event updateEvent(String eventId, EventRequest eventRequest);
    void deleteEvent(String eventId);
    Event getEventById(String eventId);
    Event updateEventStatus(String eventId, EventStatus status);
    
    // Event Search & Filtering
    Page<Event> getEventsByOrganization(String organizationId, Pageable pageable);
    Page<Event> searchEvents(String query, Pageable pageable);
    Page<Event> getUpcomingEvents(Pageable pageable);
    Page<Event> getNearbyEvents(double[] coordinates, double maxDistance, Pageable pageable);
    Page<Event> getEventsByCategory(String category, Pageable pageable);
    Page<Event> getEventsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable);
    Page<Event> getEventsBySkills(List<String> skills, Pageable pageable);
    
    // Participant Management
    Event registerParticipant(String eventId, String userId);
    Event unregisterParticipant(String eventId, String userId);
    boolean isEventFull(String eventId);
    long getParticipantCount(String eventId);
    List<Event> getEventsByParticipant(String userId);
    List<Event> getEventsByWaitlistedParticipant(String userId);
    
    // Feedback & Rating
    EventFeedback submitFeedback(String eventId, String volunteerId, EventFeedback feedback);
    Page<EventFeedback> getEventFeedbacks(String eventId, Pageable pageable);
    double getAverageRating(String eventId);
    boolean hasVolunteerSubmittedFeedback(String eventId, String volunteerId);
    
    // Event Statistics
    EventStatisticsResponse getEventStatistics(String eventId);
    double calculateEventSuccessRate(String eventId);
    int getTotalVolunteerHours(String eventId);
}
