package com.fill_rouge.backend.service.statistics;

import com.fill_rouge.backend.dto.response.StatisticsResponse;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.repository.*;
import com.fill_rouge.backend.domain.*;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
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
        
        // Verify the volunteer exists
        volunteerProfileRepository.findByVolunteerId(volunteerId)
            .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for ID: " + volunteerId));
        
        // Get all participations for the volunteer using the full ObjectId
        List<EventParticipation> participations = participationRepository.findByVolunteerId(volunteerId);
        
        // Calculate basic metrics
        long totalEventsParticipated = participations.size();
        long activeEvents = participations.stream()
            .filter(p -> p.getEvent().getStatus() == EventStatus.ACTIVE && 
                        p.getEvent().getEndDate().isAfter(now))
            .count();
        long completedEvents = participations.stream()
            .filter(p -> p.getEvent().getStatus() == EventStatus.COMPLETED && 
                        p.getEvent().getEndDate().isBefore(now))
            .count();
        long totalVolunteerHours = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .mapToLong(EventParticipation::getHours)
            .sum();

        // Calculate performance metrics
        double reliabilityScore = calculateReliabilityScore(participations);
        double avgEventRating = calculateAverageRating(participations);
        long skillsEndorsements = calculateSkillsEndorsements(volunteerId);
        
        // Get time series data
        List<StatisticsResponse.TimeSeriesData> hoursContributed = getHoursContributedByMonth(participations);
        List<StatisticsResponse.TimeSeriesData> eventsParticipation = getEventsParticipationByMonth(participations);
        Map<String, Long> eventsByCategory = getEventsByCategory(participations);
        
        // Calculate impact metrics
        long peopleImpacted = calculatePeopleImpacted(participations);
        long organizationsSupported = participations.stream()
            .map(p -> p.getEvent().getOrganizationId())
            .distinct()
            .count();
        Map<String, Long> impactByCategory = calculateImpactByCategory(participations);

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
        
        // Get all events for the organization
        List<Event> events = eventRepository.findAllByOrganizationId(organizationId);
        List<EventParticipation> participations = participationRepository.findByOrganizationId(organizationId);
        
        // Calculate event metrics
        long totalEvents = events.size();
        long activeEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.ACTIVE && e.getEndDate().isAfter(now))
            .count();
        long completedEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.COMPLETED && e.getEndDate().isBefore(now))
            .count();
        long upcomingEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.SCHEDULED && e.getStartDate().isAfter(now))
            .count();

        // Calculate volunteer metrics
        long totalVolunteers = participations.stream()
            .map(EventParticipation::getVolunteerId)
            .distinct()
            .count();
        long activeVolunteers = participations.stream()
            .filter(p -> p.getEvent().getEndDate().isAfter(now.minusMonths(3)))
            .map(EventParticipation::getVolunteerId)
            .distinct()
            .count();
        double avgVolunteersPerEvent = totalEvents > 0 ? (double) totalVolunteers / totalEvents : 0;
        long totalVolunteerHours = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .mapToLong(EventParticipation::getHours)
            .sum();

        // Calculate performance metrics
        double eventSuccessRate = calculateEventSuccessRate(events);
        double retentionRate = calculateVolunteerRetentionRate(participations);
        double avgEventRating = calculateOrganizationEventRating(events);

        // Get time series data
        List<StatisticsResponse.TimeSeriesData> eventTrends = getEventTrendsByMonth(events);
        List<StatisticsResponse.TimeSeriesData> volunteerTrends = getVolunteerTrendsByMonth(participations);
        Map<String, Long> eventsByCategory = getEventsByCategoryMap(events);
        Map<String, Long> volunteersBySkill = getVolunteersBySkill(participations);

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
        long totalEvents = eventRepository.count();
        if (totalEvents == 0) return 0.0;
        
        long totalParticipants = participationRepository.count();
        return (double) totalParticipants / totalEvents;
    }

    private double calculateVolunteerRetentionRate() {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        
        // Get all volunteers who have ever participated
        Set<String> allVolunteers = participationRepository.findAll().stream()
                .map(EventParticipation::getVolunteerId)
                .collect(Collectors.toSet());
                
        if (allVolunteers.isEmpty()) return 0.0;
        
        // Get volunteers who participated in the last 3 months
        Set<String> recentVolunteers = participationRepository.findAll().stream()
                .filter(p -> p.getEvent().getStartDate().isAfter(threeMonthsAgo))
                .map(EventParticipation::getVolunteerId)
                .collect(Collectors.toSet());
        
        return (double) recentVolunteers.size() / allVolunteers.size() * 100;
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

    private double calculateReliabilityScore(List<EventParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        long completedEvents = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .count();
        return (double) completedEvents / participations.size() * 100;
    }

    private double calculateAverageRating(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getRating() != null)
            .mapToDouble(EventParticipation::getRating)
            .average()
            .orElse(0.0);
    }

    private long calculateSkillsEndorsements(String volunteerId) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer profile not found"));
        if (profile.getSkills() == null) {
            return 0L;
        }
        return profile.getSkills().stream()
                .mapToLong(skill -> skill.getEndorsementCount())
                .sum();
    }

    private List<StatisticsResponse.TimeSeriesData> getHoursContributedByMonth(List<EventParticipation> participations) {
        Map<String, Long> hoursByMonth = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .collect(Collectors.groupingBy(
                p -> p.getCompletedDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.summingLong(EventParticipation::getHours)
            ));

        return hoursByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private List<StatisticsResponse.TimeSeriesData> getEventsParticipationByMonth(List<EventParticipation> participations) {
        Map<String, Long> eventsByMonth = participations.stream()
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.counting()
            ));

        return eventsByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private Map<String, Long> getEventsByCategory(List<EventParticipation> participations) {
        return participations.stream()
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getCategory().toString(),
                Collectors.counting()
            ));
    }

    private long calculatePeopleImpacted(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .mapToLong(p -> p.getEvent().getParticipantCount())
            .sum();
    }

    private Map<String, Long> calculateImpactByCategory(List<EventParticipation> participations) {
        return participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.COMPLETED)
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getCategory().toString(),
                Collectors.summingLong(p -> p.getEvent().getParticipantCount())
            ));
    }

    // Additional helper methods for organization statistics
    private double calculateEventSuccessRate(List<Event> events) {
        if (events.isEmpty()) return 0.0;
        long completedEvents = events.stream()
            .filter(e -> e.getStatus() == EventStatus.COMPLETED)
            .count();
        return (double) completedEvents / events.size() * 100;
    }

    private double calculateVolunteerRetentionRate(List<EventParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        
        Set<String> allVolunteers = participations.stream()
            .map(EventParticipation::getVolunteerId)
            .collect(Collectors.toSet());
            
        Set<String> recentVolunteers = participations.stream()
            .filter(p -> p.getEvent().getEndDate().isAfter(threeMonthsAgo))
            .map(EventParticipation::getVolunteerId)
            .collect(Collectors.toSet());
            
        return (double) recentVolunteers.size() / allVolunteers.size() * 100;
    }

    private double calculateOrganizationEventRating(List<Event> events) {
        return events.stream()
            .filter(e -> e.getRating() != null)
            .mapToDouble(Event::getRating)
            .average()
            .orElse(0.0);
    }

    private List<StatisticsResponse.TimeSeriesData> getEventTrendsByMonth(List<Event> events) {
        Map<String, Long> eventsByMonth = events.stream()
            .collect(Collectors.groupingBy(
                e -> e.getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.counting()
            ));

        return eventsByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private List<StatisticsResponse.TimeSeriesData> getVolunteerTrendsByMonth(List<EventParticipation> participations) {
        Map<String, Long> volunteersByMonth = participations.stream()
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.collectingAndThen(
                    Collectors.mapping(EventParticipation::getVolunteerId, Collectors.toSet()),
                    volunteers -> (long) volunteers.size()
                )
            ));

        return volunteersByMonth.entrySet().stream()
            .map(entry -> StatisticsResponse.TimeSeriesData.builder()
                .date(entry.getKey())
                .value(entry.getValue())
                .build())
            .sorted(Comparator.comparing(StatisticsResponse.TimeSeriesData::getDate))
            .collect(Collectors.toList());
    }

    private Map<String, Long> getEventsByCategoryMap(List<Event> events) {
        return events.stream()
            .collect(Collectors.groupingBy(
                e -> e.getCategory().toString(),
                Collectors.counting()
            ));
    }

    private Map<String, Long> getVolunteersBySkill(List<EventParticipation> participations) {
        Map<String, Long> skillCounts = new HashMap<>();
        
        Set<String> uniqueVolunteers = participations.stream()
            .map(EventParticipation::getVolunteerId)
            .collect(Collectors.toSet());
            
        for (String volunteerId : uniqueVolunteers) {
            VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerId)
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