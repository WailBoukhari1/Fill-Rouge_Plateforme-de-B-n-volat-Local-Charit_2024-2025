package com.fill_rouge.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.Event;

@Repository
public interface ReportRepository extends MongoRepository<Event, String> {
    
    @Query("{ 'type': ?0 }")
    Page<Event> findByType(String type, Pageable pageable);
    
    @Query("{ 'generatedAt': { $gte: ?0, $lte: ?1 } }")
    Page<Event> findByGeneratedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("{ 'organizationId': ?0 }")
    List<Event> findByOrganizationId(String organizationId);
    
    @Aggregation(pipeline = {
        "{ $match: { 'organizationId': ?0, 'startDate': { $gte: ?1 }, 'endDate': { $lte: ?2 } } }",
        "{ $group: { " +
            "_id: null, " +
            "totalEvents: { $sum: 1 }, " +
            "totalParticipants: { $sum: { $size: '$registeredParticipants' } }, " +
            "averageRating: { $avg: '$rating' }, " +
            "totalHours: { $sum: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 3600000] } } " +
        "} }",
        "{ $project: { " +
            "_id: 0, " +
            "totalEvents: 1, " +
            "totalParticipants: 1, " +
            "averageRating: 1, " +
            "totalHours: 1 " +
        "} }"
    })
    Map<String, Object> getOrganizationAggregatedStats(String organizationId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0 }, 'endDate': { $lte: ?1 } } }",
        "{ $group: { " +
            "_id: '$category', " +
            "count: { $sum: 1 }, " +
            "totalParticipants: { $sum: { $size: '$registeredParticipants' } }, " +
            "averageRating: { $avg: '$rating' } " +
        "} }",
        "{ $project: { " +
            "_id: 0, " +
            "category: '$_id', " +
            "count: 1, " +
            "totalParticipants: 1, " +
            "averageRating: 1 " +
        "} }"
    })
    List<Map<String, Object>> getCategoryStats(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ 'volunteerId': ?0, 'startDate': { $gte: ?1 }, 'endDate': { $lte: ?2 } }")
    Page<Event> findVolunteerEvents(String volunteerId, Pageable pageable);

    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0 }, 'endDate': { $lte: ?1 } } }",
        "{ $group: { " +
            "_id: '$volunteerId', " +
            "totalEvents: { $sum: 1 }, " +
            "totalHours: { $sum: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 3600000] } } " +
        "} }",
        "{ $sort: { totalHours: -1 } }",
        "{ $limit: 10 }"
    })
    List<Map<String, Object>> getTopVolunteers(LocalDateTime startDate, LocalDateTime endDate);

    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0 }, 'endDate': { $lte: ?1 } } }",
        "{ $group: { " +
            "_id: '$organizationId', " +
            "totalEvents: { $sum: 1 }, " +
            "totalParticipants: { $sum: { $size: '$registeredParticipants' } } " +
        "} }",
        "{ $sort: { totalEvents: -1 } }",
        "{ $limit: 10 }"
    })
    List<Map<String, Object>> getTopOrganizations(LocalDateTime startDate, LocalDateTime endDate);

    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0 }, 'endDate': { $lte: ?1 } } }",
        "{ $group: { " +
            "_id: { $dateToString: { format: '%Y-%m-%d', date: '$startDate' } }, " +
            "participants: { $sum: { $size: '$registeredParticipants' } } " +
        "} }",
        "{ $sort: { '_id': 1 } }"
    })
    List<Map<String, Object>> getDailyParticipationStats(LocalDateTime startDate, LocalDateTime endDate);
} 