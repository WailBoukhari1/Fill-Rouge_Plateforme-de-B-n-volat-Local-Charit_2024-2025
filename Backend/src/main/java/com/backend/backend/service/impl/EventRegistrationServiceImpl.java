package com.backend.backend.service.impl;

import com.backend.backend.domain.model.EventRegistration;
import com.backend.backend.domain.model.RegistrationStatus;
import com.backend.backend.dto.response.EventRegistrationResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.service.interfaces.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;

    @Override
    @Transactional
    public EventRegistrationResponse registerForEvent(String eventId, String volunteerId) {
        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setVolunteerId(volunteerId);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.PENDING);

        EventRegistration savedRegistration = registrationRepository.save(registration);
        return mapToResponse(savedRegistration);
    }

    @Override
    @Transactional
    public void cancelRegistration(String eventId, String volunteerId) {
        EventRegistration registration = registrationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
                .orElseThrow(() -> new CustomException("Registration not found", HttpStatus.NOT_FOUND));
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    @Override
    public List<EventRegistrationResponse> getRegistrationsByEvent(String eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventRegistrationResponse> getRegistrationsByVolunteer(String volunteerId) {
        return registrationRepository.findByVolunteerId(volunteerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EventRegistrationResponse mapToResponse(EventRegistration registration) {
        return EventRegistrationResponse.builder()
                .id(registration.getId())
                .eventId(registration.getEventId())
                .volunteerId(registration.getVolunteerId())
                .registrationDate(registration.getRegistrationDate())
                .status(registration.getStatus())
                .build();
    }
} 