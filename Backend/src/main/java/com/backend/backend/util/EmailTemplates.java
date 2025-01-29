package com.backend.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplates {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final String EMAIL_TEMPLATE = """
        <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #2c3e50;">%s</h2>
            <p>Hello,</p>
            <p>%s</p>
            <div style="background: #f8f9fa; padding: 15px; margin: 20px 0; text-align: center;">
                <h1 style="color: #2c3e50; letter-spacing: 5px; margin: 0;">%s</h1>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9em;">%s</p>
        </div>
        """;

    public String buildVerificationEmail(String code) {
        return String.format(EMAIL_TEMPLATE,
            "Email Verification",
            "Your verification code is:",
            code,
            "This code will expire in 24 hours. If you didn't create an account, please ignore this email."
        );
    }

    public String buildPasswordResetEmail(String code) {
        return String.format(EMAIL_TEMPLATE,
            "Password Reset Code",
            "You requested to reset your password. Use this code to create a new password:",
            code,
            "This code will expire in 1 hour. If you didn't request this, please ignore."
        );
    }
} 