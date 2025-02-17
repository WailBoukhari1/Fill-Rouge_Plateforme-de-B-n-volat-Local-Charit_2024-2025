package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.EventWaitlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventWaitlistRepository extends MongoRepository<EventWaitlist, String> {
    Page<EventWaitlist> findByEventIdOrderByJoinedAt(String eventId, Pageable pageable);
    Page<EventWaitlist> findByVolunteerIdOrderByJoinedAt(String volunteerId, Pageable pageable);
    
    @Query("{ 'eventId': ?0, 'volunteerId': ?1 }")
    Optional<Integer> findWaitlistPosition(String eventId, String volunteerId);
    
    boolean existsByEventIdAndVolunteerId(String eventId, String volunteerId);
    int countByEventId(String eventId);
    
    Optional<EventWaitlist> findFirstByEventIdAndNotifiedFalseOrderByJoinedAt(String eventId);
    
    @Query("{ 'notified': true, 'expired': false, 'expiresAt': { $lt: ?0 } }")
    List<EventWaitlist> findExpiredNotifications(LocalDateTime now);
    
    void deleteByEventIdAndVolunteerId(String eventId, String volunteerId);
} 