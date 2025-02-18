package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
@CompoundIndex(name = "conversation_idx", def = "{'senderId': 1, 'receiverId': 1, 'createdAt': -1}")
public class Message {
    @Id
    private String id;

    @NotBlank(message = "Sender ID is required")
    private String senderId;

    @NotBlank(message = "Receiver ID is required")
    private String receiverId;

    @NotBlank(message = "Message content is required")
    @Size(min = 1, max = 2000, message = "Message must be between 1 and 2000 characters")
    private String content;

    private String eventId;  // Optional, for event-related messages
    private String organizationId;  // Optional, for organization announcements

    @NotNull(message = "Message type is required")
    private MessageType type;

    private boolean read;
    private LocalDateTime readAt;
    private boolean deleted;
    private String deletedBy;
    private LocalDateTime deletedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MessageType {
        DIRECT,             // Direct message between users
        EVENT,              // Event-related message
        ORGANIZATION,       // Organization announcement
        SYSTEM,            // System notification
        ACHIEVEMENT        // Achievement notification
    }
} 