package com.backend.volunteering.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.backend.volunteering.security.JwtTokenProvider;
import com.backend.volunteering.security.TokenBlacklistService;
import com.backend.volunteering.service.interfaces.IEmailService;

@TestConfiguration
public class TestConfig {

    @MockBean
    private IEmailService emailService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 