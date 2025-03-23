package com.fill_rouge.backend.service.user;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.constant.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    
    @Override
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }
    
    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination: {}", pageable);
        return userRepository.findAll(pageable);
    }
    
    @Override
    @Transactional
    public User updateUserRole(String userId, Role role) {
        log.info("Updating role for user {} to {}", userId, role);
        User user = getUserById(userId);
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void lockUserAccount(String userId) {
        log.info("Locking account for user {}", userId);
        User user = getUserById(userId);
        user.setAccountNonLocked(false);
        // Set lock until a far future date
        user.setAccountLockedUntil(LocalDateTime.now().plusYears(100));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void unlockUserAccount(String userId) {
        log.info("Unlocking account for user {}", userId);
        User user = getUserById(userId);
        user.setAccountNonLocked(true);
        user.setAccountLockedUntil(null);
        user.setFailedLoginAttempts(0);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void deleteUser(String userId) {
        log.info("Deleting user {}", userId);
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
    
    @Override
    public Object getUserStatistics() {
        log.info("Fetching user statistics");
        Map<String, Object> stats = new HashMap<>();
        
        // Count all users
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Count users by role using direct queries
        stats.put("volunteers", countByRole(Role.VOLUNTEER));
        stats.put("organizations", countByRole(Role.ORGANIZATION));
        stats.put("admins", countByRole(Role.ADMIN));
        
        // Count verified and locked accounts
        stats.put("verifiedUsers", countByEmailVerified(true));
        stats.put("unverifiedUsers", countByEmailVerified(false));
        stats.put("lockedAccounts", countByAccountNonLocked(false));
        
        return stats;
    }
    
    private long countByRole(Role role) {
        Query query = new Query(Criteria.where("role").is(role));
        return mongoTemplate.count(query, User.class);
    }
    
    private long countByEmailVerified(boolean verified) {
        Query query = new Query(Criteria.where("emailVerified").is(verified));
        return mongoTemplate.count(query, User.class);
    }
    
    private long countByAccountNonLocked(boolean nonLocked) {
        Query query = new Query(Criteria.where("accountNonLocked").is(nonLocked));
        return mongoTemplate.count(query, User.class);
    }
} 