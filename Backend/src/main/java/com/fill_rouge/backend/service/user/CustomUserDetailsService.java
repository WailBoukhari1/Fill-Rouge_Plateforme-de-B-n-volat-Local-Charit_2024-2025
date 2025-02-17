package com.fill_rouge.backend.service.user;

import com.fill_rouge.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading user by email: {}", email);
        
        try {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("User not found with email: %s", email)
                    ));
        } catch (Exception e) {
            logger.error("Error loading user by email: {}", email, e);
            throw new UsernameNotFoundException("Error loading user", e);
        }
    }
} 