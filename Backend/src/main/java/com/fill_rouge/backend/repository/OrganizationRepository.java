package com.fill_rouge.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.Organization;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findByName(String name);
    
    Optional<Organization> findByUserId(String userId);
    
    @Query("{'user._id': ?0}")
    Optional<Organization> findByUserReference(String userId);
    
    List<Organization> findByVerifiedTrue();
    
    @Query("{'focusAreas': {$in: ?0}}")
    List<Organization> findByFocusAreas(List<String> areas);
    
    @Query("{'coordinates': {$near: {$geometry: {type: 'Point', coordinates: ?0}, $maxDistance: ?1}}}")
    List<Organization> findNearbyOrganizations(double[] coordinates, double maxDistance);
    
    List<Organization> findByCity(String city);
    
    List<Organization> findByCountry(String country);
    
    @Query("{'rating': {$gte: ?0}}")
    List<Organization> findByMinimumRating(double minRating);
    
    List<Organization> findByAcceptingVolunteersTrue();
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<Organization> searchByName(String query);
    
    @Query("{'description': {$regex: ?0, $options: 'i'}}")
    List<Organization> searchByDescription(String query);
    
    boolean existsByName(String name);
    
    boolean existsByRegistrationNumber(String registrationNumber);
    
    boolean existsByTaxId(String taxId);

    long countByVerifiedTrue();
    long countByVerifiedFalse();
}
