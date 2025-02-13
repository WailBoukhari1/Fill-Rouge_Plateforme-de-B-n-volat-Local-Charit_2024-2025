package com.backend.backend.service.impl;

import com.backend.backend.dto.request.ProfileUpdateRequest;
import com.backend.backend.dto.response.UserResponse;
import com.backend.backend.dto.response.UserStatsResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.exception.ResourceNotFoundException;
import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToUserResponse);
    }

    @Override
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserResponse updateProfile(String id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        updateUserFromRequest(user, request);
        return mapToUserResponse(userRepository.save(user));
    }

    @Override
    public String updateProfilePicture(String id, MultipartFile file) {
        // Implementation would depend on your file storage service
        throw new CustomException("Not implemented", HttpStatus.NOT_IMPLEMENTED);
    }

    @Override
    public void updatePreferences(String id, List<String> skills, List<String> interests) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setSkills(skills);
        user.setInterests(interests);
        userRepository.save(user);
    }

    @Override
    public Page<UserResponse> searchUsers(String query, String role, Pageable pageable) {
        // Basic implementation - enhance based on your requirements
        return userRepository.findByEmailContainingIgnoreCase(query, pageable)
                .map(this::mapToUserResponse);
    }

    @Override
    public List<UserResponse> findNearbyUsers(String location, Double radius) {
        // Implementation would depend on your location service
        throw new CustomException("Not implemented", HttpStatus.NOT_IMPLEMENTED);
    }

    @Override
    public void activateUser(String id) {
        updateUserStatus(id, true);
    }

    @Override
    public void deactivateUser(String id) {
        updateUserStatus(id, false);
    }

    @Override
    public void verifyUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Override
    public UserStatsResponse getUserStats(String id) {
        // Implementation would depend on your statistics requirements
        throw new CustomException("Not implemented", HttpStatus.NOT_IMPLEMENTED);
    }

    @Override
    public UserStatsResponse getOverallUserStats() {
        // Implementation would depend on your statistics requirements
        throw new CustomException("Not implemented", HttpStatus.NOT_IMPLEMENTED);
    }

    private void updateUserStatus(String id, boolean status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(status);
        userRepository.save(user);
    }

    private void updateUserFromRequest(User user, ProfileUpdateRequest request) {
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio(request.getBio());
        user.setLocation(request.getLocation());
        user.setSkills(request.getSkills());
        user.setInterests(request.getInterests());
    }

    private UserResponse mapToUserResponse(User user) {
        // Implement mapping logic based on your UserResponse DTO
        throw new CustomException("Not implemented", HttpStatus.NOT_IMPLEMENTED);
    }
} 