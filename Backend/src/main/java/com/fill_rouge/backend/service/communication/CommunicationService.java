package com.fill_rouge.backend.service.communication;

import java.util.List;

import com.fill_rouge.backend.domain.Communication;

public interface CommunicationService {
    // Message operations
    Communication sendMessage(String senderId, String receiverId, String content, String attachmentUrl);
    List<Communication> getConversation(String userId, String otherUserId);
    List<Communication> getUnreadMessages(String userId);
    
    // Notification operations
    Communication sendNotification(String userId, String content);
    List<Communication> getAllNotifications(String userId);
    List<Communication> getUnreadNotifications(String userId);
    
    // Common operations
    void markAsRead(String communicationId);
    void markAllAsRead(String userId);
    long getUnreadCount(String userId);
    void deleteCommunication(String communicationId);
    
    // Bulk operations
    void sendBulkNotification(List<String> userIds, String content);
    void cleanupOldCommunications(int daysOld);
    
    // Event notifications
    void notifyEventParticipants(String eventId, String content);
    void notifyEventCancellation(String eventId);
    void notifyEventReminder(String eventId);
    
    // Organization notifications
    void notifyOrganizationMembers(String organizationId, String content);
    void notifyOrganizationUpdate(String organizationId, String updateType);
} 