package com.fill_rouge.backend.service.event.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to handle scheduled tasks for event status management
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EventSchedulerService {
    private static final Logger log = LoggerFactory.getLogger(EventSchedulerService.class);
    
    private final EventServiceImpl eventService;
    
    /**
     * Automatically updates event statuses based on time and conditions
     * Runs every 15 minutes
     */
    @Scheduled(fixedRate = 900000) // Every 15 minutes (in milliseconds)
    public void scheduleEventStatusUpdates() {
        log.info("Running scheduled event status update");
        try {
            eventService.updateEventStatuses();
        } catch (Exception e) {
            log.error("Error updating event statuses: {}", e.getMessage(), e);
        }
    }
} 