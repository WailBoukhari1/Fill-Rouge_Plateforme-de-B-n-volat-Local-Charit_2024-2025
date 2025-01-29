package com.backend.backend.repository;

import com.backend.backend.domain.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOrganizationId(String organizationId);
    int countByOrganizationId(String organizationId);
    List<Event> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);
    @Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [ ?0, ?1 ] }, $maxDistance: ?2 } }, 'requiredSkills': { $all: ?3 } }")
    List<Event> findByLocationAndSkills(double longitude, double latitude, double radius, Set<String> skills);
} 