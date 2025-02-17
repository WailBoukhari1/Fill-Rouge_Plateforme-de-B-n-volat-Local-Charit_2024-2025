package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Communication;
import com.fill_rouge.backend.domain.Communication.CommunicationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunicationRepository extends MongoRepository<Communication, String> {

    @Query(value = "{ $or: [" +
           "{ 'type': 'MESSAGE', 'senderId': ?0, 'receiverId': ?1 }," +
           "{ 'type': 'MESSAGE', 'senderId': ?1, 'receiverId': ?0 }" +
           "] }", sort = "{ 'createdAt': -1 }")
    List<Communication> findConversation(String userId1, String userId2);

    @Query(value = "{ 'receiverId': ?0, 'type': 'MESSAGE', 'read': false }", sort = "{ 'createdAt': -1 }")
    List<Communication> findUnreadMessages(String userId);

    @Query(value = "{ 'receiverId': ?0, 'type': 'NOTIFICATION' }", sort = "{ 'createdAt': -1 }")
    List<Communication> findAllNotifications(String userId);

    @Query(value = "{ 'receiverId': ?0, 'type': 'NOTIFICATION', 'read': false }", sort = "{ 'createdAt': -1 }")
    List<Communication> findUnreadNotifications(String userId);

    Optional<Communication> findByIdAndReceiverId(String id, String receiverId);

    @Query("{ 'receiverId': ?0, 'type': 'NOTIFICATION', 'read': false }")
    @Update("{ $set: { 'read': true } }")
    void markAllNotificationsAsRead(String userId);
} 