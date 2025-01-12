package com.backend.volunteering.util;

public final class Constants {
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final int MAX_PAGE_SIZE = 50;
    
    public static final long JWT_ACCESS_TOKEN_EXPIRATION = 900000; // 15 minutes
    public static final long JWT_REFRESH_TOKEN_EXPIRATION = 604800000; // 7 days
    
    public static final String TOKEN_TYPE = "Bearer";
    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    
    public static final String ROLE_USER = "USER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_MODERATOR = "MODERATOR";

    private Constants() {
        // Private constructor to prevent instantiation
    }
} 