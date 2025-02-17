package com.fill_rouge.backend.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType type;
    private String attachmentUrl;
    private boolean read;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private boolean deleted;
    private LocalDateTime deletedAt;
    private String deletedBy;
    
    public enum MessageType {
        TEXT,
        IMAGE,
        FILE,
        VOICE,
        VIDEO,
        LOCATION,
        SYSTEM
    }
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
} 