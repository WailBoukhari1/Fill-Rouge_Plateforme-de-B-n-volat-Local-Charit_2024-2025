package com.backend.backend.repository;

import com.backend.backend.model.EventRegistration;
import com.backend.backend.model.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {
    List<EventRegistration> findByEventId(String eventId);
    List<EventRegistration> findByVolunteerId(String volunteerId);
    Optional<EventRegistration> findByEventIdAndVolunteerId(String eventId, String volunteerId);
    boolean existsByVolunteerIdAndEventId(String volunteerId, String eventId);
    
    @Query(value = "{'eventId': {$in: ?0}}", count = true)
    int countDistinctVolunteersByOrganizationId(List<String> eventIds);

    boolean existsByEventIdAndVolunteerId(String eventId, String volunteerId);

    Page<EventRegistration> findByEventId(String eventId, Pageable pageable);
    Page<EventRegistration> findByVolunteerId(String volunteerId, Pageable pageable);
    List<EventRegistration> findByVolunteerIdAndStatusIn(String volunteerId, List<RegistrationStatus> statuses);
    boolean existsByEventIdAndVolunteerIdAndStatusIn(String eventId, String volunteerId, List<RegistrationStatus> statuses);
    long countByEventIdAndStatusIn(String eventId, List<RegistrationStatus> statuses);
} 