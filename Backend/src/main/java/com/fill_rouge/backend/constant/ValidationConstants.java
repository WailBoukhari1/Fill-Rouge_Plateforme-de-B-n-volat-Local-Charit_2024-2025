package com.fill_rouge.backend.constant;

/**
 * Constants for validation patterns and limits used across the application.
 */
public final class ValidationConstants {
    // Regex Patterns
    public static final String PHONE_REGEX = "^\\+?[1-9]\\d{1,14}$";
    public static final String URL_REGEX = "^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$";
    public static final String REGISTRATION_REGEX = "^[A-Z0-9-]{5,20}$";
    public static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String PASSWORD_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$";
    
    // Size Limits
    public static final int MAX_SOCIAL_MEDIA_LINKS = 5;
    public static final int MAX_DOCUMENTS = 10;
    public static final int MAX_FOCUS_AREAS = 10;
    public static final int MAX_SKILLS = 20;
    public static final int MAX_INTERESTS = 15;
    
    // Text Length Limits
    public static final int MIN_NAME_LENGTH = 2;
    public static final int MAX_NAME_LENGTH = 100;
    public static final int MIN_DESCRIPTION_LENGTH = 20;
    public static final int MAX_DESCRIPTION_LENGTH = 2000;
    public static final int MIN_MISSION_LENGTH = 20;
    public static final int MAX_MISSION_LENGTH = 1000;
    public static final int MAX_VISION_LENGTH = 1000;
    public static final int MIN_REASON_LENGTH = 10;
    public static final int MAX_REASON_LENGTH = 500;
    
    // Numeric Limits
    public static final double MIN_LATITUDE = -90.0;
    public static final double MAX_LATITUDE = 90.0;
    public static final double MIN_LONGITUDE = -180.0;
    public static final double MAX_LONGITUDE = 180.0;
    public static final double MIN_RATING = 0.0;
    public static final double MAX_RATING = 5.0;
    
    private ValidationConstants() {
        // Private constructor to prevent instantiation
    }
} 