package com.backend.backend.service.impl;

import com.backend.backend.dto.request.OrganizationRequest;
import com.backend.backend.dto.response.EventResponse;
import com.backend.backend.dto.response.OrganizationResponse;
import com.backend.backend.exception.CustomException;
import com.backend.backend.mapper.EventMapper;
import com.backend.backend.mapper.OrganizationMapper;
import com.backend.backend.model.Event;
import com.backend.backend.model.Organization;
import com.backend.backend.model.User;
import com.backend.backend.model.UserRole;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.OrganizationRepository;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.interfaces.EmailService;
import com.backend.backend.service.interfaces.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final OrganizationMapper organizationMapper;
    private final EventMapper eventMapper;
    private final EmailService emailService;

    @Override
    public OrganizationResponse createOrganization(OrganizationRequest request, String userId) {
        // Validate user exists and doesn't already have an organization
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (organizationRepository.existsByUserId(userId)) {
            throw new CustomException("User already has an organization", HttpStatus.BAD_REQUEST);
        }

        // Create and save organization
        Organization organization = organizationMapper.toEntity(request);
        organization.setUserId(userId);
        organization.setVerified(false);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        // Update user role
        user.setRole(UserRole.ORGANIZATION);
        userRepository.save(user);

        Organization savedOrganization = organizationRepository.save(organization);
        log.info("Created new organization with ID: {} for user: {}", savedOrganization.getId(), userId);

        return organizationMapper.toResponse(savedOrganization);
    }

    @Override
    public OrganizationResponse getOrganization(String id) {
        return organizationMapper.toResponse(findOrganizationById(id));
    }

    @Override
    public Page<OrganizationResponse> getAllOrganizations(Pageable pageable) {
        return organizationRepository.findAll(pageable)
                .map(organizationMapper::toResponse);
    }

    @Override
    public OrganizationResponse updateOrganization(String id, OrganizationRequest request) {
        Organization organization = findOrganizationById(id);
        Organization oldOrganization = new Organization();
        organizationMapper.updateOrganizationFromRequest(request, oldOrganization);

        organizationMapper.updateOrganizationFromRequest(request, organization);
        organization.setUpdatedAt(LocalDateTime.now());

        Organization updatedOrganization = organizationRepository.save(organization);
        log.info("Updated organization with ID: {}", id);

        // Notify if significant changes
        notifyOfChanges(oldOrganization, updatedOrganization);

        return organizationMapper.toResponse(updatedOrganization);
    }

    @Override
    public void deleteOrganization(String id) {
        Organization organization = findOrganizationById(id);

        // Check for active events
        List<Event> activeEvents = eventRepository.findByOrganizationId(id).stream()
                .filter(Event::isActive)
                .collect(Collectors.toList());

        if (!activeEvents.isEmpty()) {
            throw new CustomException(
                "Cannot delete organization with active events. Please cancel all events first.",
                HttpStatus.BAD_REQUEST
            );
        }

        // Update user role back to volunteer
        User user = userRepository.findById(organization.getUserId())
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        user.setRole(UserRole.VOLUNTEER);
        userRepository.save(user);

        // Delete organization
        organizationRepository.delete(organization);
        log.info("Deleted organization with ID: {}", id);
    }

    @Override
    public OrganizationResponse verifyOrganization(String id) {
        Organization organization = findOrganizationById(id);
        
        if (organization.isVerified()) {
            throw new CustomException("Organization is already verified", HttpStatus.BAD_REQUEST);
        }

        organization.setVerified(true);
        organization.setUpdatedAt(LocalDateTime.now());
        Organization verifiedOrganization = organizationRepository.save(organization);

        // Notify organization of verification
        User user = userRepository.findById(organization.getUserId())
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        emailService.sendVolunteershipApproval(user.getEmail(), organization.getName());

        log.info("Verified organization with ID: {}", id);
        return organizationMapper.toResponse(verifiedOrganization);
    }

    @Override
    public List<EventResponse> getOrganizationEvents(String id) {
        findOrganizationById(id); // Verify organization exists
        return eventRepository.findByOrganizationId(id).stream()
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<OrganizationResponse> searchOrganizations(String query, Pageable pageable) {
        return organizationRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(organizationMapper::toResponse);
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
                .orElseThrow(() -> new CustomException("Organization not found", HttpStatus.NOT_FOUND));
    }

    private void notifyOfChanges(Organization oldOrg, Organization newOrg) {
        Map<String, String> changes = organizationMapper.detectChanges(oldOrg, newOrg);
        if (!changes.isEmpty()) {
            User user = userRepository.findById(newOrg.getUserId())
                    .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
            try {
                emailService.sendEventUpdate(
                    user.getEmail(),
                    "Organization Update",
                    changes
                );
            } catch (Exception e) {
                log.error("Failed to send organization update notification to user {}: {}", 
                    user.getId(), e.getMessage());
            }
        }
    }
} 