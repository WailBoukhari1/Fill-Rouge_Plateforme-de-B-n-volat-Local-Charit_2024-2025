package com.backend.backend.config;

import com.backend.backend.service.interfaces.AuthService;
import com.backend.backend.service.impl.EventReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class SchedulingConfig {

    private final AuthService authService;
    private final EventReminderService eventReminderService;

    @Scheduled(cron = "0 0 0 * * *") 
    public void cleanupExpiredTokens() {
        authService.cleanupExpiredTokens();
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendEventReminders() {
        eventReminderService.sendEventReminders();
    }
} 