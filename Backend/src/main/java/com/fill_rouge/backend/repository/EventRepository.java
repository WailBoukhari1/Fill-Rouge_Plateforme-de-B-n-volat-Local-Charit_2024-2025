package com.fill_rouge.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOrganizationId(String organizationId, Pageable pageable);
    
    Page<Event> findByStatusAndStartDateAfter(EventStatus status, LocalDateTime date, Pageable pageable);
    
    @Query("{'coordinates': {$near: {$geometry: {type: 'Point', coordinates: ?0}, $maxDistance: ?1}}}")
    Page<Event> findNearbyEvents(double[] coordinates, double maxDistance, Pageable pageable);
    
    Page<Event> findByCategory(EventCategory category, Pageable pageable);
    
    Page<Event> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    @Query("{'requiredSkills': {$in: ?0}}")
    Page<Event> findByRequiredSkills(List<String> skills, Pageable pageable);
    
    Page<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    @Query("{'registeredParticipants': ?0}")
    List<Event> findByRegisteredParticipantsContaining(String userId);
    
    @Query("{'waitlistedParticipants': ?0}")
    List<Event> findByWaitlistedParticipantsContaining(String userId);
    
    @Query(value = "{'organizationId': ?0}", count = true)
    long countByOrganization(String organizationId);
    
    @Query(value = "{'registeredParticipants': ?0}", count = true)
    long countByParticipant(String volunteerId);
    
    @Query("{'_id': ?0, 'feedback.volunteerId': ?1}")
    Optional<Event> findEventWithFeedback(String eventId, String volunteerId);

    @Query("{'registeredParticipants': ?0}")
    List<Event> findEventsByParticipant(String userId);

    @Query("{'registeredParticipants': ?0, 'startDate': { $gte: ?1, $lte: ?2 }}")
    List<Event> findEventsByParticipantAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate);

    Page<Event> findByStartDateAfterAndStatusOrderByStartDateAsc(LocalDateTime now, EventStatus status, Pageable pageable);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);
    
    @Query("{'status': {$in: ?0}}")
    Page<Event> findByStatusIn(List<EventStatus> statuses, Pageable pageable);

    long countByOrganizationId(String organizationId);
    
    @Query(value = "{'organizationId': ?0, 'status': ?1, 'endDate': {$gt: ?2}}")
    long countByOrganizationIdAndStatusAndEndDateAfter(String organizationId, String status, LocalDateTime date);
    
    @Query("{'organizationId': ?0, 'status': ?1, 'endDate': {$lt: ?2}}")
    long countByOrganizationIdAndStatusAndEndDateBefore(String organizationId, String status, LocalDateTime date);
    
    @Query("{'organizationId': ?0, 'status': ?1, 'startDate': {$gt: ?2}}")
    long countByOrganizationIdAndStatusAndStartDateAfter(String organizationId, String status, LocalDateTime date);
    
    @Query("{'status': ?0, 'endDate': {$gt: ?1}}")
    Long countByStatusAndEndDateAfter(String status, LocalDateTime date);
    
    @Query("{'status': ?0, 'endDate': {$lt: ?1}}")
    Long countByStatusAndEndDateBefore(String status, LocalDateTime date);
    
    @Aggregation(pipeline = {
        "{ $group: { _id: '$category', count: { $sum: 1 } } }",
        "{ $project: { id: '$_id', count: 1, _id: 0 } }"
    })
    List<CategoryCount> countByCategory();
    
    @Query(value = "{'createdAt': {$gte: ?0, $lte: ?1}}", fields = "{'createdAt': 1}")
    List<Object[]> getEventGrowthByDay(LocalDateTime start, LocalDateTime end);

    List<Event> findAllByOrganizationId(String organizationId);
    
    @Query(value = "{}", fields = "{ 'category': 1 }")
    List<Event> findAllCategories();
    
    @Query("{'status': ?0}")
    Long countByStatus(String status);
    
    // Add a more robust method that handles potential BSON conversion issues
    @Query(value = "{'status': ?0}", count = true)
    Long countEventsByStatus(String status);
    
    // Methods for automatic status updates
    @Query("{'status': ?0, 'startDate': {$lt: ?1}}")
    List<Event> findByStatusAndStartDateBefore(String status, LocalDateTime date);
    
    @Query("{'status': ?0, 'endDate': {$lt: ?1}}")
    List<Event> findByStatusAndEndDateBefore(String status, LocalDateTime date);
    
    // Add more robust methods using count=true
    @Query(value = "{'status': ?0, 'endDate': {$gt: ?1}}", count = true)
    Long countEventsByStatusAndEndDateAfter(String status, LocalDateTime date);
    
    @Query(value = "{'status': ?0, 'endDate': {$lt: ?1}}", count = true)
    Long countEventsByStatusAndEndDateBefore(String status, LocalDateTime date);
}
