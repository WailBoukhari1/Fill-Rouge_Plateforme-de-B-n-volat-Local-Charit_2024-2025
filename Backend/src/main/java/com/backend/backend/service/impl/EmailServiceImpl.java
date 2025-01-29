package com.backend.backend.service.impl;

import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.util.EmailTemplates;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender mailSender;
    private final EmailTemplates emailTemplates;

    @Override
    @Async
    public void sendVerificationEmail(String to, String token) {
        sendHtmlEmail(to, "Verify Your Email", emailTemplates.buildVerificationEmail(token));
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        sendHtmlEmail(to, "Reset Your Password", emailTemplates.buildPasswordResetEmail(token));
    }

    @Override
    @Async
    public void sendEventConfirmation(String to, String eventTitle, String eventDate) {
        sendSimpleEmail(to, "Event Registration Confirmation", 
            String.format("You have successfully registered for %s on %s", eventTitle, eventDate));
    }

    @Override
    @Async
    public void sendEventReminder(String to, String eventTitle, String eventDate) {
        sendSimpleEmail(to, "Event Reminder", 
            String.format("Reminder: %s is scheduled for %s", eventTitle, eventDate));
    }

    @Override
    @Async
    public void sendEventCancellation(String to, String eventTitle) {
        sendSimpleEmail(to, "Event Cancellation", 
            String.format("The event %s has been cancelled", eventTitle));
    }

    @Override
    @Async
    public void sendEmail(String to, String subject, String content) {
        sendSimpleEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private void sendSimpleEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
} 