package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.EventFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventFeedbackRepository extends MongoRepository<EventFeedback, String> {
    Page<EventFeedback> findByEventId(String eventId, Pageable pageable);
    
    Page<EventFeedback> findByVolunteerId(String volunteerId, Pageable pageable);
    
    boolean existsByEventIdAndVolunteerId(String eventId, String volunteerId);
    
    @Aggregation(pipeline = {
        "{ $match: { 'eventId': ?0 } }",
        "{ $group: { _id: null, avgRating: { $avg: '$rating' } } }"
    })
    Double calculateAverageRating(String eventId);
    
    @Aggregation(pipeline = {
        "{ $match: { 'eventId': ?0 } }",
        "{ $group: { _id: null, totalHours: { $sum: '$hoursContributed' } } }"
    })
    Integer calculateTotalVolunteerHours(String eventId);
    
    @Query(value = "{ 'eventId': ?0, 'rating': { $gte: ?1 } }", count = true)
    long countPositiveFeedbacks(String eventId, double minRating);
    
    @Query("{ 'eventId': ?0, 'submittedAt': { $gte: ?1, $lte: ?2 } }")
    List<EventFeedback> findFeedbacksByDateRange(String eventId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Aggregation(pipeline = {
        "{ $match: { 'eventId': ?0 } }",
        "{ $group: { _id: null, avgHours: { $avg: '$hoursContributed' } } }"
    })
    Double calculateAverageHoursContributed(String eventId);
    
    void deleteByEventId(String eventId);
} 