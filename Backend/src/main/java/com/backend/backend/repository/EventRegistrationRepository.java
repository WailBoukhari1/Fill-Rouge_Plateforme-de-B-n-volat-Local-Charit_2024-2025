package com.backend.backend.repository;

import com.backend.backend.domain.model.EventRegistration;
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
} 