package com.backend.backend.service.interfaces;

import com.backend.backend.domain.model.User;

public interface UserService {
    User findByEmail(String email);
    User save(User user);
    boolean existsByEmail(String email);
} 