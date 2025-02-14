package com.backend.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.backend.backend.model.Event;
import com.backend.backend.model.EventStatus;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    
    @Query("{ " +
           "'$and': [ " +
           "  { '$or': [ " +
           "    { 'title': { '$regex': ?0, '$options': 'i' }}, " +
           "    { 'description': { '$regex': ?0, '$options': 'i' }} " +
           "  ]}, " +
           "  { 'status': ?8 }, " +
           "  { 'startDate': { '$gte': ?7 } }, " +
           "  { 'category': { '$in': ?4 } }, " +
           "  { '$or': [ " +
           "    { 'location': { " +
           "      '$geoWithin': { " +
           "        '$centerSphere': [ [ ?2, ?1 ], ?3 / 6378100 ] " +
           "      } " +
           "    }}, " +
           "    { '$expr': { '$eq': [ ?1, null ] } } " +
           "  ]} " +
           "]}")
    Page<Event> searchEvents(
        String query,
        Double latitude,
        Double longitude,
        double radius,
        Set<String> categories,
        boolean includeFullEvents,
        boolean includePastEvents,
        LocalDateTime now,
        EventStatus status,
        Pageable pageable
    );

    @Query("{ " +
           "'location': { " +
           "  '$geoWithin': { " +
           "    '$centerSphere': [ [ ?1, ?0 ], ?2 / 6378100 ] " +
           "  } " +
           "}, " +
           "'status': ?3, " +
           "'startDate': { '$gte': ?4 } }")
    List<Event> findNearbyEvents(
        double latitude,
        double longitude,
        double radius,
        EventStatus status,
        LocalDateTime now
    );

    @Query("{ 'startDate': { '$gte': ?0, '$lte': ?1 }, 'status': ?2 }")
    List<Event> findUpcomingEvents(
        LocalDateTime startDate,
        LocalDateTime endDate,
        EventStatus status
    );

    @Query(value = "{ 'status': ?0, 'startDate': { '$gte': ?1 } }",
           sort = "{ 'registrationCount': -1 }")
    List<Event> findPopularEvents(
        EventStatus status,
        LocalDateTime now,
        Pageable pageable
    );

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

    Page<Event> findByOrganizationIdOrderByStartDateDesc(String organizationId, Pageable pageable);
    
    Page<Event> findByIdInOrderByStartDateDesc(List<String> eventIds, Pageable pageable);
} 