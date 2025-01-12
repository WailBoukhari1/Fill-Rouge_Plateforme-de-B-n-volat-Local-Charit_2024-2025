package com.backend.volunteering.service.interfaces;

import com.backend.volunteering.dto.request.UserUpdateRequest;
import com.backend.volunteering.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.backend.volunteering.model.User;

public interface IUserService {
    UserResponse getUserById(String id);
    UserResponse getUserByEmail(String email);
    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse updateUser(String id, UserUpdateRequest updateRequest);
    void deleteUser(String id);
    void changePassword(String id, String oldPassword, String newPassword);
    void verifyEmail(String token);
    void requestPasswordReset(String email);
    void resetPassword(String token, String newPassword);
    void sendVerificationEmail(User user);
    void resendVerificationEmail(String email);
    void sendPasswordResetEmail(User user, String token);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
} 