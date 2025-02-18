package com.fill_rouge.backend.service.communication;

import com.fill_rouge.backend.domain.Communication;
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
            .type(Communication.CommunicationType.MESSAGE)
            .isRead(false)
            .sentAt(LocalDateTime.now())
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
    public Communication sendNotification(String userId, String content) {
        Communication notification = Communication.builder()
            .senderId(CommunicationConstants.SYSTEM_SENDER)
            .receiverId(userId)
            .content(content)
            .type(Communication.CommunicationType.NOTIFICATION)
            .isRead(false)
            .sentAt(LocalDateTime.now())
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
        communication.setReadAt(LocalDateTime.now());
        communicationRepository.save(communication);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Communication> unreadCommunications = communicationRepository.findAllUnreadByReceiverId(userId);
        LocalDateTime now = LocalDateTime.now();
        unreadCommunications.forEach(comm -> {
            comm.setRead(true);
            comm.setReadAt(now);
        });
        communicationRepository.saveAll(unreadCommunications);
    }

    @Override
    public long getUnreadCount(String userId) {
        return communicationRepository.findAllUnreadByReceiverId(userId).size();
    }

    @Override
    public void deleteCommunication(String communicationId) {
        Communication communication = communicationRepository.findById(communicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Communication not found"));
        communication.setDeleted(true);
        communication.setDeletedAt(LocalDateTime.now());
        communicationRepository.save(communication);
    }

    @Override
    public void sendBulkNotification(List<String> userIds, String content) {
        List<Communication> notifications = userIds.stream()
            .map(userId -> Communication.builder()
                .senderId(CommunicationConstants.SYSTEM_SENDER)
                .receiverId(userId)
                .content(content)
                .type(Communication.CommunicationType.NOTIFICATION)
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build())
            .collect(Collectors.toList());
        
        communicationRepository.saveAll(notifications);
        
        // Send real-time notifications via WebSocket
        notifications.forEach(notification -> 
            messagingTemplate.convertAndSendToUser(
                notification.getReceiverId(),
                CommunicationConstants.NOTIFICATION_QUEUE,
                notification
            )
        );
    }

    @Override
    public void cleanupOldCommunications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Communication> oldCommunications = communicationRepository.findBySentAtBeforeAndDeletedFalse(cutoffDate);
        
        oldCommunications.forEach(comm -> {
            comm.setDeleted(true);
            comm.setDeletedAt(LocalDateTime.now());
        });
        communicationRepository.saveAll(oldCommunications);
    }

    @Override
    public void notifyEventParticipants(String eventId, String content) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        List<String> participantIds = new ArrayList<>(event.getRegisteredParticipants());
        sendBulkNotification(participantIds, content);
    }

    @Override
    public void notifyEventCancellation(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        String content = String.format(CommunicationConstants.EVENT_CANCELLED_TEMPLATE, event.getTitle());
        notifyEventParticipants(eventId, content);
    }

    @Override
    public void notifyEventReminder(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        String content = String.format(CommunicationConstants.EVENT_REMINDER_TEMPLATE, event.getTitle());
        notifyEventParticipants(eventId, content);
    }

    @Override
    public void notifyOrganizationMembers(String organizationId, String content) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged()).getContent();
        List<String> memberIds = events.stream()
                .flatMap(event -> event.getRegisteredParticipants().stream())
                .distinct()
                .collect(Collectors.toList());
        sendBulkNotification(memberIds, content);
    }

    @Override
    public void notifyOrganizationUpdate(String organizationId, String updateType) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        String content = String.format(CommunicationConstants.ORGANIZATION_UPDATE_TEMPLATE, org.getName(), updateType);
        notifyOrganizationMembers(organizationId, content);
    }
} 