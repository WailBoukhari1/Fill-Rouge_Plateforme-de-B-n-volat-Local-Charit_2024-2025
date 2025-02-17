package com.fill_rouge.backend.service.report;

import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.dto.request.CustomReportRequest;
import com.fill_rouge.backend.dto.response.*;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.*;
import com.fill_rouge.backend.service.event.EventService;
import com.fill_rouge.backend.service.event.EventStatisticsService;
import com.fill_rouge.backend.service.volunteer.VolunteerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import com.fill_rouge.backend.util.ReportCalculationUtil;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final EventService eventService;
    private final EventStatisticsService eventStatisticsService;
    private final VolunteerProfileService volunteerProfileService;
    private final EventRepository eventRepository;
    private final VolunteerRepository volunteerRepository;
    private final OrganizationRepository organizationRepository;
    private final EventFeedbackRepository feedbackRepository;
    private final SkillRepository skillRepository;
    private final ReportExportService reportExportService;
    private final ReportRepository reportRepository;

    @Override
    @Cacheable(value = "volunteerReports", key = "#volunteerId + #startDate + #endDate")
    public VolunteerReportResponse generateVolunteerReport(String volunteerId, LocalDateTime startDate, LocalDateTime endDate) {
        var profile = volunteerProfileService.getVolunteerProfile(volunteerId);
        var stats = reportRepository.getVolunteerStats(volunteerId, startDate, endDate);
        
        Map<String, Object> basicStats = ReportCalculationUtil.calculateBasicStats(
            (Integer) stats.get("totalEvents"),
            (Double) stats.get("averageRating"),
            (Integer) stats.get("totalHours"),
            calculateVolunteerSuccessRate(volunteerId)
        );

        return VolunteerReportResponse.builder()
                .volunteerId(volunteerId)
                .volunteerName(profile.getVolunteer().getUser().getFirstName() + " " + 
                             profile.getVolunteer().getUser().getLastName())
                .totalEventsAttended((Integer) basicStats.get("participantCount"))
                .totalHoursContributed((Integer) basicStats.get("totalHours"))
                .averageRating((Double) basicStats.get("averageRating"))
                .topSkills(profile.getSkills().stream().collect(Collectors.toList()))
                .eventsByCategory(getEventsByCategory(volunteerId, startDate, endDate))
                .achievements(profile.getBadges())
                .reportGeneratedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .additionalStats(Map.of(
                    "reliabilityScore", eventStatisticsService.calculateVolunteerReliabilityScore(volunteerId),
                    "completionRate", calculateCompletionRate(volunteerId)
                ))
                .build();
    }

    @Override
    @Cacheable(value = "organizationReports", key = "#organizationId + #startDate + #endDate")
    public OrganizationReportResponse generateOrganizationReport(String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        var stats = reportRepository.getOrganizationAggregatedStats(organizationId, startDate, endDate);
        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        Map<String, Object> basicStats = ReportCalculationUtil.calculateBasicStats(
            (Integer) stats.get("totalParticipants"),
            (Double) stats.get("averageRating"),
            (Integer) stats.get("totalHours"),
            calculateOrganizationSuccessRate(organizationId)
        );

        return OrganizationReportResponse.builder()
                .organizationId(organizationId)
                .organizationName(organization.getName())
                .totalEventsHosted((Integer) stats.get("totalEvents"))
                .totalVolunteersEngaged((Integer) basicStats.get("participantCount"))
                .totalVolunteerHours((Integer) basicStats.get("totalHours"))
                .averageEventRating((Double) basicStats.get("averageRating"))
                .eventsByCategory(getEventsByCategory(organizationId, startDate, endDate))
                .mostRequestedSkills(getMostRequestedSkills(organizationId))
                .impactMetrics(calculateImpactMetrics(organizationId, startDate, endDate))
                .reportGeneratedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .additionalStats(Map.of(
                    "organizationRating", eventStatisticsService.calculateOrganizationRating(organizationId),
                    "volunteerRetentionRate", calculateVolunteerRetentionRate(organizationId)
                ))
                .build();
    }

    @Override
    @Cacheable(value = "impactReports", key = "#category + #startDate + #endDate")
    public ImpactReportResponse generateImpactReport(String category, LocalDateTime startDate, LocalDateTime endDate) {
        var categoryStats = reportRepository.getCategoryStats(startDate, endDate);
        Map<String, Double> metrics = ReportCalculationUtil.calculateCommonMetrics(categoryStats);

        return ImpactReportResponse.builder()
                .totalVolunteers((int) volunteerRepository.count())
                .totalOrganizations((int) organizationRepository.count())
                .totalEvents(categoryStats.stream().mapToInt(stat -> (Integer) stat.get("count")).sum())
                .totalVolunteerHours(calculateTotalVolunteerHours(startDate, endDate))
                .impactByCategory(ReportCalculationUtil.convertCategoryStats(categoryStats))
                .keyMetrics(metrics)
                .reportGeneratedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .build();
    }

    @Override
    @Async("reportTaskExecutor")
    public CompletableFuture<byte[]> exportVolunteerReportAsync(String volunteerId, String format) {
        return CompletableFuture.completedFuture(exportVolunteerReport(volunteerId, format));
    }

    @Override
    @Async("reportTaskExecutor")
    public CompletableFuture<byte[]> exportOrganizationReportAsync(String organizationId, String format) {
        return CompletableFuture.completedFuture(exportOrganizationReport(organizationId, format));
    }

    @Override
    @Cacheable(value = "dashboardReports")
    public DashboardOverviewResponse generateDashboardOverview() {
        Map<String, Object> metrics = ReportCalculationUtil.calculateBasicStats(
            calculateTotalParticipants(),
            calculateOverallAverageRating(),
            calculateTotalVolunteerHours(),
            calculateOverallSuccessRate()
        );

        return DashboardOverviewResponse.builder()
                .userStats(calculateUserStats())
                .eventStats(calculateEventStats())
                .impactMetrics(calculateImpactMetrics())
                .recentActivities(getRecentActivities())
                .trends(calculateTrends())
                .keyPerformanceIndicators(calculateKPIs())
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    @Scheduled(cron = "0 0 * * * *") // Every hour
    @CacheEvict(value = {
        "volunteerReports", 
        "organizationReports", 
        "impactReports", 
        "dashboardReports", 
        "customReports"
    }, allEntries = true)
    public void clearReportCache() {
        // Cache is cleared automatically by the annotation
    }

    @Override
    @Cacheable(value = "customReports", key = "#request.toString()")
    public CustomReportResponse generateCustomReport(CustomReportRequest request) {
        return CustomReportResponse.builder()
                .id(UUID.randomUUID().toString())
                .generatedAt(LocalDateTime.now())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .metrics(request.getMetrics())
                .data(generateCustomReportData(request))
                .build();
    }

    @Override
    @Cacheable(value = "skillsReports")
    public SkillsMatchingReportResponse generateSkillsMatchingReport() {
        return SkillsMatchingReportResponse.builder()
                .id(UUID.randomUUID().toString())
                .generatedAt(LocalDateTime.now())
                .skillDemand(calculateSkillDemand())
                .skillSupply(calculateSkillSupply())
                .matchingMetrics(calculateSkillMatchingMetrics())
                .build();
    }

    @Override
    @Cacheable(value = "engagementReports", key = "#startDate + #endDate")
    public EngagementReportResponse generateEngagementReport(LocalDateTime startDate, LocalDateTime endDate) {
        return EngagementReportResponse.builder()
                .id(UUID.randomUUID().toString())
                .generatedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .engagementMetrics(calculateEngagementMetrics(startDate, endDate))
                .participationTrends(analyzeParticipationTrends(startDate, endDate))
                .topEngagedVolunteers(getTopEngagedVolunteers(startDate, endDate))
                .topEngagedOrganizations(getTopEngagedOrganizations(startDate, endDate))
                .build();
    }

    @Override
    @Cacheable(value = "trendReports", key = "#metric + #startDate + #endDate")
    public List<TrendReportResponse> generateTrendReport(String metric, LocalDateTime startDate, LocalDateTime endDate) {
        return calculateTrendData(metric, startDate, endDate);
    }

    @Override
    public byte[] exportVolunteerReport(String volunteerId, String format) {
        VolunteerReportResponse report = generateVolunteerReport(volunteerId, LocalDateTime.now().minusMonths(1), LocalDateTime.now());
        return reportExportService.exportVolunteerReport(report, format);
    }

    @Override
    public byte[] exportOrganizationReport(String organizationId, String format) {
        OrganizationReportResponse report = generateOrganizationReport(organizationId, LocalDateTime.now().minusMonths(1), LocalDateTime.now());
        return reportExportService.exportOrganizationReport(report, format);
    }

    @Override
    public Page<ReportResponse> getReports(Pageable pageable) {
        return reportRepository.findAll(pageable)
                .map(this::convertToReportResponse);
    }

    @Override
    public Page<ReportResponse> getReportsByType(String type, Pageable pageable) {
        return reportRepository.findByType(type, pageable)
                .map(this::convertToReportResponse);
    }

    @Override
    public Page<ReportResponse> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return reportRepository.findByGeneratedAtBetween(startDate, endDate, pageable)
                .map(this::convertToReportResponse);
    }

    private Map<String, Object> generateCustomReportData(CustomReportRequest request) {
        // Implementation for generating custom report data
        return new HashMap<>();
    }

    private Map<String, Integer> calculateSkillDemand() {
        return eventRepository.findAll().stream()
                .flatMap(event -> event.getRequiredSkills().stream())
                .collect(Collectors.groupingBy(
                    skill -> skill,
                    Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    private Map<String, Integer> calculateSkillSupply() {
        return volunteerRepository.findAll().stream()
                .flatMap(volunteer -> volunteer.getSkills().stream())
                .collect(Collectors.groupingBy(
                    skill -> skill,
                    Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    private Map<String, Double> calculateSkillMatchingMetrics() {
        Map<String, Integer> demand = calculateSkillDemand();
        Map<String, Integer> supply = calculateSkillSupply();
        Map<String, Double> metrics = new HashMap<>();
        
        demand.forEach((skill, demandCount) -> {
            int supplyCount = supply.getOrDefault(skill, 0);
            metrics.put(skill, supplyCount / (double) demandCount);
        });
        
        return metrics;
    }

    private Map<String, Object> calculateEngagementMetrics(LocalDateTime startDate, LocalDateTime endDate) {
        return Map.of(
            "activeVolunteers", calculateActiveVolunteers(startDate, endDate),
            "averageParticipationRate", calculateAverageParticipationRate(startDate, endDate),
            "retentionRate", calculateRetentionRate(startDate, endDate)
        );
    }

    private Map<String, List<Double>> analyzeParticipationTrends(LocalDateTime startDate, LocalDateTime endDate) {
        return Map.of(
            "daily", calculateDailyParticipation(startDate, endDate),
            "weekly", calculateWeeklyParticipation(startDate, endDate),
            "monthly", calculateMonthlyParticipation(startDate, endDate)
        );
    }

    private List<Map<String, Object>> getTopEngagedVolunteers(LocalDateTime startDate, LocalDateTime endDate) {
        return reportRepository.getTopVolunteers(startDate, endDate);
    }

    private List<Map<String, Object>> getTopEngagedOrganizations(LocalDateTime startDate, LocalDateTime endDate) {
        return reportRepository.getTopOrganizations(startDate, endDate);
    }

    private List<TrendReportResponse> calculateTrendData(String metric, LocalDateTime startDate, LocalDateTime endDate) {
        return switch (metric.toLowerCase()) {
            case "participation" -> calculateParticipationTrend(startDate, endDate);
            case "engagement" -> calculateEngagementTrend(startDate, endDate);
            case "impact" -> calculateImpactTrend(startDate, endDate);
            default -> throw new IllegalArgumentException("Unsupported metric: " + metric);
        };
    }

    private ReportResponse convertToReportResponse(Object report) {
        return ReportResponse.builder()
                .id(UUID.randomUUID().toString())
                .type("REPORT")
                .name("Generated Report")
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private Map<String, Integer> calculateUserStats() {
        return Map.of(
            "totalVolunteers", (int) volunteerRepository.count(),
            "totalOrganizations", (int) organizationRepository.count(),
            "activeUsers", calculateActiveUsers()
        );
    }

    private Map<String, Integer> calculateEventStats() {
        return Map.of(
            "totalEvents", (int) eventRepository.count(),
            "upcomingEvents", countUpcomingEvents(),
            "completedEvents", countCompletedEvents()
        );
    }

    private Map<String, Double> calculateImpactMetrics() {
        return Map.of(
            "totalHours", (double) calculateTotalVolunteerHours(LocalDateTime.now().minusMonths(1), LocalDateTime.now()),
            "averageRating", calculateAverageRating(),
            "successRate", calculateSuccessRate()
        );
    }

    private List<Map<String, Object>> getRecentActivities() {
        return reportRepository.getDailyParticipationStats(
            LocalDateTime.now().minusDays(7),
            LocalDateTime.now()
        );
    }

    private Map<String, List<Double>> calculateTrends() {
        // Implementation for calculating trends
        return new HashMap<>();
    }

    private Map<String, Object> calculateKPIs() {
        return Map.of(
            "topVolunteers", getTopEngagedVolunteers(LocalDateTime.now().minusMonths(1), LocalDateTime.now()),
            "topOrganizations", getTopEngagedOrganizations(LocalDateTime.now().minusMonths(1), LocalDateTime.now())
        );
    }

    private int calculateActiveUsers() {
        // Implementation for calculating active users
        return 0;
    }

    private int countUpcomingEvents() {
        // Implementation for counting upcoming events
        return 0;
    }

    private int countCompletedEvents() {
        // Implementation for counting completed events
        return 0;
    }

    private double calculateAverageRating() {
        // Implementation for calculating average rating
        return 0.0;
    }

    private double calculateSuccessRate() {
        // Implementation for calculating success rate
        return 0.0;
    }

    private int calculateTotalVolunteerHours(LocalDateTime startDate, LocalDateTime endDate) {
        return feedbackRepository.findAll().stream()
                .filter(feedback -> {
                    LocalDateTime submittedAt = feedback.getSubmittedAt();
                    return submittedAt.isAfter(startDate) && submittedAt.isBefore(endDate);
                })
                .mapToInt(feedback -> feedback.getHoursContributed())
                .sum();
    }

    private double calculateCompletionRate(String volunteerId) {
        // Implementation for calculating completion rate
        return 0.0;
    }

    private List<String> getMostRequestedSkills(String organizationId) {
        // Implementation for getting most requested skills
        return new ArrayList<>();
    }

    private Map<String, Double> calculateImpactMetrics(String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating impact metrics
        return new HashMap<>();
    }

    private double calculateVolunteerRetentionRate(String organizationId) {
        // Implementation for calculating volunteer retention rate
        return 0.0;
    }

    private Map<String, Integer> getEventsByCategory(String id, LocalDateTime startDate, LocalDateTime endDate) {
        var categoryStats = reportRepository.getCategoryStats(startDate, endDate);
        return ReportCalculationUtil.convertCategoryStats(categoryStats);
    }

    private List<Double> calculateDailyParticipation(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating daily participation
        return new ArrayList<>();
    }

    private List<Double> calculateWeeklyParticipation(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating weekly participation
        return new ArrayList<>();
    }

    private List<Double> calculateMonthlyParticipation(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating monthly participation
        return new ArrayList<>();
    }

    private List<TrendReportResponse> calculateParticipationTrend(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating participation trend
        return new ArrayList<>();
    }

    private List<TrendReportResponse> calculateEngagementTrend(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating engagement trend
        return new ArrayList<>();
    }

    private List<TrendReportResponse> calculateImpactTrend(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating impact trend
        return new ArrayList<>();
    }

    private int calculateActiveVolunteers(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating active volunteers
        return 0;
    }

    private double calculateAverageParticipationRate(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating average participation rate
        return 0.0;
    }

    private double calculateRetentionRate(LocalDateTime startDate, LocalDateTime endDate) {
        // Implementation for calculating retention rate
        return 0.0;
    }

    private Map<String, Double> calculateKeyMetrics(List<Map<String, Object>> categoryStats) {
        return Map.of(
            "totalParticipation", (double) categoryStats.stream()
                .mapToInt(stat -> (Integer) stat.get("totalParticipants"))
                .sum(),
            "averageRating", categoryStats.stream()
                .mapToDouble(stat -> (Double) stat.get("averageRating"))
                .average()
                .orElse(0.0)
        );
    }

    private double calculateVolunteerSuccessRate(String volunteerId) {
        var events = reportRepository.findVolunteerEvents(volunteerId, Pageable.unpaged());
        long completedEvents = events.stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .count();
        return events.getTotalElements() > 0 ? 
               (double) completedEvents / events.getTotalElements() * 100 : 0.0;
    }

    private double calculateOrganizationSuccessRate(String organizationId) {
        var events = eventRepository.findByOrganizationId(organizationId, Pageable.unpaged());
        long completedEvents = events.stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .count();
        return events.getTotalElements() > 0 ? 
               (double) completedEvents / events.getTotalElements() * 100 : 0.0;
    }

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
        return calculateTotalVolunteerHours(
            LocalDateTime.now().minusMonths(1),
            LocalDateTime.now()
        );
    }

    private double calculateOverallSuccessRate() {
        var events = eventRepository.findAll();
        long completedEvents = events.stream()
                .filter(event -> event.getStatus() == EventStatus.COMPLETED)
                .count();
        return events.size() > 0 ? (double) completedEvents / events.size() * 100 : 0.0;
    }
} 