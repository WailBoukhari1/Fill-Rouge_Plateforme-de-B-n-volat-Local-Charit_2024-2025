package com.fill_rouge.backend.service.statistics;

import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.repository.*;
import com.fill_rouge.backend.domain.*;
import com.fill_rouge.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final EventRepository eventRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse getStatisticsByRole(String userId, Role role) {
        return StatisticsResponse.builder()
            .volunteerStats(role == Role.VOLUNTEER ? getVolunteerStats(userId) : null)
            .organizationStats(role == Role.ORGANIZATION ? getOrganizationStats(userId) : null)
            .adminStats(role == Role.ADMIN ? getAdminStats() : null)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.VolunteerStats getVolunteerStats(String userId) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Volunteer profile not found"));

        List<EventParticipation> participations = profile.getParticipations();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthAgo = now.minusMonths(1);

        // Calculate core metrics
        int totalHours = calculateTotalHours(participations);
        int eventsParticipated = (int) participations.stream()
            .filter(p -> p.getEvent().getEndDate().isBefore(now))
            .count();
        int upcomingEvents = (int) participations.stream()
            .filter(p -> p.getEvent().getStartDate().isAfter(now))
            .count();
        int completedEvents = (int) participations.stream()
            .filter(p -> p.getEvent().isCompleted())
            .count();

        // Calculate performance metrics
        double attendanceRate = calculateAttendanceRate(participations);
        double averageRating = profile.getAverageRating();
        int impactScore = calculateVolunteerImpactScore(profile);

        // Calculate growth metrics
        int skillsAcquired = profile.getSkills().size();
        int certificatesEarned = profile.getCertifications().size();
        int organizationsSupported = (int) participations.stream()
            .map(p -> p.getEvent().getOrganization().getId())
            .distinct()
            .count();

        // Get recent events
        List<StatisticsResponse.RecentEvent> recentEvents = participations.stream()
            .filter(p -> p.getEvent().getEndDate().isAfter(monthAgo))
            .map(this::mapToRecentEvent)
            .collect(Collectors.toList());

        return StatisticsResponse.VolunteerStats.builder()
            .totalHoursVolunteered(totalHours)
            .eventsParticipated(eventsParticipated)
            .upcomingEvents(upcomingEvents)
            .completedEvents(completedEvents)
            .attendanceRate(attendanceRate)
            .averageRating(averageRating)
            .impactScore(impactScore)
            .skillsAcquired(skillsAcquired)
            .certificatesEarned(certificatesEarned)
            .organizationsSupported(organizationsSupported)
            .recentEvents(recentEvents)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.OrganizationStats getOrganizationStats(String organizationId) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthAgo = now.minusMonths(1);

        // Calculate volunteer metrics
        int totalVolunteers = org.getVolunteerCount();
        int activeVolunteers = org.getActiveVolunteerCount();
        int newVolunteersThisMonth = calculateNewVolunteersThisMonth(org, monthAgo);
        double retentionRate = calculateVolunteerRetentionRate(org);

        // Calculate event metrics
        Page<Event> eventsPage = eventRepository.findByOrganizationId(org.getId(), Pageable.unpaged());
        List<Event> events = eventsPage.getContent();
        int totalEvents = events.size();
        int ongoingEvents = calculateOngoingEvents(events, now);
        int upcomingEvents = calculateUpcomingEvents(events, now);
        double averageEventRating = org.getRating();

        // Calculate impact metrics
        int totalVolunteerHours = org.getTotalVolunteerHours();
        int impactScore = calculateOrganizationImpactScore(org);
        int resourcesShared = (int) resourceRepository.countByOrganizationId(org.getId());

        // Get top volunteers
        List<StatisticsResponse.TopVolunteer> topVolunteers = getTopVolunteers(org);

        return StatisticsResponse.OrganizationStats.builder()
            .totalVolunteers(totalVolunteers)
            .activeVolunteers(activeVolunteers)
            .newVolunteersThisMonth(newVolunteersThisMonth)
            .volunteerRetentionRate(retentionRate)
            .totalEvents(totalEvents)
            .ongoingEvents(ongoingEvents)
            .upcomingEvents(upcomingEvents)
            .averageEventRating(averageEventRating)
            .totalVolunteerHours(totalVolunteerHours)
            .impactScore(impactScore)
            .resourcesShared(resourcesShared)
            .topVolunteers(topVolunteers)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.AdminStats getAdminStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthAgo = now.minusMonths(1);

        // Calculate platform metrics
        long totalUsers = userRepository.count();
        long activeUsers = calculateActiveUsers(monthAgo);
        double platformEngagement = (double) activeUsers / totalUsers * 100;

        // Calculate organization metrics
        long totalOrgs = organizationRepository.count();
        long verifiedOrgs = organizationRepository.countByVerifiedTrue();
        long pendingVerifications = organizationRepository.countByVerifiedFalse();

        // Calculate event metrics
        List<Event> allEvents = eventRepository.findAll();
        int totalEvents = allEvents.size();
        int activeEvents = calculateOngoingEvents(allEvents, now);
        int completedEvents = (int) allEvents.stream()
            .filter(Event::isCompleted)
            .count();
        int canceledEvents = (int) allEvents.stream()
            .filter(e -> e.getStatus() == EventStatus.CANCELLED)
            .count();

        // Calculate resource metrics
        List<Resource> resources = resourceRepository.findAll();
        Map<String, Integer> resourcesByCategory = calculateResourcesByCategory(resources);

        // Calculate growth metrics
        double userGrowthRate = calculateUserGrowthRate(monthAgo);
        double eventGrowthRate = calculateEventGrowthRate(monthAgo);
        List<Integer> monthlyActiveUsers = calculateMonthlyActiveUsers();

        return StatisticsResponse.AdminStats.builder()
            .totalUsers((int) totalUsers)
            .activeUsers((int) activeUsers)
            .platformEngagementRate(platformEngagement)
            .totalOrganizations((int) totalOrgs)
            .verifiedOrganizations((int) verifiedOrgs)
            .pendingVerifications((int) pendingVerifications)
            .totalEvents(totalEvents)
            .activeEvents(activeEvents)
            .completedEvents(completedEvents)
            .canceledEvents(canceledEvents)
            .totalResources(resources.size())
            .resourcesByCategory(resourcesByCategory)
            .userGrowthRate(userGrowthRate)
            .eventGrowthRate(eventGrowthRate)
            .monthlyActiveUsers(monthlyActiveUsers)
            .build();
    }

    // Helper methods
    private StatisticsResponse.RecentEvent mapToRecentEvent(EventParticipation participation) {
        Event event = participation.getEvent();
        return StatisticsResponse.RecentEvent.builder()
            .eventId(event.getId())
            .eventName(event.getTitle())
            .date(event.getStartDate())
            .hours(calculateEventHours(event))
            .organizationName(event.getOrganization().getName())
            .build();
    }

    private int calculateEventHours(Event event) {
        return (int) java.time.Duration.between(event.getStartDate(), event.getEndDate()).toHours();
    }

    private double calculateAttendanceRate(List<EventParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        long attended = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .count();
        return (double) attended / participations.size() * 100;
    }

    private int calculateNewVolunteersThisMonth(Organization org, LocalDateTime monthAgo) {
        return (int) org.getVolunteerProfiles().stream()
            .filter(v -> v.getJoinDate().isAfter(monthAgo))
            .count();
    }

    private double calculateVolunteerRetentionRate(Organization org) {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        List<VolunteerProfile> volunteers = org.getVolunteerProfiles();
        long totalVolunteers = volunteers.size();
        if (totalVolunteers == 0) return 0.0;

        long retainedVolunteers = volunteers.stream()
            .filter(v -> v.getLastActivityDate().isAfter(threeMonthsAgo))
            .count();

        return (double) retainedVolunteers / totalVolunteers * 100;
    }

    private List<StatisticsResponse.TopVolunteer> getTopVolunteers(Organization org) {
        return org.getVolunteerProfiles().stream()
            .sorted(Comparator.comparingInt(v -> -v.getParticipations().size()))
            .limit(5)
            .<StatisticsResponse.TopVolunteer>map(v -> StatisticsResponse.TopVolunteer.builder()
                .volunteerId(v.getId())
                .name(v.getUser().getFirstName() + " " + v.getUser().getLastName())
                .hoursContributed(calculateTotalHours(v.getParticipations()))
                .eventsAttended((int) v.getParticipations().stream()
                    .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
                    .count())
                .build())
            .collect(Collectors.toList());
    }

    private int calculateTotalHours(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .mapToInt(p -> calculateEventHours(p.getEvent()))
            .sum();
    }

    private int calculateOngoingEvents(List<Event> events, LocalDateTime now) {
        return (int) events.stream()
            .filter(e -> e.getStartDate().isBefore(now) && e.getEndDate().isAfter(now))
            .count();
    }

    private int calculateUpcomingEvents(List<Event> events, LocalDateTime now) {
        return (int) events.stream()
            .filter(e -> e.getStartDate().isAfter(now))
            .count();
    }

    private long calculateActiveUsers(LocalDateTime since) {
        return userRepository.findAll().stream()
            .filter(u -> u.getLastLoginDate() != null && u.getLastLoginDate().isAfter(since))
            .count();
    }

    private Map<String, Integer> calculateResourcesByCategory(List<Resource> resources) {
        return resources.stream()
            .collect(Collectors.groupingBy(
                Resource::getType,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
    }

    private double calculateUserGrowthRate(LocalDateTime since) {
        long totalUsers = userRepository.count();
        long newUsers = userRepository.findAll().stream()
            .filter(u -> u.getCreatedAt().isAfter(since))
            .count();
        return totalUsers == 0 ? 0 : (double) newUsers / totalUsers * 100;
    }

    private double calculateEventGrowthRate(LocalDateTime since) {
        long totalEvents = eventRepository.count();
        long newEvents = eventRepository.findAll().stream()
            .filter(e -> e.getCreatedAt().isAfter(since))
            .count();
        return totalEvents == 0 ? 0 : (double) newEvents / totalEvents * 100;
    }

    private List<Integer> calculateMonthlyActiveUsers() {
        List<Integer> monthlyUsers = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            int activeUsers = (int) userRepository.findAll().stream()
                .filter(u -> u.getLastLoginDate() != null &&
                    u.getLastLoginDate().isAfter(monthStart) &&
                    u.getLastLoginDate().isBefore(monthEnd))
                .count();
            
            monthlyUsers.add(activeUsers);
        }
        
        return monthlyUsers;
    }

    private int calculateVolunteerImpactScore(VolunteerProfile profile) {
        double hoursScore = Math.min(calculateTotalHours(profile.getParticipations()) * 0.1, 40);
        double eventsScore = Math.min(profile.getParticipations().size() * 2, 30);
        double skillsScore = Math.min(profile.getSkills().size() * 2, 20);
        double ratingScore = profile.getAverageRating() * 2;
        return (int) (hoursScore + eventsScore + skillsScore + ratingScore);
    }

    private int calculateOrganizationImpactScore(Organization org) {
        double volunteerScore = Math.min(org.getTotalVolunteers() * 2, 30);
        double eventScore = Math.min(org.getTotalEventsHosted() * 1.5, 30);
        double hoursScore = Math.min(org.getTotalVolunteerHours() * 0.05, 20);
        double ratingScore = org.getRating() * 4;
        return (int) (volunteerScore + eventScore + hoursScore + ratingScore);
    }
} 