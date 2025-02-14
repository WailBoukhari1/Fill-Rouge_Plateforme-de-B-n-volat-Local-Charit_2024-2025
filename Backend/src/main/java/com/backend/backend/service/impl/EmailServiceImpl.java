package com.backend.backend.service.impl;

import com.backend.backend.exception.CustomException;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.util.EmailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender mailSender;
    private final EmailTemplates emailTemplates;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Override
    @Async
    public CompletableFuture<Void> sendVerificationEmail(String to, String token) {
        log.info("Starting to send verification email to: {}", to);
        String subject = "Verify Your Email Address";
        String content = emailTemplates.buildVerificationEmail(token);
        log.debug("Verification code: {}", token);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendPasswordResetEmail(String to, String token) {
        String subject = "Reset Your Password";
        String content = emailTemplates.buildPasswordResetEmail(token);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendEventConfirmation(String to, String eventTitle, String eventDate) {
        String subject = "Event Registration Confirmation";
        String content = emailTemplates.buildEventConfirmationEmail(eventTitle, eventDate);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendEventReminder(String to, String eventTitle, String eventDate) {
        String subject = "Upcoming Event Reminder";
        String content = emailTemplates.buildEventReminderEmail(eventTitle, eventDate);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendEventCancellation(String to, String eventTitle) {
        String subject = "Event Cancellation Notice";
        String content = emailTemplates.buildEventCancellationEmail(eventTitle);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendEventUpdate(String to, String eventTitle, Map<String, String> changes) {
        String subject = "Event Update Notification";
        String content = emailTemplates.buildEventUpdateEmail(eventTitle, changes);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendVolunteershipApproval(String to, String organizationName) {
        String subject = "Volunteership Application Approved";
        String content = emailTemplates.buildVolunteershipApprovalEmail(organizationName);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendVolunteershipRejection(String to, String organizationName, String reason) {
        String subject = "Volunteership Application Status";
        String content = emailTemplates.buildVolunteershipRejectionEmail(organizationName, reason);
        return sendHtmlEmail(to, subject, content);
    }

    @Override
    @Async
    public CompletableFuture<Void> sendEmail(String to, String subject, String content) {
        return sendSimpleEmail(to, subject, content);
    }

    private CompletableFuture<Void> sendHtmlEmail(String to, String subject, String htmlContent) {
        return CompletableFuture.runAsync(() -> {
            if (!emailEnabled) {
                log.info("Email sending is disabled. Would have sent email to: {} with subject: {}", to, subject);
                return;
            }

            try {
                log.debug("Creating MimeMessage...");
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                log.debug("Setting email parameters - From: {}, To: {}", fromEmail, to);
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                
                log.info("Attempting to send email...");
                mailSender.send(message);
                log.info("Successfully sent HTML email to: {} with subject: {}", to, subject);
            } catch (MessagingException | MailException e) {
                log.error("Failed to send HTML email to: {} with subject: {}. Error: {}", to, subject, e.getMessage(), e);
                throw new CustomException("Failed to send email: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }

    private CompletableFuture<Void> sendSimpleEmail(String to, String subject, String content) {
        return CompletableFuture.runAsync(() -> {
            if (!emailEnabled) {
                log.info("Email sending is disabled. Would have sent email to: {} with subject: {}", to, subject);
                return;
            }

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                log.info("Successfully sent simple email to: {} with subject: {}", to, subject);
            } catch (MailException e) {
                log.error("Failed to send simple email to: {} with subject: {}", to, subject, e);
                throw new CustomException("Failed to send email: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATE_FORMATTER);
    }
} 