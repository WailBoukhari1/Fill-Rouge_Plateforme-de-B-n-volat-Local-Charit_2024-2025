package com.backend.backend.repository;

import com.backend.backend.domain.Event;
import com.backend.backend.domain.model.EventStatus;
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
    
    List<Event> findByStatus(EventStatus status);
    
    List<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("{ $and: [ " +
           "{ $expr: { $lte: [{ $sqrt: { $add: [ " +
           "  { $pow: [{ $subtract: ['$longitude', ?0] }, 2] }, " +
           "  { $pow: [{ $subtract: ['$latitude', ?1] }, 2] }] } }, ?2] } }, " +
           "{ requiredSkills: { $in: ?3 } }, " +
           "{ status: 'UPCOMING' } " +
           "] }")
    List<Event> findByLocationAndSkills(double longitude, double latitude, double radius, Set<String> skills);
    
    @Query("{ $and: [ " +
           "{ $or: [ { ?0: null }, { location: { $regex: ?0, $options: 'i' } } ] }, " +
           "{ $or: [ { ?1: [] }, { requiredSkills: { $in: ?1 } } ] } " +
           "] }")
    List<Event> findByLocationAndSkills(String location, List<String> skills);
    
    @Query("{ $and: [ " +
           "{ location: { $regex: ?0, $options: 'i' } }, " +
           "{ requiredSkills: { $in: ?1 } } " +
           "] }")
    List<Event> searchEvents(String location, List<String> skills);
} 