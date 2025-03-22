package com.fill_rouge.backend.service.user;

import com.fill_rouge.backend.domain.User;

/**
 * Service interface for managing users
 */
public interface UserService {
    
    /**
     * Get a user by their ID
     * 
     * @param userId The user ID
     * @return The user if found
     */
    User getUserById(String userId);
} 