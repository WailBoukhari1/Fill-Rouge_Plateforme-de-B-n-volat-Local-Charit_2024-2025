package com.fill_rouge.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.domain.EventParticipation;

@Repository
public interface EventParticipationRepository extends MongoRepository<EventParticipation, String> {
    List<EventParticipation> findByVolunteerId(String volunteerId);
    
    @Query("{ 'eventId': { $in: ?0 } }")
    List<EventParticipation> findByEventIds(List<String> eventIds);
    
    @Query(value = "{ 'volunteerId': ?0 }", count = true)
    long countByVolunteerId(String volunteerId);
    
    @Query(value = "{ 'volunteerId': ?0, 'status': ?1 }", count = true)
    long countByVolunteerIdAndStatus(String volunteerId, String status);
    
    @Query(value = "{ 'organizationId': ?0 }", count = true)
    long countDistinctVolunteersByOrganizationId(String organizationId);
    
    @Query(value = "{ 'organizationId': ?0, 'status': 'ACTIVE' }", count = true)
    long countActiveVolunteersByOrganizationId(String organizationId);
    
    @Query(value = "{}", fields = "{ 'hours': 1 }")
    long sumTotalHours();
    
    List<EventParticipation> findByVolunteerIdAndStatus(String volunteerId, String status);

    @Query(value = "{ 'volunteerId': ?0, 'status': ?1, 'event.endDate': { $gt: ?2 } }", count = true)
    long countByVolunteerIdAndEventStatusAndEndDateAfter(String volunteerId, String status, LocalDateTime date);

    @Query(value = "{ 'volunteerId': ?0, 'status': ?1, 'event.endDate': { $lt: ?2 } }", count = true)
    long countByVolunteerIdAndEventStatusAndEndDateBefore(String volunteerId, String status, LocalDateTime date);

    List<EventParticipation> findByEventId(String eventId);
    Optional<EventParticipation> findByVolunteerIdAndEventId(String volunteerId, String eventId);
    List<EventParticipation> findByEventIdAndStatus(String eventId, EventParticipationStatus status);
    boolean existsByVolunteerIdAndEventId(String volunteerId, String eventId);
    long countByEventIdAndStatus(String eventId, EventParticipationStatus status);
    List<EventParticipation> findByVolunteerIdAndStatus(String volunteerId, EventParticipationStatus status);
    
    @Query("{ 'event.organizationId': ?0, 'status': ?1 }")
    List<EventParticipation> findByOrganizationIdAndStatus(String organizationId, EventParticipationStatus status);

    @Query(value = "{ 'status': 'COMPLETED' }", fields = "{ 'hours': 1 }")
    long sumTotalHoursCompleted();
} 