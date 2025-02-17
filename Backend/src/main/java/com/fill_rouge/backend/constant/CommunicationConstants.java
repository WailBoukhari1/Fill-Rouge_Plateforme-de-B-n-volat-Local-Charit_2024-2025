package com.fill_rouge.backend.constant;

/**
 * Constants for communication-related functionality.
 */
public final class CommunicationConstants {
    // WebSocket destinations
    public static final String WEBSOCKET_ENDPOINT = "/ws";
    public static final String MESSAGE_QUEUE = "/queue/messages";
    public static final String NOTIFICATION_QUEUE = "/queue/notifications";
    public static final String TOPIC_PREFIX = "/topic";
    public static final String QUEUE_PREFIX = "/queue";
    public static final String APP_PREFIX = "/app";
    public static final String USER_PREFIX = "/user";
    
    // System sender
    public static final String SYSTEM_SENDER = "SYSTEM";
    
    // Message templates
    public static final String EVENT_CANCELLED_TEMPLATE = "The event '%s' has been cancelled.";
    public static final String EVENT_REMINDER_TEMPLATE = "Reminder: The event '%s' is coming up soon.";
    public static final String ORGANIZATION_UPDATE_TEMPLATE = "The organization '%s' has been updated: %s";
    public static final String ACHIEVEMENT_EARNED_TEMPLATE = "Congratulations! You've earned the %s badge!";
    public static final String MILESTONE_REACHED_TEMPLATE = "Congratulations! You've reached the %s milestone!";
    
    // Notification titles
    public static final String EVENT_CANCELLED_TITLE = "Event Cancelled";
    public static final String EVENT_REMINDER_TITLE = "Event Reminder";
    public static final String ORGANIZATION_UPDATE_TITLE = "Organization Update";
    public static final String ACHIEVEMENT_EARNED_TITLE = "Achievement Earned!";
    public static final String MILESTONE_REACHED_TITLE = "Milestone Reached!";
    
    // Cleanup settings
    public static final int DEFAULT_CLEANUP_DAYS = 30;
    
    private CommunicationConstants() {
        // Private constructor to prevent instantiation
    }
} 