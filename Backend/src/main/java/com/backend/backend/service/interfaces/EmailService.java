package com.backend.backend.service.interfaces;

public interface EmailService {
    void sendEventConfirmation(String to, String eventTitle, String eventDate);
    void sendEventReminder(String to, String eventTitle, String eventDate);
    void sendEventCancellation(String to, String eventTitle);
    void sendVerificationEmail(String to, String token);
    void sendPasswordResetEmail(String to, String token);
    void sendEmail(String to, String subject, String content);
} 