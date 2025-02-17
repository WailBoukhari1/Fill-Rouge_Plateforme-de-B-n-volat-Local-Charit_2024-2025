package com.fill_rouge.backend.service.communication;

import com.fill_rouge.backend.domain.Communication;
import com.fill_rouge.backend.domain.Communication.CommunicationType;
import java.util.List;

public interface CommunicationService {
    // Message operations
    Communication sendMessage(String senderId, String receiverId, String content, String attachmentUrl);
    List<Communication> getConversation(String userId, String otherUserId);
    List<Communication> getUnreadMessages(String userId);
    
    // Notification operations
    Communication sendNotification(String userId, String title, String content, CommunicationType type, String referenceId);
    List<Communication> getAllNotifications(String userId);
    List<Communication> getUnreadNotifications(String userId);
    Communication markNotificationAsRead(String userId, String notificationId);
    void markAllNotificationsAsRead(String userId);
    void deleteNotification(String userId, String notificationId);
    
    // Common operations
    void markAsRead(String communicationId);
    void markAllAsRead(String userId);
    long getUnreadCount(String userId);
    void deleteCommunication(String communicationId);
    
    // Bulk operations
    void sendBulkNotification(String organizationId, String title, String content, Communication.CommunicationType type);
    void cleanupOldCommunications(int daysOld);
    
    // Event-specific notifications
    void notifyEventParticipants(String eventId, String title, String content);
    void notifyEventCancellation(String eventId);
    void notifyEventReminder(String eventId);
    
    // Organization-specific notifications
    void notifyOrganizationMembers(String organizationId, String title, String content);
    void notifyOrganizationUpdate(String organizationId, String updateType);
} 