package com.backend.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class EmailTemplates {
    
    @Value("${app.frontend-url}")
    private String frontendUrl;

    public String buildVerificationEmail(String token) {
        return String.format("""
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering! Please verify your email address by entering the following code:</p>
            <h3 style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px;">%s</h3>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            """, token);
    }

    public String buildPasswordResetEmail(String token) {
        return String.format("""
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Enter the following code to proceed:</p>
            <h3 style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px;">%s</h3>
            <p>This code will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            """, token);
    }

    public String buildEventConfirmationEmail(String eventTitle, String eventDate) {
        return String.format("""
            <h2>Event Registration Confirmed</h2>
            <p>You have successfully registered for the following event:</p>
            <h3>%s</h3>
            <p>Date and Time: %s</p>
            <p>We look forward to seeing you there!</p>
            <p>You can view the event details and manage your registration in your dashboard.</p>
            """, eventTitle, eventDate);
    }

    public String buildEventReminderEmail(String eventTitle, String eventDate) {
        return String.format("""
            <h2>Event Reminder</h2>
            <p>This is a reminder about your upcoming event:</p>
            <h3>%s</h3>
            <p>Date and Time: %s</p>
            <p>We look forward to seeing you there!</p>
            <p>If you can no longer attend, please update your registration status in your dashboard.</p>
            """, eventTitle, eventDate);
    }

    public String buildEventCancellationEmail(String eventTitle) {
        return String.format("""
            <h2>Event Cancellation Notice</h2>
            <p>Unfortunately, the following event has been cancelled:</p>
            <h3>%s</h3>
            <p>We apologize for any inconvenience this may cause.</p>
            <p>Please check your dashboard for other available volunteer opportunities.</p>
            """, eventTitle);
    }

    public String buildEventUpdateEmail(String eventTitle, Map<String, String> changes) {
        String changesList = changes.entrySet().stream()
            .map(entry -> String.format("<li><strong>%s:</strong> %s</li>", entry.getKey(), entry.getValue()))
            .collect(Collectors.joining("\n"));

        return String.format("""
            <h2>Event Update Notice</h2>
            <p>There have been updates to the following event:</p>
            <h3>%s</h3>
            <p>The following changes have been made:</p>
            <ul>
            %s
            </ul>
            <p>Please review these changes and update your plans accordingly.</p>
            """, eventTitle, changesList);
    }

    public String buildVolunteershipApprovalEmail(String organizationName) {
        return String.format("""
            <h2>Volunteership Application Approved</h2>
            <p>Congratulations! Your application to volunteer with <strong>%s</strong> has been approved.</p>
            <p>You can now:</p>
            <ul>
                <li>View and register for the organization's events</li>
                <li>Receive notifications about new volunteer opportunities</li>
                <li>Track your volunteer hours</li>
            </ul>
            <p>Visit your dashboard to get started!</p>
            """, organizationName);
    }

    public String buildVolunteershipRejectionEmail(String organizationName, String reason) {
        return String.format("""
            <h2>Volunteership Application Status</h2>
            <p>Thank you for your interest in volunteering with <strong>%s</strong>.</p>
            <p>After careful consideration, we regret to inform you that your application was not approved at this time.</p>
            <p>Reason provided: %s</p>
            <p>We encourage you to:</p>
            <ul>
                <li>Review other volunteer opportunities</li>
                <li>Update your profile with additional skills and experience</li>
                <li>Apply to other organizations that match your interests</li>
            </ul>
            """, organizationName, reason);
    }
} 