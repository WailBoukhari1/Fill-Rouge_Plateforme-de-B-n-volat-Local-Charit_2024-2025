package com.backend.backend.service.impl;

import com.backend.backend.domain.model.Event;
import com.backend.backend.domain.model.EventRegistration;
import com.backend.backend.domain.model.User;
import com.backend.backend.domain.model.Volunteer;
import com.backend.backend.dto.request.VolunteerProfileRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.VolunteerProfileResponse;
import com.backend.backend.exception.ResourceNotFoundException;
import com.backend.backend.exception.ValidationException;
import com.backend.backend.mapper.EventMapper;
import com.backend.backend.mapper.VolunteerMapper;
import com.backend.backend.repository.*;
import com.backend.backend.service.interfaces.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final VolunteerMapper volunteerMapper;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public VolunteerProfileResponse createProfile(String email, VolunteerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (volunteerRepository.existsByUserId(user.getId())) {
            throw new ValidationException("Profile already exists");
        }

        Volunteer volunteer = volunteerMapper.toEntity(request);
        volunteer.setEmail(email);
        volunteer.setUserId(user.getId());
        
        return volunteerMapper.toResponse(volunteerRepository.save(volunteer));
    }

    @Override
    @Transactional
    public VolunteerProfileResponse updateProfile(String email, VolunteerProfileRequest request) {
        Volunteer volunteer = getVolunteerByEmail(email);
        volunteerMapper.updateVolunteerFromRequest(request, volunteer);
        return volunteerMapper.toResponse(volunteerRepository.save(volunteer));
    }

    @Override
    public VolunteerProfileResponse getProfile(String email) {
        return volunteerMapper.toResponse(getVolunteerByEmail(email));
    }

    @Override
    @Transactional
    public void deleteProfile(String email) {
        Volunteer volunteer = getVolunteerByEmail(email);
        volunteerRepository.delete(volunteer);
    }

    @Override
    public List<VolunteerProfileResponse> findVolunteersBySkill(String skill) {
        return volunteerRepository.findBySkillsContaining(skill).stream()
                .map(volunteerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VolunteerProfileResponse> findVolunteersByLocation(String location) {
        return volunteerRepository.findByLocationContainingIgnoreCase(location).stream()
                .map(volunteerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void registerForEvent(String email, String eventId) {
        Volunteer volunteer = getVolunteerByEmail(email);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (eventRegistrationRepository.existsByVolunteerIdAndEventId(volunteer.getId(), eventId)) {
            throw new ValidationException("Already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setVolunteerId(volunteer.getId());
        registration.setRegistrationDate(LocalDateTime.now());
        
        eventRegistrationRepository.save(registration);
    }

    @Override
    public List<EventResponse> getRegisteredEvents(String email) {
        Volunteer volunteer = getVolunteerByEmail(email);
        return eventRegistrationRepository.findByVolunteerId(volunteer.getId()).stream()
                .map(reg -> eventRepository.findById(reg.getEventId())
                        .orElseThrow(() -> new ResourceNotFoundException("Event not found")))
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelEventRegistration(String email, String eventId) {
        Volunteer volunteer = getVolunteerByEmail(email);
        EventRegistration registration = eventRegistrationRepository
                .findByEventIdAndVolunteerId(eventId, volunteer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event registration not found"));
        
        eventRegistrationRepository.delete(registration);
    }

    @Override
    public List<EventResponse> getCompletedEvents(String email) {
        Volunteer volunteer = getVolunteerByEmail(email);
        return volunteer.getCompletedEvents().stream()
                .map(eventId -> eventRepository.findById(eventId)
                        .orElseThrow(() -> new ResourceNotFoundException("Event not found")))
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addCompletedEvent(String email, String eventId) {
        Volunteer volunteer = getVolunteerByEmail(email);
        volunteer.getCompletedEvents().add(eventId);
        volunteerRepository.save(volunteer);
    }

    @Override
    @Transactional
    public void updateHoursContributed(String email, int hours) {
        Volunteer volunteer = getVolunteerByEmail(email);
        volunteer.setHoursContributed(volunteer.getHoursContributed() + hours);
        volunteerRepository.save(volunteer);
    }

    @Override
    public int getTotalVolunteeringHours(String email) {
        Volunteer volunteer = getVolunteerByEmail(email);
        return volunteer.getHoursContributed();
    }

    @Override
    public boolean isAvailableForEvent(String email, String eventId) {
        Volunteer volunteer = getVolunteerByEmail(email);
        return volunteer.isAvailable() && 
               !eventRegistrationRepository.existsByVolunteerIdAndEventId(volunteer.getId(), eventId);
    }

    private Volunteer getVolunteerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return volunteerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found"));
    }
} 