package com.fill_rouge.backend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.VolunteerProfile;

@Repository
public interface VolunteerProfileRepository extends MongoRepository<VolunteerProfile, String> {
    @Query("{'user._id': ?0}")
    Optional<VolunteerProfile> findByVolunteerId(String volunteerId);
    
    @Query("{'skills': {$in: ?0}}")
    List<VolunteerProfile> findBySkills(List<String> skills);
    
    @Query("{'preferredCategories': {$in: ?0}}")
    List<VolunteerProfile> findByPreferredCategories(List<String> categories);
    
    @Query("{'languages': {$in: ?0}}")
    List<VolunteerProfile> findByLanguages(List<String> languages);
    
    List<VolunteerProfile> findByBackgroundCheckedTrue();
    
    @Query("{'city': ?0, 'availableForEmergency': true}")
    List<VolunteerProfile> findEmergencyVolunteersInCity(String city);
    
    @Query("{'reliabilityScore': {$gte: ?0}}")
    List<VolunteerProfile> findByMinimumReliabilityScore(int minScore);
    
    @Query("{'certifications': {$in: ?0}}")
    List<VolunteerProfile> findByCertifications(List<String> certifications);
    
    @Query("{'availableDays': {$in: ?0}, 'preferredTimeOfDay': ?1}")
    List<VolunteerProfile> findByAvailability(List<String> days, String timeOfDay);
    
    @Query("{'location': {$near: {$geometry: {type: 'Point', coordinates: ?0}, $maxDistance: ?1}}}")
    List<VolunteerProfile> findNearbyVolunteers(double[] coordinates, double maxDistance);
    
    @Query("{'email': ?0}")
    Optional<VolunteerProfile> findByUserEmail(String email);

    @Query("{'user._id': ?0}")
    Optional<VolunteerProfile> findByUserId(String userId);

    @Query(value = "{}", fields = "{'location': 1}")
    Map<String, Long> countByLocation();
} 