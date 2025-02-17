package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ReportRepository extends MongoRepository<Event, String> {
    
    @Query("{ 'type': ?0 }")
    Page<Event> findByType(String type, Pageable pageable);
    
    @Query("{ 'generatedAt': { $gte: ?0, $lte: ?1 } }")
    Page<Event> findByGeneratedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    @Aggregation(pipeline = {
        "{ $match: { 'organizationId': ?0, 'startDate': { $gte: ?1, $lte: ?2 } } }",
        "{ $group: { " +
            "_id: null, " +
            "totalEvents: { $sum: 1 }, " +
            "totalParticipants: { $sum: { $size: '$registeredParticipants' } }, " +
            "averageRating: { $avg: '$averageRating' }, " +
            "totalHours: { $sum: '$totalVolunteerHours' } " +
        "} }"
    })
    Map<String, Object> getOrganizationAggregatedStats(String organizationId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0, $lte: ?1 } } }",
        "{ $group: { " +
            "_id: '$category', " +
            "count: { $sum: 1 }, " +
            "totalParticipants: { $sum: { $size: '$registeredParticipants' } }, " +
            "averageRating: { $avg: '$averageRating' } " +
        "} }"
    })
    List<Map<String, Object>> getCategoryStats(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query(value = "{ 'registeredParticipants': ?0 }", 
           fields = "{ 'id': 1, 'title': 1, 'startDate': 1, 'totalVolunteerHours': 1, 'averageRating': 1 }")
    Page<Event> findVolunteerEvents(String volunteerId, Pageable pageable);
    
    @Aggregation(pipeline = {
        "{ $match: { 'registeredParticipants': ?0, 'startDate': { $gte: ?1, $lte: ?2 } } }",
        "{ $group: { " +
            "_id: null, " +
            "totalEvents: { $sum: 1 }, " +
            "totalHours: { $sum: '$totalVolunteerHours' }, " +
            "averageRating: { $avg: '$averageRating' } " +
        "} }"
    })
    Map<String, Object> getVolunteerStats(String volunteerId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0, $lte: ?1 } } }",
        "{ $unwind: '$registeredParticipants' }",
        "{ $group: { " +
            "_id: '$registeredParticipants', " +
            "eventCount: { $sum: 1 }, " +
            "totalHours: { $sum: '$totalVolunteerHours' } " +
        "} }",
        "{ $sort: { 'eventCount': -1 } }",
        "{ $limit: 10 }"
    })
    List<Map<String, Object>> getTopVolunteers(LocalDateTime startDate, LocalDateTime endDate);
    
    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0, $lte: ?1 } } }",
        "{ $group: { " +
            "_id: '$organizationId', " +
            "eventCount: { $sum: 1 }, " +
            "totalParticipants: { $sum: { $size: '$registeredParticipants' } }, " +
            "averageRating: { $avg: '$averageRating' } " +
        "} }",
        "{ $sort: { 'eventCount': -1 } }",
        "{ $limit: 10 }"
    })
    List<Map<String, Object>> getTopOrganizations(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("{ 'type': ?0, 'status': 'ACTIVE' }")
    Page<Event> findActiveReportsByType(String type, Pageable pageable);
    
    @Aggregation(pipeline = {
        "{ $match: { 'startDate': { $gte: ?0, $lte: ?1 } } }",
        "{ $group: { " +
            "_id: { $dateToString: { format: '%Y-%m-%d', date: '$startDate' } }, " +
            "count: { $sum: 1 }, " +
            "participants: { $sum: { $size: '$registeredParticipants' } } " +
        "} }",
        "{ $sort: { '_id': 1 } }"
    })
    List<Map<String, Object>> getDailyParticipationStats(LocalDateTime startDate, LocalDateTime endDate);
} 