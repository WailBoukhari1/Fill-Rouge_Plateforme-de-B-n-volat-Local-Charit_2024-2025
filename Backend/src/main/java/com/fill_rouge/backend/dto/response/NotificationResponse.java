package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Notification response object")
public class NotificationResponse {
    @Schema(description = "Notification unique identifier", example = "notif123")
    private String id;
    
    @Schema(description = "Sender identifier", example = "SYSTEM")
    private String senderId;
    
    @Schema(description = "Receiver identifier", example = "user123")
    private String receiverId;
    
    @Schema(description = "Notification content", example = "You have been invited to participate in Event XYZ")
    private String content;
    
    @Schema(description = "Optional attachment URL", example = "https://example.com/attachment.pdf")
    private String attachmentUrl;
    
    @Schema(description = "Whether the notification has been read", example = "false")
    private boolean read;
    
    @Schema(description = "When the notification was sent", example = "2024-03-15T10:30:00")
    private LocalDateTime sentAt;
    
    @Schema(description = "When the notification was read", example = "2024-03-15T11:30:00")
    private LocalDateTime readAt;
    
    @Schema(description = "Additional metadata", example = "{\"priority\": \"high\"}")
    private Map<String, Object> metadata;
} 