package com.fill_rouge.backend.service.statistics;

import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.repository.*;
import com.fill_rouge.backend.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final EventRepository eventRepository;
    private final ResourceRepository resourceRepository;
    private final EventParticipationRepository participationRepository;

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse getStatisticsByRole(String userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Role userRole = role != null ? role : user.getRole();
        
        StatisticsResponse response = new StatisticsResponse();
        response.setUserId(userId);
        response.setUserRole(userRole.name());
        
        switch (userRole) {
            case ADMIN:
                response.setAdminStats(getAdminStats());
                break;
            case ORGANIZATION:
                response.setOrganizationStats(getOrganizationStats(userId));
                break;
            case VOLUNTEER:
                response.setVolunteerStats(getVolunteerStats(userId));
                break;
            default:
                throw new RuntimeException("Invalid role for statistics");
        }
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.VolunteerStats getVolunteerStats(String volunteerId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Get participation metrics
        long totalEventsParticipated = participationRepository.countByVolunteerId(volunteerId);
        long activeEvents = participationRepository.countByVolunteerIdAndEventStatusAndEndDateAfter(volunteerId, EventStatus.ACTIVE.name(), now);
        long completedEvents = participationRepository.countByVolunteerIdAndEventStatusAndEndDateBefore(volunteerId, EventStatus.COMPLETED.name(), now);
        long totalVolunteerHours = calculateVolunteerTotalHours(volunteerId);

        // Calculate performance metrics
        double reliabilityScore = calculateVolunteerReliabilityScore(volunteerId);
        double avgEventRating = calculateVolunteerAverageEventRating(volunteerId);
        long skillsEndorsements = calculateVolunteerSkillsEndorsements(volunteerId);
        
        // Get progress tracking data
        List<StatisticsResponse.TimeSeriesData> hoursContributed = getVolunteerHoursContributed(volunteerId);
        List<StatisticsResponse.TimeSeriesData> eventsParticipation = getVolunteerEventsParticipation(volunteerId);
        Map<String, Long> eventsByCategory = getVolunteerEventsByCategory(volunteerId);
        
        // Calculate impact metrics
        long peopleImpacted = calculatePeopleImpacted(volunteerId);
        long organizationsSupported = calculateOrganizationsSupported(volunteerId);
        Map<String, Long> impactByCategory = calculateImpactByCategory(volunteerId);

        return StatisticsResponse.VolunteerStats.builder()
                .totalEventsParticipated(totalEventsParticipated)
                .activeEvents(activeEvents)
            .completedEvents(completedEvents)
                .totalVolunteerHours(totalVolunteerHours)
                .reliabilityScore(reliabilityScore)
                .averageEventRating(avgEventRating)
                .skillsEndorsements(skillsEndorsements)
                .hoursContributed(hoursContributed)
                .eventsParticipation(eventsParticipation)
                .eventsByCategory(eventsByCategory)
                .peopleImpacted(peopleImpacted)
            .organizationsSupported(organizationsSupported)
                .impactByCategory(impactByCategory)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.OrganizationStats getOrganizationStats(String organizationId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Get basic event counts
        long totalEvents = eventRepository.countByOrganizationId(organizationId);
        long activeEvents = eventRepository.countByOrganizationIdAndStatusAndEndDateAfter(organizationId, EventStatus.ACTIVE.name(), now);
        long completedEvents = eventRepository.countByOrganizationIdAndStatusAndEndDateBefore(organizationId, EventStatus.COMPLETED.name(), now);
        long upcomingEvents = eventRepository.countByOrganizationIdAndStatusAndStartDateAfter(organizationId, EventStatus.SCHEDULED.name(), now);
        
        // Get volunteer engagement metrics
        long totalVolunteers = participationRepository.countDistinctVolunteersByOrganizationId(organizationId);
        long activeVolunteers = participationRepository.countActiveVolunteersByOrganizationId(organizationId);
        double avgVolunteersPerEvent = calculateOrganizationAverageVolunteersPerEvent(organizationId);
        long totalVolunteerHours = calculateOrganizationTotalVolunteerHours(organizationId);
        
        // Calculate performance metrics
        double eventSuccessRate = calculateEventSuccessRate(organizationId);
        double retentionRate = calculateOrganizationVolunteerRetentionRate(organizationId);
        double avgEventRating = calculateOrganizationAverageEventRating(organizationId);
        
        // Get time-based analysis
        List<StatisticsResponse.TimeSeriesData> eventTrends = getOrganizationEventTrends(organizationId);
        List<StatisticsResponse.TimeSeriesData> volunteerTrends = getOrganizationVolunteerTrends(organizationId);
        Map<String, Long> eventsByCategory = getOrganizationEventsByCategory(organizationId);
        Map<String, Long> volunteersBySkill = getOrganizationVolunteersBySkill(organizationId);

        return StatisticsResponse.OrganizationStats.builder()
                .totalEvents(totalEvents)
                .activeEvents(activeEvents)
                .completedEvents(completedEvents)
                .upcomingEvents(upcomingEvents)
            .totalVolunteers(totalVolunteers)
            .activeVolunteers(activeVolunteers)
                .averageVolunteersPerEvent(avgVolunteersPerEvent)
                .totalVolunteerHours(totalVolunteerHours)
                .eventSuccessRate(eventSuccessRate)
            .volunteerRetentionRate(retentionRate)
                .averageEventRating(avgEventRating)
                .eventTrends(eventTrends)
                .volunteerTrends(volunteerTrends)
                .eventsByCategory(eventsByCategory)
                .volunteersBySkill(volunteersBySkill)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse.AdminStats getAdminStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthAgo = now.minusMonths(1);

        // Fetch basic counts
        long totalUsers = userRepository.count();
        long totalVolunteers = userRepository.countByRole(Role.VOLUNTEER);
        long totalOrganizations = userRepository.countByRole(Role.ORGANIZATION);
        long totalEvents = eventRepository.count();
        
        // Calculate active and completed events
        long activeEvents = eventRepository.countByStatusAndEndDateAfter(EventStatus.ACTIVE.name(), now);
        long completedEvents = eventRepository.countByStatusAndEndDateBefore(EventStatus.COMPLETED.name(), now);
        
        // Calculate volunteer hours and averages
        long totalVolunteerHours = calculateTotalVolunteerHours();
        double avgHoursPerEvent = totalEvents > 0 ? (double) totalVolunteerHours / totalEvents : 0;
        
        // Get growth metrics
        List<StatisticsResponse.TimeSeriesData> userGrowth = getUserGrowthData(monthAgo, now);
        List<StatisticsResponse.TimeSeriesData> eventGrowth = getEventGrowthData(monthAgo, now);
        
        // Get category distribution
        Map<String, Long> eventsByCategory = getEventsByCategory();
        
        // Calculate engagement metrics
        double avgVolunteersPerEvent = calculateAverageVolunteersPerEvent();
        double retentionRate = calculateVolunteerRetentionRate();
        Map<String, Long> volunteersByLocation = getVolunteersByLocation();

        return StatisticsResponse.AdminStats.builder()
                .totalUsers(totalUsers)
                .totalVolunteers(totalVolunteers)
                .totalOrganizations(totalOrganizations)
            .totalEvents(totalEvents)
            .activeEvents(activeEvents)
            .completedEvents(completedEvents)
                .totalVolunteerHours(totalVolunteerHours)
                .averageVolunteerHoursPerEvent(avgHoursPerEvent)
                .userGrowth(userGrowth)
                .eventGrowth(eventGrowth)
                .eventsByCategory(eventsByCategory)
                .averageVolunteersPerEvent(avgVolunteersPerEvent)
                .volunteerRetentionRate(retentionRate)
                .volunteersByLocation(volunteersByLocation)
            .build();
    }

    @Override
    public StatisticsResponse.AdminStats getAdminStatsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation similar to getAdminStats but with date range filtering
        return null; // TODO: Implement
    }

    @Override
    public StatisticsResponse.OrganizationStats getOrganizationStatsByDateRange(String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation similar to getOrganizationStats but with date range filtering
        return null; // TODO: Implement
    }

    @Override
    public StatisticsResponse.VolunteerStats getVolunteerStatsByDateRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation similar to getVolunteerStats but with date range filtering
        return null; // TODO: Implement
    }

    // Helper methods for calculations
    private long calculateTotalVolunteerHours() {
        return participationRepository.sumTotalHours();
    }

    private List<StatisticsResponse.TimeSeriesData> getUserGrowthData(LocalDateTime start, LocalDateTime end) {
        List<Object[]> data = userRepository.getUserGrowthByDay(start, end);
        return convertToTimeSeriesData(data);
    }

    private List<StatisticsResponse.TimeSeriesData> getEventGrowthData(LocalDateTime start, LocalDateTime end) {
        List<Object[]> data = eventRepository.getEventGrowthByDay(start, end);
        return convertToTimeSeriesData(data);
    }

    private Map<String, Long> getEventsByCategory() {
        return eventRepository.countByCategory();
    }

    private double calculateAverageVolunteersPerEvent() {
        return participationRepository.calculateAverageVolunteersPerEvent();
    }

    private double calculateVolunteerRetentionRate() {
        // Implementation for volunteer retention rate calculation
        return 0.0; // TODO: Implement
    }

    private Map<String, Long> getVolunteersByLocation() {
        return volunteerProfileRepository.countByLocation();
    }

    private List<StatisticsResponse.TimeSeriesData> convertToTimeSeriesData(List<Object[]> data) {
        return data.stream()
                .map(row -> StatisticsResponse.TimeSeriesData.builder()
                        .date(row[0].toString())
                        .value(Long.parseLong(row[1].toString()))
                        .category(row.length > 2 ? row[2].toString() : null)
                .build())
            .collect(Collectors.toList());
    }

    // Additional helper methods for volunteer statistics
    private long calculateVolunteerTotalHours(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
                .mapToLong(EventParticipation::getHours)
            .sum();
    }

    private double calculateVolunteerReliabilityScore(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        if (participations.isEmpty()) return 0.0;

        long totalEvents = participations.size();
        long completedEvents = participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .count();

        return (double) completedEvents / totalEvents * 100;
    }

    private double calculateVolunteerAverageEventRating(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .filter(p -> p.getRating() != null)
                .mapToDouble(EventParticipation::getRating)
                .average()
                .orElse(0.0);
    }

    private long calculateVolunteerSkillsEndorsements(String volunteerId) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer profile not found"));
        if (profile.getSkills() == null) {
            return 0L;
        }
        return profile.getSkills().stream()
                .mapToLong(skill -> skill.getEndorsementCount())
                .sum();
    }

    private List<StatisticsResponse.TimeSeriesData> getVolunteerHoursContributed(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        Map<String, Long> hoursByDate = participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                    p -> p.getCompletedDate().format(DateTimeFormatter.ISO_DATE),
                    Collectors.summingLong(EventParticipation::getHours)
                ));

        return hoursByDate.entrySet().stream()
                .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                        .date(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatisticsResponse.TimeSeriesData> getVolunteerEventsParticipation(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        Map<String, Long> eventsByDate = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getEvent().getStartDate().format(DateTimeFormatter.ISO_DATE),
                    Collectors.counting()
                ));

        return eventsByDate.entrySet().stream()
                .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                        .date(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private Map<String, Long> getVolunteerEventsByCategory(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getEvent().getCategory().toString(),
                    Collectors.counting()
                ));
    }

    private long calculatePeopleImpacted(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
                .mapToLong(p -> p.getEvent().getParticipantCount())
                .sum();
    }

    private long calculateOrganizationsSupported(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .map(p -> p.getEvent().getOrganizationId())
                .distinct()
            .count();
    }

    private Map<String, Long> calculateImpactByCategory(String volunteerId) {
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        return participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .collect(Collectors.groupingBy(
                    p -> p.getEvent().getCategory().toString(),
                    Collectors.summingLong(p -> p.getEvent().getParticipantCount())
                ));
    }

    // Additional helper methods for organization statistics
    private double calculateOrganizationAverageVolunteersPerEvent(String organizationId) {
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        if (events.isEmpty()) return 0.0;

        long totalVolunteers = events.stream()
                .mapToLong(Event::getParticipantCount)
                .sum();
        return (double) totalVolunteers / events.size();
    }

    private long calculateOrganizationTotalVolunteerHours(String organizationId) {
        List<EventParticipation> participations = participationRepository.findByOrganizationId(organizationId);
        return participations.stream()
                .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
                .mapToLong(EventParticipation::getHours)
                .sum();
    }

    private double calculateEventSuccessRate(String organizationId) {
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        if (events.isEmpty()) return 0.0;

        long completedEvents = events.stream()
                .filter(e -> e.getStatus() == EventStatus.COMPLETED)
            .count();
        return (double) completedEvents / events.size() * 100;
    }

    private double calculateOrganizationVolunteerRetentionRate(String organizationId) {
        List<EventParticipation> participations = participationRepository.findByOrganizationId(organizationId);
        if (participations.isEmpty()) return 0.0;

        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        long totalVolunteers = participations.stream()
                .map(EventParticipation::getVolunteerId)
                .distinct()
                .count();
        long retainedVolunteers = participations.stream()
                .filter(p -> p.getCompletedDate().isAfter(threeMonthsAgo))
                .map(EventParticipation::getVolunteerId)
                .distinct()
                .count();
            
        return (double) retainedVolunteers / totalVolunteers * 100;
    }

    private double calculateOrganizationAverageEventRating(String organizationId) {
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        if (events.isEmpty()) {
            return 0.0;
        }
        return events.stream()
                .filter(e -> e.getRating() != null)
                .mapToDouble(e -> e.getRating())
                .average()
                .orElse(0.0);
    }

    private List<StatisticsResponse.TimeSeriesData> getOrganizationEventTrends(String organizationId) {
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        Map<String, Long> eventsByDate = events.stream()
                .collect(Collectors.groupingBy(
                    e -> e.getStartDate().format(DateTimeFormatter.ISO_DATE),
                    Collectors.counting()
                ));

        return eventsByDate.entrySet().stream()
                .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                        .date(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatisticsResponse.TimeSeriesData> getOrganizationVolunteerTrends(String organizationId) {
        List<EventParticipation> participations = participationRepository.findByOrganizationId(organizationId);
        Map<String, Long> volunteersByDate = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getEvent().getStartDate().format(DateTimeFormatter.ISO_DATE),
                    Collectors.collectingAndThen(
                        Collectors.mapping(EventParticipation::getVolunteerId, Collectors.toSet()),
                        volunteers -> (long) volunteers.size()
                    )
                ));

        return volunteersByDate.entrySet().stream()
                .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                        .date(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private Map<String, Long> getOrganizationEventsByCategory(String organizationId) {
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        return events.stream()
                .collect(Collectors.groupingBy(
                    e -> e.getCategory().toString(),
                    Collectors.counting()
                ));
    }

    private Map<String, Long> getOrganizationVolunteersBySkill(String organizationId) {
        List<EventParticipation> participations = participationRepository.findByOrganizationId(organizationId);
        Map<String, Long> skillCounts = new HashMap<>();
        
        for (EventParticipation participation : participations) {
            VolunteerProfile profile = volunteerProfileRepository.findByUserId(participation.getVolunteerId())
                    .orElse(null);
            if (profile != null && profile.getSkills() != null) {
                for (Skill skill : profile.getSkills()) {
                    skillCounts.merge(skill.getName(), 1L, Long::sum);
                }
            }
        }
        
        return skillCounts;
    }
} 