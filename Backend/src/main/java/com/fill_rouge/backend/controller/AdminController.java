package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.response.AdminStatisticsResponse;
import com.fill_rouge.backend.dto.response.EventResponse;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import com.fill_rouge.backend.dto.response.PageResponse;
import com.fill_rouge.backend.service.organization.OrganizationService;
import com.fill_rouge.backend.service.statistics.StatisticsService;
import com.fill_rouge.backend.service.user.UserService;
import com.fill_rouge.backend.service.event.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;
    private final OrganizationService organizationService;
    private final StatisticsService statisticsService;
    private final EventService eventService;

    @Autowired
    public AdminController(UserService userService, OrganizationService organizationService, StatisticsService statisticsService, EventService eventService) {
        this.userService = userService;
        this.organizationService = organizationService;
        this.statisticsService = statisticsService;
        this.eventService = eventService;
        logger.info("AdminController initialized");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsResponse> getAdminStatistics() {
        logger.info("GET /admin/statistics");
        try {
            AdminStatisticsResponse statistics = statisticsService.getAdminStatistics();
            logger.info("AdminStatistics response generated successfully");
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error generating admin statistics", e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("GET /admin/users with page: {}, size: {}", page, size);
        try {
            Page<User> usersPage = userService.getAllUsers(PageRequest.of(page, size));
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", usersPage.getContent());
            response.put("totalUsers", usersPage.getTotalElements());
            response.put("currentPage", usersPage.getNumber());
            response.put("totalPages", usersPage.getTotalPages());
            
            logger.info("Users response generated successfully: {} users, page {}/{}", 
                     usersPage.getContent().size(), usersPage.getNumber(), usersPage.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving users", e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/lock")
    public ResponseEntity<Void> lockUserAccount(@PathVariable String userId) {
        logger.info("PUT /admin/users/{}/lock", userId);
        userService.lockUserAccount(userId);
        logger.info("User account locked: {}", userId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/unlock")
    public ResponseEntity<Void> unlockUserAccount(@PathVariable String userId) {
        logger.info("PUT /admin/users/{}/unlock", userId);
        userService.unlockUserAccount(userId);
        logger.info("User account unlocked: {}", userId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> payload) {
        String role = payload.get("role");
        logger.info("PUT /admin/users/{}/role with role: {}", userId, role);
        
        Role roleEnum = Role.valueOf(role);
        User user = userService.updateUserRole(userId, roleEnum);
        logger.info("User role updated: {} to {}", userId, role);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        logger.info("DELETE /admin/users/{}", userId);
        userService.deleteUser(userId);
        logger.info("User deleted: {}", userId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/organizations")
    public ResponseEntity<Map<String, Object>> getOrganizations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("GET /admin/organizations with page: {}, size: {}", page, size);
        try {
            List<OrganizationResponse> organizations = organizationService.getAllOrganizations();
            // Manual pagination since the service doesn't support PageRequest
            int start = page * size;
            int end = Math.min(start + size, organizations.size());
            List<OrganizationResponse> pageContent = organizations.subList(start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("organizations", pageContent);
            response.put("totalOrganizations", organizations.size());
            response.put("currentPage", page);
            response.put("totalPages", (int) Math.ceil(organizations.size() / (double) size));
            
            logger.info("Organizations response generated successfully: {} organizations, page {}/{}", 
                      pageContent.size(), page, (int) Math.ceil(organizations.size() / (double) size));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving organizations", e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/organizations/{organizationId}/verify")
    public ResponseEntity<OrganizationResponse> verifyOrganization(@PathVariable String organizationId) {
        logger.info("PUT /admin/organizations/{}/verify", organizationId);
        organizationService.verifyOrganization(organizationId);
        OrganizationResponse organization = organizationService.getOrganization(organizationId);
        logger.info("Organization verified: {}", organizationId);
        return ResponseEntity.ok(organization);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/organizations/{organizationId}/suspend")
    public ResponseEntity<OrganizationResponse> suspendOrganization(@PathVariable String organizationId) {
        logger.info("PUT /admin/organizations/{}/suspend", organizationId);
        organizationService.deleteOrganization(organizationId);
        organizationService.verifyOrganization(organizationId);
        OrganizationResponse organization = organizationService.getOrganization(organizationId);
        logger.info("Organization suspended: {}", organizationId);
        return ResponseEntity.ok(organization);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/organizations/{organizationId}/reactivate")
    public ResponseEntity<OrganizationResponse> reactivateOrganization(@PathVariable String organizationId) {
        logger.info("PUT /admin/organizations/{}/reactivate", organizationId);
        organizationService.verifyOrganization(organizationId);
        OrganizationResponse organization = organizationService.getOrganization(organizationId);
        logger.info("Organization reactivated: {}", organizationId);
        return ResponseEntity.ok(organization);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/organizations/{organizationId}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String organizationId) {
        logger.info("DELETE /admin/organizations/{}", organizationId);
        organizationService.deleteOrganization(organizationId);
        logger.info("Organization deleted: {}", organizationId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean includeAll) {
        logger.info("GET /admin/events with page: {}, size: {}, includeAll: {}", page, size, includeAll);
        try {
            Page<EventResponse> eventsPage = eventService.getAllEvents(PageRequest.of(page, size), includeAll);
            
            Map<String, Object> response = new HashMap<>();
            response.put("events", eventsPage.getContent());
            response.put("totalEvents", eventsPage.getTotalElements());
            response.put("currentPage", eventsPage.getNumber());
            response.put("totalPages", eventsPage.getTotalPages());
            
            logger.info("Events response generated successfully: {} events, page {}/{}", 
                     eventsPage.getContent().size(), eventsPage.getNumber(), eventsPage.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving events", e);
            throw e;
        }
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/events/{eventId}/approve")
    public ResponseEntity<EventResponse> approveEvent(@PathVariable String eventId) {
        logger.info("PUT /admin/events/{}/approve", eventId);
        EventResponse event = eventService.approveEvent(eventId);
        logger.info("Event approved: {}", eventId);
        return ResponseEntity.ok(event);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/events/{eventId}/reject")
    public ResponseEntity<EventResponse> rejectEvent(
            @PathVariable String eventId,
            @RequestBody Map<String, String> payload) {
        String reason = payload.getOrDefault("reason", "");
        logger.info("PUT /admin/events/{}/reject with reason: {}", eventId, reason);
        EventResponse event = eventService.rejectEvent(eventId, reason);
        logger.info("Event rejected: {}", eventId);
        return ResponseEntity.ok(event);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String eventId) {
        logger.info("DELETE /admin/events/{}", eventId);
        eventService.deleteEvent(eventId);
        logger.info("Event deleted: {}", eventId);
        return ResponseEntity.noContent().build();
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/events/{eventId}/status")
    public ResponseEntity<EventResponse> updateEventStatus(
            @PathVariable String eventId,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        logger.info("PATCH /admin/events/{}/status with status: {}", eventId, statusStr);
        
        EventResponse event = null;
        
        try {
            // Convert string status to EventStatus enum
            com.fill_rouge.backend.constant.EventStatus status = com.fill_rouge.backend.constant.EventStatus.valueOf(statusStr);
            
            // Use appropriate service methods based on the requested status
            if (status == com.fill_rouge.backend.constant.EventStatus.ACTIVE) {
                event = eventService.approveEvent(eventId);
                logger.info("Event approved: {}", eventId);
            } else if (status == com.fill_rouge.backend.constant.EventStatus.REJECTED) {
                String reason = payload.getOrDefault("reason", "");
                event = eventService.rejectEvent(eventId, reason);
                logger.info("Event rejected: {}", eventId);
            } else if ("DRAFT".equals(status.name())) {
                // For draft status, use the generic updateEventStatus method
                Event updatedEvent = eventService.updateEventStatus(eventId, status);
                event = eventService.getEventResponseById(updatedEvent.getId());
                logger.info("Event set to draft: {}", eventId);
            } else {
                // For other statuses, use the generic updateEventStatus method
                Event updatedEvent = eventService.updateEventStatus(eventId, status);
                event = eventService.getEventResponseById(updatedEvent.getId());
                logger.info("Event status updated to {}: {}", status, eventId);
            }
            
            return ResponseEntity.ok(event);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid event status: {}", statusStr, e);
            throw new IllegalArgumentException("Invalid event status: " + statusStr);
        }
    }
} 