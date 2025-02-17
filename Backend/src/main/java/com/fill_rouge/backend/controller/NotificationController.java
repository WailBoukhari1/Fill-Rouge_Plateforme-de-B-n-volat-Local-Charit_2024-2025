package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.response.NotificationResponse;
import com.fill_rouge.backend.mapper.CommunicationMapper;
import com.fill_rouge.backend.service.communication.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    private final CommunicationMapper communicationMapper;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notifications", description = "Get all notifications for the current user")
    @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestHeader("X-User-ID") String userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        return ResponseEntity.ok(communicationMapper.toNotificationResponseList(
            unreadOnly ? communicationService.getUnreadNotifications(userId) 
                      : communicationService.getAllNotifications(userId)
        ));
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    @ApiResponse(responseCode = "200", description = "Notification marked as read successfully")
    @ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<NotificationResponse> markAsRead(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String notificationId) {
        return ResponseEntity.ok(communicationMapper.toNotificationResponse(
            communicationService.markNotificationAsRead(userId, notificationId)
        ));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications for the current user as read")
    @ApiResponse(responseCode = "200", description = "All notifications marked as read successfully")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("X-User-ID") String userId) {
        communicationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    @ApiResponse(responseCode = "204", description = "Notification deleted successfully")
    @ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<Void> deleteNotification(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String notificationId) {
        communicationService.deleteNotification(userId, notificationId);
        return ResponseEntity.noContent().build();
    }
} 