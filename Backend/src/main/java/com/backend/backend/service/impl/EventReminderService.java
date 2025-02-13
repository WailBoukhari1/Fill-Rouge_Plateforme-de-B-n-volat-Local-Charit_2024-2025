package com.backend.backend.service.impl;

import com.backend.backend.model.Event;
import com.backend.backend.model.EventRegistration;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.service.interfaces.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventReminderService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *") // Run at 8 AM every day
    public void sendEventReminders() {
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        List<Event> upcomingEvents = eventRepository.findByStartDateBetween(
            tomorrow.withHour(0).withMinute(0),
            tomorrow.withHour(23).withMinute(59)
        );

        for (Event event : upcomingEvents) {
            List<EventRegistration> registrations = registrationRepository
                .findByEventId(event.getId());
            
            for (EventRegistration registration : registrations) {
                emailService.sendEmail(
                    registration.getVolunteerId(),
                    event.getTitle(),
                    event.getStartDate().toString()
                );
            }
        }
    }
} 