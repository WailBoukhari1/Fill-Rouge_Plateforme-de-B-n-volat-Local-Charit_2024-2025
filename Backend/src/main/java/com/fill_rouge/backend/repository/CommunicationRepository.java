package com.fill_rouge.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.Communication;

@Repository
public interface CommunicationRepository extends MongoRepository<Communication, String> {
    
    @Query("{'$or': [{'senderId': ?0, 'receiverId': ?1}, {'senderId': ?1, 'receiverId': ?0}]}")
    List<Communication> findConversation(String userId1, String userId2);
    
    @Query("{'receiverId': ?0, 'isRead': false, 'isDeleted': false}")
    List<Communication> findUnreadMessages(String userId);
    
    @Query("{'receiverId': ?0, 'isDeleted': false}")
    List<Communication> findAllNotifications(String userId);
    
    @Query("{'receiverId': ?0, 'isRead': false, 'isDeleted': false}")
    List<Communication> findUnreadNotifications(String userId);
    
    @Query("{'receiverId': ?0, 'isRead': false, 'isDeleted': false}")
    List<Communication> findAllUnreadByReceiverId(String userId);
    
    @Query("{'sentAt': {'$lt': ?0}, 'isDeleted': false}")
    List<Communication> findBySentAtBeforeAndDeletedFalse(LocalDateTime cutoffDate);
} 