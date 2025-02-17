package com.fill_rouge.backend.service.communication;

import com.fill_rouge.backend.domain.Communication;
import com.fill_rouge.backend.domain.Communication.CommunicationType;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.repository.CommunicationRepository;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.OrganizationRepository;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.constant.CommunicationConstants;

import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class CommunicationServiceImpl implements CommunicationService {
    
    private final CommunicationRepository communicationRepository;
    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Communication sendMessage(String senderId, String receiverId, String content, String attachmentUrl) {
        Communication message = Communication.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .attachmentUrl(attachmentUrl)
                .type(CommunicationType.MESSAGE)
                .read(false)
                .build();
        return communicationRepository.save(message);
    }

    @Override
    public List<Communication> getConversation(String userId, String otherUserId) {
        return communicationRepository.findConversation(userId, otherUserId);
    }

    @Override
    public List<Communication> getUnreadMessages(String userId) {
        return communicationRepository.findUnreadMessages(userId);
    }

    @Override
    public List<Communication> getAllNotifications(String userId) {
        return communicationRepository.findAllNotifications(userId);
    }

    @Override
    public List<Communication> getUnreadNotifications(String userId) {
        return communicationRepository.findUnreadNotifications(userId);
    }

    @Override
    public Communication markNotificationAsRead(String userId, String notificationId) {
        Communication notification = communicationRepository.findByIdAndReceiverId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return communicationRepository.save(notification);
    }

    @Override
    public void markAllNotificationsAsRead(String userId) {
        communicationRepository.markAllNotificationsAsRead(userId);
    }

    @Override
    public void deleteNotification(String userId, String notificationId) {
        Communication notification = communicationRepository.findByIdAndReceiverId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        communicationRepository.delete(notification);
    }

    @Override
    public Communication sendNotification(String userId, String title, String content, 
                               CommunicationType type, String referenceId) {
        Communication notification = Communication.builder()
                .senderId(CommunicationConstants.SYSTEM_SENDER)
                .receiverId(userId)
                .title(title)
                .content(content)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();
        
        notification = communicationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(
            userId,
            CommunicationConstants.NOTIFICATION_QUEUE,
            notification
        );
        
        return notification;
    }

    @Override
    public void markAsRead(String communicationId) {
        Communication communication = communicationRepository.findById(communicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Communication not found"));
        communication.setRead(true);
        communicationRepository.save(communication);
    }

    @Override
    public void markAllAsRead(String userId) {
        communicationRepository.markAllNotificationsAsRead(userId);
    }

    @Override
    public long getUnreadCount(String userId) {
        return communicationRepository.findUnreadMessages(userId).size() + 
               communicationRepository.findUnreadNotifications(userId).size();
    }

    @Override
    public void deleteCommunication(String communicationId) {
        communicationRepository.deleteById(communicationId);
    }

    @Override
    public void sendBulkNotification(String organizationId, String title, String content, CommunicationType type) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Get all events for this organization
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged()).getContent();
        
        // Get unique volunteers from all events
        Set<String> volunteers = events.stream()
                .flatMap(event -> event.getRegisteredParticipants().stream())
                .collect(Collectors.toSet());

        // Convert to ArrayList for bulk notification
        ArrayList<String> recipientIds = new ArrayList<>(volunteers);
        
        // Send notification to each volunteer
        for (String recipientId : recipientIds) {
            sendNotification(recipientId, title, content, type, organizationId);
        }
    }

    @Override
    public void cleanupOldCommunications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Communication> oldCommunications = communicationRepository.findAll().stream()
            .filter(comm -> comm.getCreatedAt().isBefore(cutoffDate))
            .collect(Collectors.toList());
        communicationRepository.deleteAll(oldCommunications);
    }

    @Override
    public void notifyEventParticipants(String eventId, String title, String content) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        sendBulkNotification(
            eventId,
            title,
            content,
            CommunicationType.NOTIFICATION
        );
    }

    @Override
    public void notifyEventCancellation(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        notifyEventParticipants(
            eventId,
            CommunicationConstants.EVENT_CANCELLED_TITLE,
            String.format(CommunicationConstants.EVENT_CANCELLED_TEMPLATE, event.getTitle())
        );
    }

    @Override
    public void notifyEventReminder(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        notifyEventParticipants(
            eventId,
            CommunicationConstants.EVENT_REMINDER_TITLE,
            String.format(CommunicationConstants.EVENT_REMINDER_TEMPLATE, event.getTitle())
        );
    }

    @Override
    public void notifyOrganizationMembers(String organizationId, String title, String content) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        sendBulkNotification(
            organizationId,
            title,
            content,
            CommunicationType.SYSTEM_ALERT
        );
    }

    @Override
    public void notifyOrganizationUpdate(String organizationId, String updateType) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        notifyOrganizationMembers(
            organizationId,
            CommunicationConstants.ORGANIZATION_UPDATE_TITLE,
            String.format(CommunicationConstants.ORGANIZATION_UPDATE_TEMPLATE, org.getName(), updateType)
        );
    }
} 
