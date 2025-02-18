package com.fill_rouge.backend.service.message;

import java.util.List;

import com.fill_rouge.backend.domain.Message;

public interface MessageService {
    Message sendMessage(String senderId, String receiverId, String content, String attachmentUrl);
    List<Message> getConversation(String userId, String otherUserId);
    List<Message> getUnreadMessages(String userId);
    long getUnreadCount(String userId);
    void markAsRead(String messageId);
    void markAllAsRead(String userId);
    void deleteMessage(String messageId);
} 