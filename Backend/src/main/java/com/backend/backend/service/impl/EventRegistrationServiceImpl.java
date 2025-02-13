package com.backend.backend.service.impl;

import com.backend.backend.dto.response.EventRegistrationResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.model.Event;
import com.backend.backend.model.EventRegistration;
import com.backend.backend.model.RegistrationStatus;
import com.backend.backend.model.User;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.service.interfaces.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Override
    @Transactional
    public EventRegistrationResponse registerForEvent(String eventId, String volunteerId) {
        // Validate event and volunteer
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));

        // Check if registration already exists
        if (registrationRepository.existsByEventIdAndVolunteerId(eventId, volunteerId)) {
            throw new CustomException("Already registered for this event", HttpStatus.BAD_REQUEST);
        }

        // Validate event registration conditions
        validateEventRegistration(event);

        // Create and save registration
        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setVolunteerId(volunteerId);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setLastUpdated(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.PENDING);

        EventRegistration savedRegistration = registrationRepository.save(registration);

        // Send confirmation email
        sendRegistrationConfirmationEmail(volunteer.getEmail(), event);

        return mapToDetailedResponse(savedRegistration, event, volunteer);
    }

    @Override
    @Transactional
    public EventRegistrationResponse updateRegistrationStatus(String registrationId, RegistrationStatus newStatus) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new CustomException("Registration not found", HttpStatus.NOT_FOUND));
        
        Event event = eventRepository.findById(registration.getEventId())
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        User volunteer = userRepository.findById(registration.getVolunteerId())
                .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));

        registration.setStatus(newStatus);
        registration.setLastUpdated(LocalDateTime.now());
        
        EventRegistration updatedRegistration = registrationRepository.save(registration);

        // Send status update email
        sendStatusUpdateEmail(volunteer.getEmail(), event, newStatus);

        return mapToDetailedResponse(updatedRegistration, event, volunteer);
    }

    @Override
    @Transactional
    public void cancelRegistration(String eventId, String volunteerId) {
        EventRegistration registration = registrationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
                .orElseThrow(() -> new CustomException("Registration not found", HttpStatus.NOT_FOUND));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setLastUpdated(LocalDateTime.now());
        registrationRepository.save(registration);

        // Send cancellation email
        emailService.sendEventCancellation(volunteer.getEmail(), event.getTitle());
    }

    @Override
    public Page<EventRegistrationResponse> getRegistrationsByEvent(String eventId, Pageable pageable) {
        return registrationRepository.findByEventId(eventId, pageable)
                .map(registration -> {
                    Event event = eventRepository.findById(registration.getEventId())
                            .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
                    User volunteer = userRepository.findById(registration.getVolunteerId())
                            .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));
                    return mapToDetailedResponse(registration, event, volunteer);
                });
    }

    @Override
    public Page<EventRegistrationResponse> getRegistrationsByVolunteer(String volunteerId, Pageable pageable) {
        return registrationRepository.findByVolunteerId(volunteerId, pageable)
                .map(registration -> {
                    Event event = eventRepository.findById(registration.getEventId())
                            .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
                    User volunteer = userRepository.findById(registration.getVolunteerId())
                            .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));
                    return mapToDetailedResponse(registration, event, volunteer);
                });
    }

    @Override
    public List<EventRegistrationResponse> getActiveRegistrations(String volunteerId) {
        return registrationRepository.findByVolunteerIdAndStatusIn(
                volunteerId, 
                List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
            ).stream()
            .map(registration -> {
                Event event = eventRepository.findById(registration.getEventId())
                        .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
                User volunteer = userRepository.findById(registration.getVolunteerId())
                        .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));
                return mapToDetailedResponse(registration, event, volunteer);
            })
            .collect(Collectors.toList());
    }

    @Override
    public EventRegistrationResponse getRegistration(String eventId, String volunteerId) {
        EventRegistration registration = registrationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
                .orElseThrow(() -> new CustomException("Registration not found", HttpStatus.NOT_FOUND));
        
        Event event = eventRepository.findById(registration.getEventId())
                .orElseThrow(() -> new CustomException("Event not found", HttpStatus.NOT_FOUND));
        User volunteer = userRepository.findById(registration.getVolunteerId())
                .orElseThrow(() -> new CustomException("Volunteer not found", HttpStatus.NOT_FOUND));
        
        return mapToDetailedResponse(registration, event, volunteer);
    }

    @Override
    public boolean isRegistered(String eventId, String volunteerId) {
        return registrationRepository.existsByEventIdAndVolunteerIdAndStatusIn(
            eventId, 
            volunteerId, 
            List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
        );
    }

    @Override
    public long getRegistrationCount(String eventId) {
        return registrationRepository.countByEventIdAndStatusIn(
            eventId,
            List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING)
        );
    }

    private void validateEventRegistration(Event event) {
        LocalDateTime now = LocalDateTime.now();

        if (event.getRegistrationDeadline() != null && now.isAfter(event.getRegistrationDeadline())) {
            throw new CustomException("Registration deadline has passed", HttpStatus.BAD_REQUEST);
        }

        if (event.getMaxParticipants() != null) {
            long currentRegistrations = getRegistrationCount(event.getId());
            if (currentRegistrations >= event.getMaxParticipants()) {
                throw new CustomException("Event has reached maximum capacity", HttpStatus.BAD_REQUEST);
            }
        }

        if (!event.isActive()) {
            throw new CustomException("Event is not active", HttpStatus.BAD_REQUEST);
        }
    }

    private void sendRegistrationConfirmationEmail(String email, Event event) {
        emailService.sendEventConfirmation(
            email,
            event.getTitle(),
            formatDateTime(event.getStartDate())
        );
    }

    private void sendStatusUpdateEmail(String email, Event event, RegistrationStatus status) {
        Map<String, String> changes = Map.of("Status", status.toString());
        emailService.sendEventUpdate(email, event.getTitle(), changes);
    }

    private EventRegistrationResponse mapToDetailedResponse(EventRegistration registration, Event event, User volunteer) {
        return EventRegistrationResponse.builder()
                .id(registration.getId())
                .eventId(registration.getEventId())
                .volunteerId(registration.getVolunteerId())
                .registrationDate(registration.getRegistrationDate())
                .lastUpdated(registration.getLastUpdated())
                .status(registration.getStatus())
                .eventTitle(event.getTitle())
                .volunteerName(volunteer.getFirstName() + " " + volunteer.getLastName())
                .eventDate(event.getStartDate())
                .build();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATE_FORMATTER);
    }
} 