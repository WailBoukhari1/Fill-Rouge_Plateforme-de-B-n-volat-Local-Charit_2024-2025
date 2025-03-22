package com.fill_rouge.backend.service.user;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    
    @Override
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }
} 