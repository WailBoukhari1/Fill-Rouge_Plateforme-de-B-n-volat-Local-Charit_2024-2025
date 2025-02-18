package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndex(name = "user_notification_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Notification {
    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    private String actionUrl;  // URL to redirect when notification is clicked
    private String imageUrl;   // Optional image for rich notifications

    private String eventId;        // For event-related notifications
    private String organizationId; // For organization-related notifications
    private String achievementId;  // For achievement-related notifications

    private boolean isRead;
    private LocalDateTime readAt;
    private boolean isArchived;
    private LocalDateTime archivedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        EVENT_REMINDER,      // Upcoming event reminder
        EVENT_UPDATE,       // Event details updated
        EVENT_CANCELLED,    // Event cancelled
        ACHIEVEMENT_EARNED, // New achievement earned
        MESSAGE_RECEIVED,   // New message received
        SYSTEM_UPDATE,      // System update notification
        ORGANIZATION_NEWS   // Organization news/announcement
    }
} 