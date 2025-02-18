package com.fill_rouge.backend.service.message;

import com.fill_rouge.backend.domain.Message;
import com.fill_rouge.backend.domain.Message.MessageType;
import com.fill_rouge.backend.repository.MessageRepository;
import com.fill_rouge.backend.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    public Message sendMessage(String senderId, String receiverId, String content, String attachmentUrl) {
        Message message = Message.builder()
            .senderId(senderId)
            .receiverId(receiverId)
            .content(content)
            .type(MessageType.DIRECT)
            .read(false)
            .createdAt(LocalDateTime.now())
            .build();
            
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getConversation(String userId, String otherUserId) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
            userId, otherUserId, userId, otherUserId);
    }

    @Override
    public List<Message> getUnreadMessages(String userId) {
        return messageRepository.findByReceiverIdAndReadFalse(userId);
    }

    @Override
    public long getUnreadCount(String userId) {
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }

    @Override
    public void markAsRead(String messageId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
            
        message.setRead(true);
        message.setReadAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndReadFalse(userId);
        LocalDateTime now = LocalDateTime.now();
        
        unreadMessages.forEach(message -> {
            message.setRead(true);
            message.setReadAt(now);
        });
        
        messageRepository.saveAll(unreadMessages);
    }

    @Override
    public void deleteMessage(String messageId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
            
        message.setDeleted(true);
        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
    }
} 