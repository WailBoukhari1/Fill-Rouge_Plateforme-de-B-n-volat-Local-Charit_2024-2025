package com.youcode.volunteering.model;

import lombok.Data;

@Data
public class NotificationSettings {
    private boolean email;
    private boolean push;
    private boolean sms;
    private boolean opportunities;
    private boolean messages;
    private boolean updates;
} 