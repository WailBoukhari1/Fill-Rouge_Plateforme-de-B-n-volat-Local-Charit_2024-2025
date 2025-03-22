package com.fill_rouge.backend.service.organization;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.Skill;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.OrganizationRepository;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.service.storage.GridFsService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final GridFsService gridFsService;
    @Override
    public OrganizationResponse createOrganization(String userId, OrganizationRequest request) {
        validateOrganizationRequest(request);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (organizationRepository.existsByName(request.getName())) {
            throw new IllegalStateException("Organization name already exists");
        }

        Organization organization = new Organization();
        updateOrganizationFromRequest(organization, request);
        organization.setUser(user);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());
        organization.setVerified(false);
        organization.setVerificationDate(null);
        organization.setActiveVolunteers(0);
        organization.setTotalEventsHosted(0);
        organization.setImpactScore(0.0);
        organization.setRating(0.0);
        organization.setTotalVolunteerHours(0);
        organization.setNumberOfRatings(0);
        organization.setDocuments(new ArrayList<>());
        organization.setFocusAreas(new HashSet<>(request.getFocusAreas()));
        organization.setProfilePicture(request.getProfilePicture());

        return OrganizationResponse.fromOrganization(organizationRepository.save(organization));
    }

    @Override
    public OrganizationResponse updateOrganization(String organizationId, OrganizationRequest request) {
        validateOrganizationRequest(request);
        Organization organization = getOrganizationEntity(organizationId);
        
        if (!organization.getName().equals(request.getName()) && 
            organizationRepository.existsByName(request.getName())) {
            throw new IllegalStateException("Organization name already exists");
        }

        updateOrganizationFromRequest(organization, request);
        organization.setUpdatedAt(LocalDateTime.now());

        return OrganizationResponse.fromOrganization(organizationRepository.save(organization));
    }

    @Override
    public OrganizationResponse getOrganization(String organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId));
        return OrganizationResponse.fromOrganization(organization);
    }

    @Override
    public OrganizationResponse getOrganizationByUserId(String userId) {
        Organization organization = organizationRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization", "User ID: " + userId));
        return OrganizationResponse.fromOrganization(organization);
    }

    @Override
    public void deleteOrganization(String organizationId) {
        Organization organization = getOrganizationEntity(organizationId);
        
        // Check if organization has any active events
        long activeEvents = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged()).stream()
            .filter(event -> event.getEndDate().isAfter(LocalDateTime.now()))
            .count();
            
        if (activeEvents > 0) {
            throw new IllegalStateException("Cannot delete organization with active events");
        }
        
        organizationRepository.delete(organization);
    }

    @Override
    public List<OrganizationResponse> searchOrganizations(String query) {
        if (!StringUtils.hasText(query)) {
            return organizationRepository.findAll().stream()
                .map(OrganizationResponse::fromOrganization)
                .collect(Collectors.toList());
        }

        return organizationRepository.searchByName(query).stream()
            .distinct()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> findByFocusAreas(List<String> areas) {
        if (areas == null || areas.isEmpty()) {
            return new ArrayList<>();
        }
        
        return organizationRepository.findByFocusAreas(areas).stream()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> findNearbyOrganizations(double latitude, double longitude, double radius) {
        if (radius <= 0) {
            throw new IllegalArgumentException("Radius must be positive");
        }
        
        double[] coordinates = {latitude, longitude};
        return organizationRepository.findNearbyOrganizations(coordinates, radius).stream()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> findByCity(String city) {
        if (!StringUtils.hasText(city)) {
            return new ArrayList<>();
        }
        
        return organizationRepository.findByCity(city).stream()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> findByCountry(String country) {
        if (!StringUtils.hasText(country)) {
            return new ArrayList<>();
        }
        
        return organizationRepository.findByCountry(country).stream()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> findByMinimumRating(double minRating) {
        if (minRating < 0 || minRating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        
        return organizationRepository.findByMinimumRating(minRating).stream()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrganizationResponse> findAcceptingVolunteers() {
        return organizationRepository.findByAcceptingVolunteersTrue().stream()
            .map(OrganizationResponse::fromOrganization)
            .collect(Collectors.toList());
    }

    @Override
    public void verifyOrganization(String organizationId) {
        Organization organization = getOrganizationEntity(organizationId);
        
        if (organization.isVerified()) {
            throw new IllegalStateException("Organization is already verified");
        }
        
        organization.setVerified(true);
        organization.setVerificationDate(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public void rejectVerification(String organizationId, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("Rejection reason is required");
        }
        
        Organization organization = getOrganizationEntity(organizationId);
        organization.setVerified(false);
        organization.setVerificationDate(null);
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public void addDocument(String organizationId, String documentUrl, String documentType) {
        Organization organization = getOrganizationEntity(organizationId);
        
        if (organization == null) {
            throw new ResourceNotFoundException("Organization not found with ID: " + organizationId);
        }
        
        // Add the document URL to the organization
        organization.getDocuments().add(documentUrl);
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public void removeDocument(String organizationId, String documentUrl) {
        if (!StringUtils.hasText(documentUrl)) {
            throw new IllegalArgumentException("Document URL is required");
        }
        
        Organization organization = getOrganizationEntity(organizationId);
        if (organization.getDocuments() != null) {
            organization.getDocuments().remove(documentUrl);
            organization.setUpdatedAt(LocalDateTime.now());
            organizationRepository.save(organization);
        }
    }

    @Override
    @Transactional
    public void updateStatistics(String organizationId) {
        Organization organization = getOrganizationEntity(organizationId);
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged());
        
        // Update event statistics
        organization.setTotalEventsHosted(events.size());
        
        // Update volunteer statistics
        Set<String> activeVolunteers = calculateActiveVolunteers(events);
        organization.setActiveVolunteers(activeVolunteers.size());
        
        // Update total volunteer hours
        int totalHours = events.stream()
            .filter(event -> event.getStatus() == EventStatus.COMPLETED)
            .mapToInt(event -> {
                if (event.getStartDate() == null || event.getEndDate() == null) return 0;
                return (int) (java.time.Duration.between(event.getStartDate(), event.getEndDate()).toHours() 
                    * event.getRegisteredParticipants().size());
            })
            .sum();
        organization.setTotalVolunteerHours(totalHours);
        
        // Update rating
        double avgRating = events.stream()
            .mapToDouble(Event::getAverageRating)
            .filter(rating -> rating > 0)
            .average()
            .orElse(0.0);
        organization.setRating(avgRating);
        
        // Update impact score
        organization.setImpactScore(calculateImpactScore(organization));
        
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public void setAcceptingVolunteers(String organizationId, boolean accepting) {
        Organization organization = getOrganizationEntity(organizationId);
        organization.setAcceptingVolunteers(accepting);
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public boolean isNameAvailable(String name) {
        return !organizationRepository.existsByName(name);
    }

    @Override
    public boolean isRegistrationNumberValid(String registrationNumber) {
        return StringUtils.hasText(registrationNumber) && 
               !organizationRepository.existsByRegistrationNumber(registrationNumber);
    }

    @Override
    public boolean isTaxIdValid(String taxId) {
        return StringUtils.hasText(taxId) && 
               !organizationRepository.existsByTaxId(taxId);
    }

    @Override
    public void updateImpactScore(String organizationId) {
        Organization organization = getOrganizationEntity(organizationId);
        organization.setImpactScore(calculateImpactScore(organization));
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public void updateVolunteerCount(String organizationId) {
        Organization organization = getOrganizationEntity(organizationId);
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged());
        Set<String> activeVolunteers = calculateActiveVolunteers(events);
        organization.setActiveVolunteers(activeVolunteers.size());
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    @Override
    public List<VolunteerProfileResponse> getOrganizationVolunteers(String organizationId, String sortBy, String sortOrder) {
        Organization organization = getOrganizationEntity(organizationId);
        List<VolunteerProfile> volunteers = organization.getVolunteerProfiles();

        // Apply sorting
        Comparator<VolunteerProfile> comparator = switch (sortBy.toLowerCase()) {
            case "name" -> Comparator.comparing((VolunteerProfile v) -> {
                User user = v.getUser();
                return (user != null) ? (user.getFirstName() + " " + user.getLastName()) : "";
            });
            case "email" -> Comparator.comparing((VolunteerProfile v) -> {
                User user = v.getUser();
                return (user != null) ? user.getEmail() : "";
            });
            case "city" -> Comparator.comparing(VolunteerProfile::getCity);
            case "rating" -> Comparator.comparing(VolunteerProfile::getAverageRating, Comparator.nullsLast(Double::compareTo));
            case "hours" -> Comparator.comparing(VolunteerProfile::getTotalHoursVolunteered, Comparator.nullsLast(Integer::compareTo));
            default -> Comparator.comparing((VolunteerProfile v) -> {
                User user = v.getUser();
                return (user != null) ? (user.getFirstName() + " " + user.getLastName()) : "";
            });
        };

        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }

        return volunteers.stream()
            .sorted(comparator)
            .map(this::toVolunteerProfileResponse)
            .collect(Collectors.toList());
    }

    private VolunteerProfileResponse toVolunteerProfileResponse(VolunteerProfile profile) {
        User user = profile.getUser();
        return VolunteerProfileResponse.builder()
            .id(profile.getId())
            .firstName(user != null ? user.getFirstName() : "")
            .lastName(user != null ? user.getLastName() : "")
            .email(user != null ? user.getEmail() : "")
            .phoneNumber(profile.getPhoneNumber())
            .address(profile.getAddress())
            .bio(profile.getBio())
            .profilePicture(profile.getProfilePicture())
            .city(profile.getCity())
            .country(profile.getCountry())
            .skills(profile.getSkills().stream().map(Skill::getName).collect(Collectors.toSet()))
            .interests(profile.getInterests())
            .preferredCategories(profile.getPreferredCategories())
            .totalEventsAttended(profile.getTotalEventsAttended())
            .totalVolunteerHours(profile.getTotalHoursVolunteered())
            .averageEventRating(profile.getAverageRating())
            .build();
    }

    @Override
    public OrganizationResponse uploadProfilePicture(String organizationId, MultipartFile file) throws IOException {
        // Get the organization
        Organization organization = getOrganizationEntity(organizationId);

        // Store the file using GridFS
        String fileId = gridFsService.store(file);

        // Update organization with the new profile picture URL
        organization.setProfilePicture(fileId);
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);

        // Return the updated organization response
        return OrganizationResponse.fromOrganization(organization);
    }

    @Override
    public OrganizationResponse updateOrganizationStatus(String organizationId, String status, String reason) {
        Organization organization = getOrganizationEntity(organizationId);
        
        if (organization == null) {
            throw new ResourceNotFoundException("Organization not found with ID: " + organizationId);
        }
        
        // Validate the status
        if (!Arrays.asList("INCOMPLETE", "PENDING", "APPROVED", "REJECTED").contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        
        // If rejecting, reason is required
        if ("REJECTED".equals(status) && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("Rejection reason is required");
        }
        
        organization.setRoleStatus(status);
        
        if ("REJECTED".equals(status)) {
            organization.setRejectionReason(reason);
        } else {
            organization.setRejectionReason(null);
        }
        
        organization.setUpdatedAt(LocalDateTime.now());
        organization = organizationRepository.save(organization);
        
        return OrganizationResponse.fromOrganization(organization);
    }

    @Override
    public OrganizationResponse updateOrganizationBanStatus(String organizationId, boolean banned, String reason) {
        Organization organization = getOrganizationEntity(organizationId);
        
        if (organization == null) {
            throw new ResourceNotFoundException("Organization not found with ID: " + organizationId);
        }
        
        // If banning, reason is required
        if (banned && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("Ban reason is required");
        }
        
        organization.setBanned(banned);
        
        if (banned) {
            organization.setBanReason(reason);
        } else {
            organization.setBanReason(null);
        }
        
        organization.setUpdatedAt(LocalDateTime.now());
        organization = organizationRepository.save(organization);
        
        return OrganizationResponse.fromOrganization(organization);
    }

    @Override
    public List<OrganizationResponse> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();
        return organizations.stream()
                .map(OrganizationResponse::fromOrganization)
                .collect(Collectors.toList());
    }

    // Helper methods
    private Organization getOrganizationEntity(String organizationId) {
        return organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId));
    }

    private void updateOrganizationFromRequest(Organization organization, OrganizationRequest request) {
        organization.setName(request.getName());
        organization.setDescription(request.getDescription());
        organization.setMission(request.getMission());
        organization.setVision(request.getVision());
        organization.setWebsite(request.getWebsite());
        organization.setPhoneNumber(request.getPhoneNumber());
        organization.setAddress(request.getAddress());
        organization.setCity(request.getCity());
        organization.setCountry(request.getCountry());
        organization.setProvince(request.getProvince());
        organization.setPostalCode(request.getPostalCode());
        organization.setCoordinates(request.getCoordinates());
        
        // Convert SocialMediaLinks
        if (request.getSocialMediaLinks() != null) {
            Organization.SocialMediaLinks links = new Organization.SocialMediaLinks();
            links.setFacebook(request.getSocialMediaLinks().getFacebook());
            links.setTwitter(request.getSocialMediaLinks().getTwitter());
            links.setInstagram(request.getSocialMediaLinks().getInstagram());
            links.setLinkedin(request.getSocialMediaLinks().getLinkedin());
            organization.setSocialMediaLinks(links);
        }
        
        organization.setRegistrationNumber(request.getRegistrationNumber());
        organization.setType(request.getType());
        organization.setCategory(request.getCategory());
        organization.setSize(request.getSize());
        organization.setFoundedYear(request.getFoundedYear());
        organization.setAcceptingVolunteers(request.isAcceptingVolunteers());
        organization.setLogo(request.getLogo());
        organization.setProfilePicture(request.getProfilePicture());
        organization.setFocusAreas(new HashSet<>(request.getFocusAreas()));
    }

    private void validateOrganizationRequest(OrganizationRequest request) {
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("Organization name is required");
        }
        if (!StringUtils.hasText(request.getDescription())) {
            throw new IllegalArgumentException("Organization description is required");
        }
        if (!StringUtils.hasText(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Registration number is required");
        }
    }

    private double calculateImpactScore(Organization organization) {
        double score = 0;
        
        // Verified status (20%)
        if (organization.isVerified()) {
            score += 20;
        }
        
        // Events hosted (25%)
        double eventsScore = Math.min(organization.getTotalEventsHosted() * 2.5, 25);
        score += eventsScore;
        
        // Active volunteers (25%)
        double volunteersScore = Math.min(organization.getActiveVolunteers() * 0.5, 25);
        score += volunteersScore;
        
        // Rating (20%)
        double ratingScore = organization.getRating() * 4;
        score += ratingScore;
        
        // Volunteer hours (10%)
        double hoursScore = Math.min(organization.getTotalVolunteerHours() * 0.01, 10);
        score += hoursScore;
        
        return score;
    }

    private Set<String> calculateActiveVolunteers(List<Event> events) {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        return events.stream()
            .filter(event -> event.getStartDate().isAfter(threeMonthsAgo))
            .flatMap(event -> event.getRegisteredParticipants().stream())
            .collect(Collectors.toSet());
    }
} 