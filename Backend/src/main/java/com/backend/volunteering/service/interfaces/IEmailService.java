package com.backend.volunteering.service.interfaces;

import java.util.Map;

public interface IEmailService {
    void sendSimpleEmail(String to, String subject, String content);
    void sendTemplateEmail(String to, String subject, String template, Map<String, Object> variables);
    void sendVerificationEmail(String email, String name, String verificationUrl);
    void sendPasswordResetEmail(String email, String token);
    void sendOpportunityApplicationEmail(String to, String opportunityTitle, String organizationName);
    void sendApplicationStatusUpdateEmail(String to, String opportunityTitle, String status);
    void send2FACode(String to, String code);
} 