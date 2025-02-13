package com.backend.backend.security;

public final class SecurityConstants {
    private SecurityConstants() {} // Prevent instantiation

    // JWT Constants
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final long ACCESS_TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24 hours
    public static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // OAuth2 Constants
    public static final String OAUTH2_BASE_URI = "/oauth2/authorization";
    public static final String OAUTH2_REDIRECT_URI = "/login/oauth2/code/*";
    
    // Role Constants
    public static final String ROLE_USER = "USER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_ORGANIZATION = "ORGANIZATION";
    public static final String ROLE_VOLUNTEER = "VOLUNTEER";
    
    // Public Endpoints
    public static final String[] PUBLIC_URLS = {
        "/api/auth/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/oauth2/**",
        OAUTH2_REDIRECT_URI,
        OAUTH2_BASE_URI + "/**"
    };
    
    public static final String[] PUBLIC_GET_URLS = {
        "/api/events/**",
        "/api/organizations/**",
        "/api/volunteers/**"
    };
    
    // Admin Endpoints
    public static final String[] ADMIN_URLS = {
        "/api/admin/**",
        "/api/organizations/*/verify"
    };
    
    // Organization Endpoints
    public static final class OrganizationEndpoints {
        private OrganizationEndpoints() {}
        
        public static final String[] POST_URLS = {"/api/events"};
        public static final String[] PUT_URLS = {"/api/events/*"};
        public static final String[] DELETE_URLS = {"/api/events/*"};
        public static final String[] PATCH_URLS = {
            "/api/events/*/publish",
            "/api/events/*/cancel"
        };
    }
    
    // CORS Configuration
    public static final String[] ALLOWED_ORIGINS = {"http://localhost:4200"};
    public static final String[] ALLOWED_METHODS = {"GET", "POST", "PUT", "DELETE", "OPTIONS"};
    public static final String[] ALLOWED_HEADERS = {
        "Authorization", 
        "Content-Type", 
        "X-Requested-With", 
        "Accept", 
        "Origin", 
        "Access-Control-Request-Method", 
        "Access-Control-Request-Headers"
    };
    public static final String[] EXPOSED_HEADERS = {"Authorization"};
} 