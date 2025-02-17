package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.Communication.CommunicationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Notification response object")
public class NotificationResponse {
    @Schema(description = "Notification unique identifier", example = "notif123")
    private String notificationId;
    
    @Schema(description = "Notification title", example = "New Event Invitation")
    private String title;
    
    @Schema(description = "Notification content", example = "You have been invited to participate in Event XYZ")
    private String content;
    
    @Schema(description = "Notification type", example = "EVENT_INVITATION")
    private CommunicationType type;
    
    @Schema(description = "Reference identifier (e.g., event ID)", example = "event456")
    private String referenceId;
    
    @Schema(description = "Notification status (READ/UNREAD)", example = "UNREAD")
    private String status;
    
    @Schema(description = "Additional metadata", example = "{\"priority\": \"high\"}")
    private Map<String, Object> metadata;
    
    @Schema(description = "Notification timestamp", example = "2024-03-15T10:30:00")
    private LocalDateTime timestamp;
} 