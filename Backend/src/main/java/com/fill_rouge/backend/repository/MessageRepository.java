package com.fill_rouge.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.Message;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
        String senderId1, String receiverId1, String senderId2, String receiverId2);
    List<Message> findByReceiverIdAndReadFalse(String receiverId);
    long countByReceiverIdAndReadFalse(String receiverId);
} 