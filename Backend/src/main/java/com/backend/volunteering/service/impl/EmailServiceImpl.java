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
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import java.io.UnsupportedEncodingException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender emailSender;
    private final Configuration freeMarkerConfig;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${spring.mail.personal}")
    private String personalName;

    @Value("${app.frontend-base-url}")
    private String frontendUrl;

    @Async
    @Override
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, personalName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        try {
            Template template = freeMarkerConfig.getTemplate("/email/verification-email.html");
            Map<String, Object> model = new HashMap<>();
            model.put("userName", to.split("@")[0]); // Using email prefix as username
            model.put("verificationLink", frontendUrl + "/verify-email?token=" + token);

            String html = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
            sendSimpleEmail(to, "Verify Your Email", html);
        } catch (Exception e) {
            log.error("Error sending verification email: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending verification email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        try {
            Template template = freeMarkerConfig.getTemplate("/email/reset-password.html");
            Map<String, Object> model = new HashMap<>();
            model.put("userName", to.split("@")[0]); // Using email prefix as username
            model.put("resetLink", frontendUrl + "/reset-password?token=" + token);

            String html = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
            sendSimpleEmail(to, "Reset Your Password", html);
        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending password reset email", e);
        }
    }

    @Override
    public void sendOpportunityApplicationEmail(String to, String opportunityTitle, String organizationName) {
        try {
            String content = String.format("""
                <div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #4CAF50;'>Application Received</h2>
                    <p>Your application for <strong>%s</strong> at <strong>%s</strong> has been received.</p>
                    <p>We will review your application and get back to you soon.</p>
                    <p>Thank you for your interest!</p>
                </div>
                """, 
                opportunityTitle, 
                organizationName
            );
            sendSimpleEmail(to, "Application Received", content);
        } catch (Exception e) {
            log.error("Error sending application email: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending application email", e);
        }
    }

    @Override
    public void sendApplicationStatusUpdateEmail(String to, String opportunityTitle, String status) {
        try {
            String content = String.format("""
                <div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #2196F3;'>Application Status Update</h2>
                    <p>Your application status for <strong>%s</strong> has been updated to: <strong>%s</strong></p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                </div>
                """, 
                opportunityTitle, 
                status
            );
            sendSimpleEmail(to, "Application Status Update", content);
        } catch (Exception e) {
            log.error("Error sending status update email: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending status update email", e);
        }
    }

    @Override
    public void send2FACode(String to, String code) {
        try {
            String content = String.format("""
                <div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #FF9800;'>Two-Factor Authentication Code</h2>
                    <p>Your verification code is: <strong style='font-size: 24px;'>%s</strong></p>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
                """, 
                code
            );
            sendSimpleEmail(to, "Your Two-Factor Authentication Code", content);
        } catch (Exception e) {
            log.error("Error sending 2FA code: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending 2FA code", e);
        }
    }

    @Override
    public void sendTemplateEmail(String to, String subject, String templatePath, Map<String, Object> model) {
        try {
            Template template = freeMarkerConfig.getTemplate(templatePath);
            String html = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
            sendSimpleEmail(to, subject, html);
        } catch (Exception e) {
            log.error("Error sending template email: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending template email", e);
        }
    }
} 