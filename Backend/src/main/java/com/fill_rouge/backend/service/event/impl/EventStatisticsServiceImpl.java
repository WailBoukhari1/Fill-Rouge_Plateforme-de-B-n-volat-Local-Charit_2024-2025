package com.fill_rouge.backend.service.event.impl;

import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.*;
import com.fill_rouge.backend.service.event.EventStatisticsService;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventFeedback;
import com.fill_rouge.backend.dto.response.VolunteerStatsResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class EventStatisticsServiceImpl implements EventStatisticsService {
    
    private final EventRepository eventRepository;
    private final EventFeedbackRepository feedbackRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;

    @Override
    public EventStatisticsResponse getAdminDashboardStats() {
        return EventStatisticsResponse.builder()
                .participantCount(calculateTotalParticipants())
                .averageRating(calculateOverallAverageRating())
                .totalVolunteerHours(calculateTotalVolunteerHours())
                .successRate(calculateOverallSuccessRate())
                .build();
    }

    @Override
    public EventStatisticsResponse getAdminDashboardStatsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return EventStatisticsResponse.builder()
                .participantCount(calculateTotalParticipantsInRange(startDate, endDate))
                .averageRating(calculateAverageRatingInRange(startDate, endDate))
                .totalVolunteerHours(calculateVolunteerHoursInRange(startDate, endDate))
                .successRate(calculateSuccessRateInRange(startDate, endDate))
                .build();
    }
    @Override
    public double calculateEventSuccessRate(String eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        double participationRate = event.getRegisteredParticipants().size() / 
                (double) event.getMaxParticipants();
        double averageRating = event.getAverageRating() / 5.0; // Normalize to 0-1
        boolean isCompleted = event.getStatus() == EventStatus.COMPLETED;
        
        // Weight factors: 40% participation, 40% rating, 20% completion
        return (participationRate * 0.4 + averageRating * 0.4 + (isCompleted ? 0.2 : 0)) * 100;
    }
    @Override
    public EventStatisticsResponse getOrganizationDashboardStats(String organizationId) {
        return EventStatisticsResponse.builder()
                .participantCount(calculateOrganizationParticipants(organizationId))
                .averageRating(calculateOrganizationAverageRating(organizationId))
                .totalVolunteerHours(calculateOrganizationVolunteerHours(organizationId))
                .successRate(calculateOrganizationSuccessRate(organizationId))
                .build();
    }

    @Override
    public EventStatisticsResponse getOrganizationDashboardStatsByDateRange(
            String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        return EventStatisticsResponse.builder()
                .participantCount(calculateOrganizationParticipantsInRange(organizationId, startDate, endDate))
                .averageRating(calculateOrganizationAverageRatingInRange(organizationId, startDate, endDate))
                .totalVolunteerHours(calculateOrganizationVolunteerHoursInRange(organizationId, startDate, endDate))
                .successRate(calculateOrganizationSuccessRateInRange(organizationId, startDate, endDate))
                .build();
    }

    @Override
    public EventStatisticsResponse getVolunteerDashboardStats(String volunteerId) {
        return EventStatisticsResponse.builder()
                .participantCount(calculateVolunteerEventCount(volunteerId))
                .averageRating(calculateVolunteerAverageRating(volunteerId))
                .totalVolunteerHours(calculateVolunteerTotalHours(volunteerId))
                .successRate(calculateVolunteerSuccessRate(volunteerId))
                .build();
    }

    @Override
    public EventStatisticsResponse getVolunteerDashboardStatsByDateRange(
            String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        return EventStatisticsResponse.builder()
                .participantCount(calculateVolunteerEventCountInRange(volunteerId, startDate, endDate))
                .averageRating(calculateVolunteerAverageRatingInRange(volunteerId, startDate, endDate))
                .totalVolunteerHours(calculateVolunteerHoursInRange(volunteerId, startDate, endDate))
                .successRate(calculateVolunteerSuccessRateInRange(volunteerId, startDate, endDate))
                .build();
    }

    @Override
    public double calculateVolunteerReliabilityScore(String volunteerId) {
        // Implementation to calculate volunteer reliability score
        return 0.0;
    }

    @Override
    public double calculateOrganizationRating(String organizationId) {
        // Implementation to calculate organization rating
        return 0.0;
    }

    @Override
    public Map<String, Double> calculateEventSuccessMetrics(String eventId) {
        // Implementation to calculate event success metrics
        return new HashMap<>();
    }

    @Override
    public Map<String, List<Double>> calculateEventTrends(String organizationId, String metric, int months) {
        // Implementation to calculate event trends
        return new HashMap<>();
    }

    @Override
    public Map<String, Double> calculateGrowthRates(String organizationId) {
        // Implementation to calculate growth rates
        return new HashMap<>();
    }

    @Override
    public Map<String, Integer> getEventDistributionByCategory(String organizationId) {
        // Implementation to get event distribution by category
        return new HashMap<>();
    }

    @Override
    public Map<String, Double> calculateImpactMetrics(String organizationId) {
        // Implementation to calculate impact metrics
        return new HashMap<>();
    }

    @Override
    public double calculateSocialImpactScore(String organizationId) {
        // Implementation to calculate social impact score
        return 0.0;
    }

    @Override
    public Map<String, Object> generateImpactSummary(String organizationId) {
        // Implementation to generate impact summary
        return new HashMap<>();
    }

    @Override
    public double calculateVolunteerEngagementRate(String volunteerId) {
        // Implementation to calculate volunteer engagement rate
        return 0.0;
    }

    @Override
    public double calculateOrganizationEngagementRate(String organizationId) {
        // Implementation to calculate organization engagement rate
        return 0.0;
    }

    @Override
    public Map<String, Double> calculateEngagementTrends(String organizationId) {
        // Implementation to calculate engagement trends
        return new HashMap<>();
    }

    @Override
    public Map<String, Integer> analyzeParticipationTrends(String organizationId) {
        // Implementation to analyze participation trends
        return new HashMap<>();
    }

    @Override
    public double calculateAverageParticipationRate(String organizationId) {
        // Implementation to calculate average participation rate
        return 0.0;
    }

    @Override
    public Map<String, Object> generateParticipationInsights(String organizationId) {
        // Implementation to generate participation insights
        return new HashMap<>();
    }

    @Override
    public Map<String, Double> calculatePerformanceMetrics(String organizationId) {
        // Implementation to calculate performance metrics
        return new HashMap<>();
    }

    @Override
    public double calculateOverallPerformanceScore(String organizationId) {
        // Implementation to calculate overall performance score
        return 0.0;
    }

    @Override
    public Map<String, Object> generatePerformanceReport(String organizationId) {
        // Implementation to generate performance report
        return new HashMap<>();
    }

    @Override
    public VolunteerStatsResponse getVolunteerStatistics(String volunteerId) {
        // Add null safety checks when filtering events
        List<Event> allEvents = eventRepository.findEventsByParticipant(volunteerId);
        
        // Filter out any null events for safety
        allEvents = allEvents.stream()
            .filter(event -> event != null)
            .collect(Collectors.toList());
            
        List<Event> completedEvents = allEvents.stream()
            .filter(event -> event.getStatus() != null && EventStatus.COMPLETED.equals(event.getStatus()))
            .collect(Collectors.toList());
            
        List<Event> upcomingEvents = allEvents.stream()
            .filter(event -> event.getStatus() != null && 
                   EventStatus.ACTIVE.equals(event.getStatus()) && 
                   event.getStartDate() != null &&
                   event.getStartDate().isAfter(LocalDateTime.now()))
            .collect(Collectors.toList());
            
        List<Event> canceledEvents = allEvents.stream()
            .filter(event -> event.getStatus() != null && EventStatus.FULL.equals(event.getStatus()))
            .collect(Collectors.toList());

        // Calculate total hours with null safety
        int totalHours = completedEvents.stream()
            .filter(event -> event != null && event.getStartDate() != null && event.getEndDate() != null)
            .mapToInt(this::calculateEventHours)
            .sum();

        // Calculate average hours per event
        double avgHoursPerEvent = completedEvents.isEmpty() ? 0 :
            (double) totalHours / completedEvents.size();

        // Calculate hours by month with null safety
        Map<String, Integer> hoursByMonth = completedEvents.stream()
            .filter(event -> event.getStartDate() != null)
            .collect(Collectors.groupingBy(
                event -> event.getStartDate().getMonth().toString(),
                Collectors.summingInt(this::calculateEventHours)
            ));

        // Calculate events by category with null safety
        Map<String, Integer> eventsByCategory = completedEvents.stream()
            .filter(event -> event.getCategory() != null)
            .collect(Collectors.groupingBy(
                event -> event.getCategory().toString(),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));

        // Calculate average rating
        double averageRating = feedbackRepository.findByVolunteerId(volunteerId, Pageable.unpaged())
            .stream()
            .mapToDouble(EventFeedback::getRating)
            .average()
            .orElse(0.0);

        // Calculate reliability score
        int reliabilityScore = calculateReliabilityScore(volunteerId, allEvents);

        // Calculate growth rates
        double participationGrowthRate = calculateParticipationGrowthRate(volunteerId);
        double hoursGrowthRate = calculateHoursGrowthRate(volunteerId);

        // Calculate organizations worked with
        int organizationsWorkedWith = calculateOrganizationsWorkedWith(allEvents);

        // Calculate participation by day of week
        Map<String, Integer> participationByDay = calculateParticipationByDay(allEvents);

        return VolunteerStatsResponse.builder()
            .totalEventsAttended(allEvents.size())
            .completedEvents(completedEvents.size())
            .upcomingEvents(upcomingEvents.size())
            .canceledEvents(canceledEvents.size())
            .totalHoursVolunteered(totalHours)
            .averageHoursPerEvent(avgHoursPerEvent)
            .hoursByMonth(hoursByMonth)
            .eventsByCategory(eventsByCategory)
            .averageRating(averageRating)
            .reliabilityScore(reliabilityScore)
            .participationGrowthRate(participationGrowthRate)
            .hoursGrowthRate(hoursGrowthRate)
            .organizationsWorkedWith(organizationsWorkedWith)
            .participationByDay(participationByDay)
            .build();
    }

    // Private helper methods
    private long calculateTotalParticipants() {
        return eventRepository.findAll().stream()
                .mapToLong(event -> event.getRegisteredParticipants().size())
                .sum();
    }

    private double calculateOverallAverageRating() {
        return feedbackRepository.findAll().stream()
                .mapToDouble(feedback -> feedback.getRating())
                .average()
                .orElse(0.0);
    }

    private int calculateTotalVolunteerHours() {
        return eventRepository.findAll().stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .mapToInt(this::calculateEventHours)
                .sum();
    }

    private int calculateEventHours(Event event) {
        if (event == null || event.getStartDate() == null || event.getEndDate() == null) {
            return 0;
        }
        
        try {
            long hours = java.time.Duration.between(event.getStartDate(), event.getEndDate()).toHours();
            return (int) Math.max(hours, 0);
        } catch (Exception e) {
            // Log exception and return 0 for safety
            return 0;
        }
    }

    private double calculateOverallSuccessRate() {
        List<Event> completedEvents = eventRepository.findAll().stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .collect(Collectors.toList());
        if (completedEvents.isEmpty()) {
            return 0.0;
        }
        
        return completedEvents.stream()
                .mapToDouble(event -> calculateEventSuccessRate(event.getId()))
                .average()
                .orElse(0.0);
    }

    private long calculateTotalParticipantsInRange(LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findByStartDateBetween(startDate, endDate, Pageable.unpaged())
                .getContent().stream()
                .mapToLong(event -> event.getRegisteredParticipants().size())
                .sum();
    }

    private double calculateAverageRatingInRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Event> events = eventRepository.findByStartDateBetween(startDate, endDate, Pageable.unpaged())
                .getContent();
        if (events.isEmpty()) {
            return 0.0;
        }
        
        return events.stream()
                .mapToDouble(Event::getAverageRating)
                .average()
                .orElse(0.0);
    }

    private int calculateVolunteerHoursInRange(LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findByStartDateBetween(startDate, endDate, Pageable.unpaged())
                .getContent().stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .mapToInt(this::calculateEventHours)
                .sum();
    }

    private double calculateSuccessRateInRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Event> events = eventRepository.findByStartDateBetween(startDate, endDate, Pageable.unpaged())
                .getContent().stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .collect(Collectors.toList());
        if (events.isEmpty()) {
            return 0.0;
        }
        
        return events.stream()
                .mapToDouble(event -> calculateEventSuccessRate(event.getId()))
                .average()
                .orElse(0.0);
    }

    private long calculateOrganizationParticipants(String organizationId) {
        return eventRepository.findByOrganizationId(organizationId, null)
                .stream()
                .mapToLong(event -> event.getRegisteredParticipants().size())
                .sum();
    }

    private double calculateOrganizationAverageRating(String organizationId) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged());
        if (events.isEmpty()) {
            return 0.0;
        }
        
        return events.stream()
                .mapToDouble(Event::getAverageRating)
                .average()
                .orElse(0.0);
    }

    private int calculateOrganizationVolunteerHours(String organizationId) {
        return eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .mapToInt(this::calculateEventHours)
                .sum();
    }

    private double calculateOrganizationSuccessRate(String organizationId) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .collect(Collectors.toList());
        if (events.isEmpty()) {
            return 0.0;
        }
        
        return (double) events.size() / eventRepository.findByOrganizationId(organizationId, Pageable.unpaged()).size() * 100;
    }

    private long calculateOrganizationParticipantsInRange(
            String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStartDate().isAfter(startDate) && 
                               event.getStartDate().isBefore(endDate))
                .mapToLong(event -> event.getRegisteredParticipants().size())
                .sum();
    }

    private double calculateOrganizationAverageRatingInRange(
            String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStartDate().isAfter(startDate) && 
                               event.getStartDate().isBefore(endDate))
                .collect(Collectors.toList());
        if (events.isEmpty()) {
            return 0.0;
        }
        
        return events.stream()
                .mapToDouble(Event::getAverageRating)
                .average()
                .orElse(0.0);
    }

    private int calculateOrganizationVolunteerHoursInRange(
            String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED &&
                               event.getStartDate().isAfter(startDate) && 
                               event.getStartDate().isBefore(endDate))
                .mapToInt(this::calculateEventHours)
                .sum();
    }

    private double calculateOrganizationSuccessRateInRange(
            String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Event> events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED &&
                               event.getStartDate().isAfter(startDate) && 
                               event.getStartDate().isBefore(endDate))
                .collect(Collectors.toList());
        if (events.isEmpty()) {
            return 0.0;
        }
        
        long totalEvents = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .stream()
                .filter(event -> event.getStartDate().isAfter(startDate) && 
                               event.getStartDate().isBefore(endDate))
                .count();
        return totalEvents > 0 ? (double) events.size() / totalEvents * 100 : 0.0;
    }

    private int calculateVolunteerEventCount(String volunteerId) {
        return eventRepository.findEventsByParticipant(volunteerId).size();
    }

    private double calculateVolunteerAverageRating(String volunteerId) {
        return feedbackRepository.findByVolunteerId(volunteerId, Pageable.unpaged()).stream()
            .mapToDouble(feedback -> feedback.getRating())
            .average()
            .orElse(0.0);
    }

    private int calculateVolunteerTotalHours(String volunteerId) {
        return eventRepository.findEventsByParticipant(volunteerId).stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .mapToInt(this::calculateEventHours)
                .sum();
    }

    private double calculateVolunteerSuccessRate(String volunteerId) {
        List<Event> events = eventRepository.findEventsByParticipant(volunteerId);
        if (events.isEmpty()) {
            return 0.0;
        }
        
        long completedEvents = events.stream()
            .filter(event -> event.getStatus() == EventStatus.COMPLETED)
            .count();
            
        return (double) completedEvents / events.size() * 100;
    }

    private int calculateVolunteerEventCountInRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findEventsByParticipantAndDateRange(volunteerId, startDate, endDate).size();
    }

    private double calculateVolunteerAverageRatingInRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        return feedbackRepository.findByVolunteerIdAndDateRange(volunteerId, startDate, endDate, Pageable.unpaged()).stream()
            .mapToDouble(feedback -> feedback.getRating())
            .average()
            .orElse(0.0);
    }

    private int calculateVolunteerHoursInRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findEventsByParticipantAndDateRange(volunteerId, startDate, endDate).stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .mapToInt(this::calculateEventHours)
                .sum();
    }

    private double calculateVolunteerSuccessRateInRange(String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Event> events = eventRepository.findEventsByParticipantAndDateRange(volunteerId, startDate, endDate);
        if (events.isEmpty()) {
            return 0.0;
        }
        
        long completedEvents = events.stream()
            .filter(event -> event.getStatus() == EventStatus.COMPLETED)
            .count();
            
        return (double) completedEvents / events.size() * 100;
    }

    private int calculateReliabilityScore(String volunteerId, List<Event> events) {
        if (events == null || events.isEmpty()) {
            return 100;
        }

        // Filter out events with null status
        List<Event> validEvents = events.stream()
            .filter(event -> event != null && event.getStatus() != null)
            .collect(Collectors.toList());
            
        if (validEvents.isEmpty()) {
            return 100;
        }

        int totalEvents = validEvents.size();
        int completedEvents = (int) validEvents.stream()
            .filter(event -> EventStatus.COMPLETED.equals(event.getStatus()))
            .count();
        int canceledEvents = (int) validEvents.stream()
            .filter(event -> EventStatus.FULL.equals(event.getStatus()))
            .count();

        // Base score starts at 100
        int score = 100;

        // Deduct points for cancellations (more weight)
        score -= (canceledEvents * 15);

        // Add points for completed events
        score += (completedEvents * 5);

        // Normalize score between 0 and 100
        return Math.min(Math.max(score, 0), 100);
    }

    private double calculateParticipationGrowthRate(String volunteerId) {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Event> recentEvents = eventRepository.findEventsByParticipantAndDateRange(
            volunteerId, sixMonthsAgo, LocalDateTime.now());

        if (recentEvents == null || recentEvents.isEmpty()) {
            return 0.0;
        }

        // Filter out null events
        recentEvents = recentEvents.stream()
            .filter(event -> event != null && event.getStartDate() != null)
            .collect(Collectors.toList());
            
        if (recentEvents.isEmpty()) {
            return 0.0;
        }

        // Group events by month
        Map<Integer, Integer> eventsByMonth = new HashMap<>();
        for (Event event : recentEvents) {
            try {
                int month = event.getStartDate().getMonthValue();
                eventsByMonth.put(month, eventsByMonth.getOrDefault(month, 0) + 1);
            } catch (Exception e) {
                // Skip events with date issues
            }
        }

        if (eventsByMonth.size() <= 1) {
            return 0.0;
        }

        // Calculate average monthly growth
        List<Integer> months = new ArrayList<>(eventsByMonth.keySet());
        months.sort(Integer::compare);

        double growth = 0.0;
        double count = 0.0;
        for (int i = 1; i < months.size(); i++) {
            int prevMonth = months.get(i - 1);
            int currMonth = months.get(i);
            
            int prevEvents = eventsByMonth.get(prevMonth);
            int currEvents = eventsByMonth.get(currMonth);
            
            if (prevEvents > 0) {
                double monthGrowth = (double)(currEvents - prevEvents) / prevEvents;
                growth += monthGrowth;
                count++;
            }
        }

        return count > 0 ? growth / count : 0.0;
    }

    private double calculateHoursGrowthRate(String volunteerId) {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Event> recentEvents = eventRepository.findEventsByParticipantAndDateRange(
            volunteerId, sixMonthsAgo, LocalDateTime.now());

        if (recentEvents == null || recentEvents.isEmpty()) {
            return 0.0;
        }
        
        // Filter out null events
        recentEvents = recentEvents.stream()
            .filter(event -> event != null && event.getStartDate() != null && event.getEndDate() != null)
            .collect(Collectors.toList());
            
        if (recentEvents.isEmpty()) {
            return 0.0;
        }

        // Group hours by month
        Map<Integer, Integer> hoursByMonth = new HashMap<>();
        for (Event event : recentEvents) {
            try {
                int month = event.getStartDate().getMonthValue();
                int hours = calculateEventHours(event);
                hoursByMonth.put(month, hoursByMonth.getOrDefault(month, 0) + hours);
            } catch (Exception e) {
                // Skip events with date issues
            }
        }

        if (hoursByMonth.size() <= 1) {
            return 0.0;
        }

        // Calculate average monthly growth
        List<Integer> months = new ArrayList<>(hoursByMonth.keySet());
        months.sort(Integer::compare);

        double growth = 0.0;
        double count = 0.0;
        for (int i = 1; i < months.size(); i++) {
            int prevMonth = months.get(i - 1);
            int currMonth = months.get(i);
            
            int prevHours = hoursByMonth.get(prevMonth);
            int currHours = hoursByMonth.get(currMonth);
            
            if (prevHours > 0) {
                double monthGrowth = (double)(currHours - prevHours) / prevHours;
                growth += monthGrowth;
                count++;
            }
        }

        return count > 0 ? growth / count : 0.0;
    }

    private int calculateOrganizationsWorkedWith(List<Event> events) {
        if (events == null || events.isEmpty()) {
            return 0;
        }
        
        return (int) events.stream()
            .filter(event -> event != null && event.getOrganizationId() != null && !event.getOrganizationId().isEmpty())
            .map(Event::getOrganizationId)
            .distinct()
            .count();
    }

    private Map<String, Integer> calculateParticipationByDay(List<Event> events) {
        if (events == null || events.isEmpty()) {
            return new HashMap<>();
        }
        
        Map<String, Integer> participationByDay = new HashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            participationByDay.put(day.toString(), 0);
        }
        
        events.stream()
            .filter(event -> event != null && event.getStartDate() != null)
            .forEach(event -> {
                String dayOfWeek = event.getStartDate().getDayOfWeek().toString();
                participationByDay.put(dayOfWeek, participationByDay.getOrDefault(dayOfWeek, 0) + 1);
            });
            
        return participationByDay;
    }
} 