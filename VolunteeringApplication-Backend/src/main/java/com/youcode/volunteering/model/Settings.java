package com.youcode.volunteering.model;

import lombok.Data;

@Data
public class Settings {
    private NotificationSettings notifications;
    private PrivacySettings privacy;
    private boolean allowVolunteerApplications;
    private boolean requireApproval;
    private boolean showMetrics;
} 