package com.fill_rouge.backend.config.security;

import java.security.Key;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class JwtKeyConfig {

    private final JwtConfig jwtConfig;

    @Bean
    public Key signingKey() {
        return Keys.hmacShaKeyFor(jwtConfig.getSecretKey().getBytes(StandardCharsets.UTF_8));
    }
} 