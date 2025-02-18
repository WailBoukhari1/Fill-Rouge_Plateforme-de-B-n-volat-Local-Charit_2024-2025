package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "communications")
@CompoundIndex(name = "user_communication_idx", def = "{'receiverId': 1, 'sentAt': -1}")
public class Communication {
    @Id
    private String id;

    @NotBlank(message = "Sender ID is required")
    private String senderId;

    @NotBlank(message = "Receiver ID is required")
    private String receiverId;

    @NotBlank(message = "Content is required")
    private String content;

    private String attachmentUrl;
    private String eventId;
    private String organizationId;

    private boolean isRead;
    private LocalDateTime readAt;
    private boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime sentAt;

    @Builder.Default
    private CommunicationType type = CommunicationType.NOTIFICATION;

    public enum CommunicationType {
        MESSAGE,            // Direct message between users
        NOTIFICATION,       // System notification
        EVENT_UPDATE,       // Event-related update
        ORGANIZATION_NEWS   // Organization announcement
    }
} 