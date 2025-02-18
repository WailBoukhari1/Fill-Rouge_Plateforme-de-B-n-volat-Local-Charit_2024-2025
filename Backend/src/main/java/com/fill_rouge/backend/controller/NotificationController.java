package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.Communication;
import com.fill_rouge.backend.service.communication.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "APIs for managing user notifications")
public class NotificationController {

    private final CommunicationService communicationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notifications", description = "Get all notifications for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Communication.class)))
    })
    public ResponseEntity<List<Communication>> getNotifications(
            @RequestHeader("X-User-ID") String userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        return ResponseEntity.ok(
            unreadOnly ? communicationService.getUnreadNotifications(userId) 
                      : communicationService.getAllNotifications(userId)
        );
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get the count of unread notifications")
    @ApiResponse(responseCode = "200", description = "Unread count retrieved successfully")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(communicationService.getUnreadCount(userId));
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification marked as read successfully"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        communicationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications for the current user as read")
    @ApiResponse(responseCode = "200", description = "All notifications marked as read successfully")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("X-User-ID") String userId) {
        communicationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Notification deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        communicationService.deleteCommunication(notificationId);
        return ResponseEntity.noContent().build();
    }
} 