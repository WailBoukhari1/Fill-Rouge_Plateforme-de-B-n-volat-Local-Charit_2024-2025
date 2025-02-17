package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@Schema(description = "Message response object")
public class MessageResponse {
    @Schema(description = "Message unique identifier", example = "msg123")
    private String messageId;
    
    @Schema(description = "Sender identifier", example = "user456")
    private String senderId;
    
    @Schema(description = "Receiver identifier", example = "user789")
    private String receiverId;
    
    @Schema(description = "Message content", example = "Hello, how are you?")
    private String content;
    
    @Schema(description = "Message status (READ/UNREAD)", example = "UNREAD")
    private String status;
    
    @Schema(description = "URL of any attachment", example = "https://example.com/file.pdf")
    private String attachmentUrl;
    
    @Schema(description = "Additional metadata", example = "{\"priority\": \"high\"}")
    private Map<String, Object> metadata;
    
    @Schema(description = "Message timestamp", example = "2024-03-15T10:30:00")
    private LocalDateTime timestamp;
} 