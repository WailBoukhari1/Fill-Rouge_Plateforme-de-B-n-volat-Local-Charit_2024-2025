package com.backend.volunteering.service.impl;

import com.backend.volunteering.service.interfaces.IEmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    @Override
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendTemplateEmail(String to, String subject, String template, Map<String, Object> variables) {
        // Simple string replacement instead of using Thymeleaf
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            template = template.replace("${" + entry.getKey() + "}", entry.getValue().toString());
        }
        sendSimpleEmail(to, subject, template);
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String content = String.format(
            "Please verify your email by clicking this link: <a href='%s'>Verify Email</a>",
            verificationUrl
        );
        sendSimpleEmail(to, "Verify Your Email", content);
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String content = String.format(
            "Reset your password by clicking this link: <a href='%s'>Reset Password</a>",
            resetUrl
        );
        sendSimpleEmail(to, "Reset Your Password", content);
    }

    @Override
    public void sendOpportunityApplicationEmail(String to, String opportunityTitle, String organizationName) {
        String content = String.format(
            "Your application for %s at %s has been received.",
            opportunityTitle,
            organizationName
        );
        sendSimpleEmail(to, "Application Received", content);
    }

    @Override
    public void sendApplicationStatusUpdateEmail(String to, String opportunityTitle, String status) {
        String content = String.format(
            "Your application status for %s has been updated to: %s",
            opportunityTitle,
            status
        );
        sendSimpleEmail(to, "Application Status Update", content);
    }

    @Override
    public void send2FACode(String to, String code) {
        // Implementation to send 2FA code via email
        String subject = "Your Two-Factor Authentication Code";
        String content = String.format("Your verification code is: %s\nThis code will expire in 5 minutes.", code);
        sendSimpleEmail(to, subject, content);
    }
} 