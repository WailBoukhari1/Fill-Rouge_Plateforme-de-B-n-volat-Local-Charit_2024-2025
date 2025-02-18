package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.Message;
import com.fill_rouge.backend.service.message.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Validated
@Tag(name = "Messages", description = "APIs for managing messages between users")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Send message", description = "Send a message to another user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Message sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<Message> sendMessage(
            @RequestHeader("X-User-ID") String senderId,
            @RequestParam @NotBlank String receiverId,
            @RequestParam @NotBlank @Size(min = 1, max = 2000) String content,
            @RequestParam(required = false) String attachmentUrl) {
        return ResponseEntity.ok(
            messageService.sendMessage(senderId, receiverId, content, attachmentUrl)
        );
    }

    @GetMapping("/conversation/{otherUserId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get conversation", description = "Get messages between current user and another user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conversation retrieved successfully")
    })
    public ResponseEntity<List<Message>> getConversation(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String otherUserId) {
        return ResponseEntity.ok(
            messageService.getConversation(userId, otherUserId)
        );
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread messages", description = "Get all unread messages for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unread messages retrieved successfully")
    })
    public ResponseEntity<List<Message>> getUnreadMessages(
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(
            messageService.getUnreadMessages(userId)
        );
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get the count of unread messages")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(messageService.getUnreadCount(userId));
    }

    @PatchMapping("/{messageId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark a message as read")
    public ResponseEntity<Void> markAsRead(@PathVariable String messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all as read", description = "Mark all messages as read")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("X-User-ID") String userId) {
        messageService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{messageId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete message", description = "Delete a message")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
}