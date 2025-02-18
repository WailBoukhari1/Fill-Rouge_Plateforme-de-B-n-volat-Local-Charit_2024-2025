package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
@CompoundIndex(name = "participants_idx", def = "{'participantIds': 1}")
public class Conversation {
    @Id
    private String id;

    @NotNull(message = "Participant IDs are required")
    private List<String> participantIds = new ArrayList<>();

    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private String lastMessageSenderId;

    private boolean isGroupChat;
    private String groupName;
    private String groupAvatar;
    private String groupAdminId;

    private String eventId;  // For event-specific conversations
    private String organizationId;  // For organization-specific conversations

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private boolean isArchived;
    private LocalDateTime archivedAt;
    private String archivedBy;

    public void updateLastMessage(Message message) {
        this.lastMessageContent = message.getContent();
        this.lastMessageTime = message.getCreatedAt();
        this.lastMessageSenderId = message.getSenderId();
        this.updatedAt = LocalDateTime.now();
    }
} 