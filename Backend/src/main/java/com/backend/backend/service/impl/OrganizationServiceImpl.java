package com.backend.backend.service.impl;

import com.backend.backend.domain.Event;
import com.backend.backend.domain.model.Organization;
import com.backend.backend.domain.model.User;
import com.backend.backend.domain.model.UserRole;
import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.OrganizationResponse;
import com.backend.backend.dto.EventResponse;
import com.backend.backend.exception.ResourceNotFoundException;
import com.backend.backend.exception.ValidationException;
import com.backend.backend.repository.OrganizationRepository;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.service.interfaces.OrganizationService;
import com.backend.backend.mapper.OrganizationMapper;
import com.backend.backend.mapper.EventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final OrganizationMapper organizationMapper;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public OrganizationResponse createOrganization(OrganizationRequest request, String userId) {
        Organization organization = organizationMapper.toEntity(request);
        organization.setUserId(userId);
        organization.setVerified(false);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(UserRole.ORGANIZATION);
        userRepository.save(user);

        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    public OrganizationResponse getOrganization(String id) {
        return organizationMapper.toResponse(findOrganizationById(id));
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(String id, OrganizationRequest request) {
        Organization organization = findOrganizationById(id);
        organizationMapper.updateOrganizationFromRequest(request, organization);
        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    @Transactional
    public void deleteOrganization(String id) {
        Organization organization = findOrganizationById(id);
        if (!eventRepository.findByOrganizationId(id).isEmpty()) {
            throw new ValidationException("Cannot delete organization with active events");
        }
        organizationRepository.delete(organization);
        
        User user = userRepository.findById(organization.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(UserRole.VOLUNTEER);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public OrganizationResponse verifyOrganization(String id) {
        Organization organization = findOrganizationById(id);
        organization.setVerified(true);
        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    public List<EventResponse> getOrganizationEvents(String id) {
        findOrganizationById(id); // Verify organization exists
        return eventRepository.findByOrganizationId(id).stream()
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> searchOrganizations(String query) {
        return organizationRepository.findByNameContainingIgnoreCase(query).stream()
                .map(organizationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isOrganizationVerified(String id) {
        return findOrganizationById(id).isVerified();
    }

    @Override
    public int getActiveVolunteersCount(String id) {
        List<String> eventIds = eventRepository.findByOrganizationId(id)
            .stream()
            .map(Event::getId)
            .collect(Collectors.toList());
        return eventRegistrationRepository.countDistinctVolunteersByOrganizationId(eventIds);
    }

    @Override
    public int getTotalEventsCount(String id) {
        return eventRepository.countByOrganizationId(id);
    }

    private Organization findOrganizationById(String id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
    }
} 