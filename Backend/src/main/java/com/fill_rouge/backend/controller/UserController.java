package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.service.user.UserService;
import com.fill_rouge.backend.constant.Role;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;

    @GetMapping("/debug")
    public ResponseEntity<String> debugEndpoint(HttpServletRequest request) {
        log.info("==== DEBUG INFO ====");
        log.info("RequestURI: {}", request.getRequestURI());
        log.info("ContextPath: {}", request.getContextPath());
        log.info("ServletPath: {}", request.getServletPath());
        log.info("Remote Address: {}", request.getRemoteAddr());
        log.info("Query String: {}", request.getQueryString());
        log.info("==== END DEBUG INFO ====");
        
        StringBuilder debug = new StringBuilder();
        debug.append("RequestURI: ").append(request.getRequestURI()).append("\n");
        debug.append("ContextPath: ").append(request.getContextPath()).append("\n");
        debug.append("ServletPath: ").append(request.getServletPath()).append("\n");
        debug.append("Remote Address: ").append(request.getRemoteAddr()).append("\n");
        debug.append("Query String: ").append(request.getQueryString()).append("\n");
        
        return ResponseEntity.ok(debug.toString());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users with pagination (Admin only)")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        log.info("** UserController.getAllUsers: Received request from {} for users with page={}, size={}", 
                 request.getRemoteAddr(), page, size);
        log.debug("** Request URI: {}", request.getRequestURI());
        log.debug("** Request URL: {}", request.getRequestURL());
        log.debug("** Context Path: {}", request.getContextPath());
        log.debug("** Servlet Path: {}", request.getServletPath());
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            log.debug("** Created pageable request: {}", pageable);
            
            Page<User> users = userService.getAllUsers(pageable);
            log.info("** Successfully retrieved {} users", users.getTotalElements());
            log.debug("** Page details: totalPages={}, totalElements={}, size={}", 
                     users.getTotalPages(), users.getTotalElements(), users.getSize());
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("** Error in getAllUsers: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    @Operation(summary = "Get user by ID (Admin or user themselves)")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id, HttpServletRequest request) {
        log.info("** UserController.getUserById: Received request from {} for user ID: {}", 
                 request.getRemoteAddr(), id);
        log.debug("** Request URI: {}", request.getRequestURI());
        
        try {
            User user = userService.getUserById(id);
            log.info("** Successfully retrieved user: {}", user.getId());
            return ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully"));
        } catch (Exception e) {
            log.error("** Error in getUserById: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<User>> getCurrentUserProfile(
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        log.info("** UserController.getCurrentUserProfile: Received request from {} for current user profile", 
                 request.getRemoteAddr());
        log.debug("** Request URI: {}", request.getRequestURI());
        
        try {
            String userId = user.getId();
            log.debug("** Fetching profile for user ID: {}", userId);
            
            User userDetails = userService.getUserById(userId);
            log.info("** Successfully retrieved user profile for: {}", userId);
            
            return ResponseEntity.ok(ApiResponse.success(userDetails, "User profile retrieved successfully"));
        } catch (Exception e) {
            log.error("** Error in getCurrentUserProfile: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role (Admin only)")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable String id,
            @RequestBody RoleUpdateRequest request,
            HttpServletRequest servletRequest) {
        log.info("** UserController.updateUserRole: Received request from {} to update role for user ID: {} to {}", 
                 servletRequest.getRemoteAddr(), id, request.getRole());
        log.debug("** Request URI: {}", servletRequest.getRequestURI());
        
        try {
            User updatedUser = userService.updateUserRole(id, request.getRole());
            log.info("** Successfully updated role for user: {} to {}", id, request.getRole());
            
            return ResponseEntity.ok(ApiResponse.success(updatedUser, "User role updated successfully"));
        } catch (Exception e) {
            log.error("** Error in updateUserRole: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lock user account (Admin only)")
    public ResponseEntity<ApiResponse<Void>> lockUserAccount(
            @PathVariable String id,
            HttpServletRequest request) {
        log.info("** UserController.lockUserAccount: Received request from {} to lock account for user ID: {}", 
                 request.getRemoteAddr(), id);
        log.debug("** Request URI: {}", request.getRequestURI());
        
        try {
            userService.lockUserAccount(id);
            log.info("** Successfully locked account for user: {}", id);
            
            return ResponseEntity.ok(ApiResponse.success(null, "User account locked successfully"));
        } catch (Exception e) {
            log.error("** Error in lockUserAccount: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unlock user account (Admin only)")
    public ResponseEntity<ApiResponse<Void>> unlockUserAccount(
            @PathVariable String id,
            HttpServletRequest request) {
        log.info("** UserController.unlockUserAccount: Received request from {} to unlock account for user ID: {}", 
                 request.getRemoteAddr(), id);
        log.debug("** Request URI: {}", request.getRequestURI());
        
        try {
            userService.unlockUserAccount(id);
            log.info("** Successfully unlocked account for user: {}", id);
            
            return ResponseEntity.ok(ApiResponse.success(null, "User account unlocked successfully"));
        } catch (Exception e) {
            log.error("** Error in unlockUserAccount: {}", e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable String id,
            HttpServletRequest request) {
        log.info("** UserController.deleteUser: Received request from {} to delete user ID: {}", 
                 request.getRemoteAddr(), id);
        log.debug("** Request URI: {}", request.getRequestURI());
        
        try {
            userService.deleteUser(id);
            log.info("** Successfully deleted user: {}", id);
            
            return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
        } catch (Exception e) {
            log.error("** Error in deleteUser: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user statistics (Admin only)")
    public ResponseEntity<ApiResponse<Object>> getUserStats(HttpServletRequest request) {
        log.info("** UserController.getUserStats: Received request from {} for user statistics", 
                 request.getRemoteAddr());
        log.debug("** Request URI: {}", request.getRequestURI());
        
        try {
            Object stats = userService.getUserStatistics();
            log.info("** Successfully retrieved user statistics");
            
            return ResponseEntity.ok(ApiResponse.success(stats, "User statistics retrieved successfully"));
        } catch (Exception e) {
            log.error("** Error in getUserStats: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Inner class for role update request
    public static class RoleUpdateRequest {
        private Role role;

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }
} 