package com.backend.backend.security;

public class SecurityConstants {
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String[] PUBLIC_URLS = {
        "/api/auth/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/actuator/**"
    };
    public static final String[] ADMIN_URLS = {
        "/api/admin/**"
    };
    
    private SecurityConstants() {
        throw new IllegalStateException("Utility class");
    }
} 