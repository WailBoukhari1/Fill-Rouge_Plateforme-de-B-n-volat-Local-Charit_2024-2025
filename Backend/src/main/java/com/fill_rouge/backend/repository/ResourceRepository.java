package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    List<Resource> findByEventId(String eventId);
    
    List<Resource> findByOrganizationId(String organizationId);
    
    @Query("{ 'type': ?0 }")
    List<Resource> findByType(String type);
    
    @Query("{ 'uploadedBy': ?0 }")
    List<Resource> findByUploadedBy(String userId);
    
    @Query("{ 'sharedWith': ?0 }")
    List<Resource> findSharedWithUser(String userId);
    
    @Query("{ 'isPublic': true }")
    List<Resource> findPublicResources();
    
    @Query("{ 'uploadedAt': { $gte: ?0, $lte: ?1 } }")
    List<Resource> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("{ 'status': ?0 }")
    List<Resource> findByStatus(String status);
    
    @Query("{ 'eventId': ?0, 'type': ?1 }")
    List<Resource> findByEventIdAndType(String eventId, String type);
    
    @Query("{ 'organizationId': ?0, 'type': ?1 }")
    List<Resource> findByOrganizationIdAndType(String organizationId, String type);
    
    @Query(value = "{ }", fields = "{ 'type': 1 }")
    List<String> findDistinctTypes();
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Resource> searchByName(String namePattern);
    
    @Query("{ 'size': { $gt: ?0 } }")
    List<Resource> findLargeFiles(Long sizeThreshold);
} 