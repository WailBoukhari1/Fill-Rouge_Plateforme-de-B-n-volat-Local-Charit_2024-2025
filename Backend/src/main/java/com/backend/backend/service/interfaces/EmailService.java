package com.backend.backend.service.interfaces;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface EmailService {
    // Authentication Emails
    CompletableFuture<Void> sendVerificationEmail(String to, String token);
    CompletableFuture<Void> sendPasswordResetEmail(String to, String token);
    
    // Event Related Emails
    CompletableFuture<Void> sendEventConfirmation(String to, String eventTitle, String eventDate);
    CompletableFuture<Void> sendEventReminder(String to, String eventTitle, String eventDate);
    CompletableFuture<Void> sendEventCancellation(String to, String eventTitle);
    CompletableFuture<Void> sendEventUpdate(String to, String eventTitle, Map<String, String> changes);
    
    // Volunteership Emails
    CompletableFuture<Void> sendVolunteershipApproval(String to, String organizationName);
    CompletableFuture<Void> sendVolunteershipRejection(String to, String organizationName, String reason);
    
    // Generic Email
    CompletableFuture<Void> sendEmail(String to, String subject, String content);
} 