package com.fill_rouge.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.User;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    Page<Event> findByOrganizationId(String organizationId, Pageable pageable);
    
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
}
