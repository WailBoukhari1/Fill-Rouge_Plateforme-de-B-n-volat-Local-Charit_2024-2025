package com.backend.volunteering.security;

import com.backend.volunteering.exception.ResourceNotFoundException;
import com.backend.volunteering.model.User;
import com.backend.volunteering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.error("User not found with email: {}", email);
                return new UsernameNotFoundException("User not found with email: " + email);
            });

        if (!user.isEnabled()) {
            log.error("User account is disabled: {}", email);
            throw new UsernameNotFoundException("User account is disabled: " + email);
        }

        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserById(String id) {
        log.debug("Loading user by ID: {}", id);
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                log.error("User not found with ID: {}", id);
                return new ResourceNotFoundException("User", "id", id);
            });

        return UserPrincipal.create(user);
    }
}