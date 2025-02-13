package com.backend.backend.service.interfaces;

import com.backend.backend.dto.request.ProfileUpdateRequest;
import com.backend.backend.dto.response.UserResponse;
import com.backend.backend.dto.response.UserStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    // Core User Operations
    UserResponse getUserById(String id);
    UserResponse getUserByEmail(String email);
    Page<UserResponse> getAllUsers(Pageable pageable);
    void deleteUser(String id);
    
    // Profile Management
    UserResponse updateProfile(String id, ProfileUpdateRequest request);
    String updateProfilePicture(String id, MultipartFile file);
    void updatePreferences(String id, List<String> skills, List<String> interests);
    
    // User Search
    Page<UserResponse> searchUsers(String query, String role, Pageable pageable);
    List<UserResponse> findNearbyUsers(String location, Double radius);
    
    // User Status
    void activateUser(String id);
    void deactivateUser(String id);
    void verifyUser(String id);
    
    // User Statistics
    UserStatsResponse getUserStats(String id);
    UserStatsResponse getOverallUserStats();
} 