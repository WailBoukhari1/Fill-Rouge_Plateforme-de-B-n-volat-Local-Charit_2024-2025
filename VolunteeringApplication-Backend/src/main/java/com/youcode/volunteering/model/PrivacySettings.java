package com.youcode.volunteering.model;

import lombok.Data;

@Data
public class PrivacySettings {
    private boolean profilePublic;
    private boolean showEmail;
    private boolean showPhone;
    private boolean showLocation;
    private boolean showVolunteeringHistory;
} 