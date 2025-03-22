package com.fill_rouge.backend.service.event.impl;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.EventFeedbackRepository;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.service.event.EventFeedbackService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EventFeedbackServiceImpl implements EventFeedbackService {
    
    private final EventRepository eventRepository;
    private final EventFeedbackRepository feedbackRepository;
    
    @Override
    public EventFeedback submitFeedback(String eventId, String volunteerId, EventFeedback feedback) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        validateFeedbackSubmission(event, volunteerId);
        
        feedback.setEventId(eventId);
        feedback.setVolunteerId(volunteerId);
        
        EventFeedback savedFeedback = feedbackRepository.save(feedback);
        updateEventRating(event);
        
        return savedFeedback;
    }
    
    @Override
    public Page<EventFeedback> getEventFeedbacks(String eventId, Pageable pageable) {
        validateEventExists(eventId);
        return feedbackRepository.findByEventId(eventId, pageable);
    }
    
    @Override
    public Page<EventFeedback> getVolunteerFeedbacks(String volunteerId, Pageable pageable) {
        return feedbackRepository.findByVolunteerId(volunteerId, pageable);
    }
    
    @Override
    public double getEventAverageRating(String eventId) {
        validateEventExists(eventId);
        return feedbackRepository.calculateAverageRating(eventId);
    }
    
    @Override
    public int getTotalVolunteerHours(String eventId) {
        validateEventExists(eventId);
        return feedbackRepository.calculateTotalVolunteerHours(eventId);
    }
    
    @Override
    public boolean hasVolunteerSubmittedFeedback(String eventId, String volunteerId) {
        validateEventExists(eventId);
        return feedbackRepository.existsByEventIdAndVolunteerId(eventId, volunteerId);
    }
    
    @Override
    public void deleteFeedback(String feedbackId) {
        EventFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        
        Event event = eventRepository.findById(feedback.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        feedbackRepository.delete(feedback);
        updateEventRating(event);
    }
    
    private void validateEventExists(String eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event not found");
        }
    }
    
    private void validateFeedbackSubmission(Event event, String volunteerId) {
        if (!event.getRegisteredParticipants().contains(volunteerId)) {
            throw new IllegalStateException("Only registered participants can submit feedback");
        }
        if (hasVolunteerSubmittedFeedback(event.getId(), volunteerId)) {
            throw new IllegalStateException("Volunteer has already submitted feedback");
        }
    }
    
    private void updateEventRating(Event event) {
        double averageRating = getEventAverageRating(event.getId());
        event.setAverageRating(averageRating);
        eventRepository.save(event);
    }
} 