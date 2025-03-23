package com.fill_rouge.backend.service.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.User;


public interface UserService {
    

    User getUserById(String userId);
    
    Page<User> getAllUsers(Pageable pageable);
   
    User updateUserRole(String userId, Role role);
    
    void lockUserAccount(String userId);
 
    void unlockUserAccount(String userId);

    void deleteUser(String userId);
    Object getUserStatistics();
} 