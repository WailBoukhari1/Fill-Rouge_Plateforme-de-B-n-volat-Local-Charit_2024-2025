package com.fill_rouge.backend.service.report;

import com.fill_rouge.backend.dto.request.CustomReportRequest;
import com.fill_rouge.backend.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface ReportService {
    // Core Report Generation
    VolunteerReportResponse generateVolunteerReport(String volunteerId, LocalDateTime startDate, LocalDateTime endDate);
    OrganizationReportResponse generateOrganizationReport(String organizationId, LocalDateTime startDate, LocalDateTime endDate);
    ImpactReportResponse generateImpactReport(String category, LocalDateTime startDate, LocalDateTime endDate);
    SkillsMatchingReportResponse generateSkillsMatchingReport();
    EngagementReportResponse generateEngagementReport(LocalDateTime startDate, LocalDateTime endDate);
    
    // Custom Reports
    CustomReportResponse generateCustomReport(CustomReportRequest request);
    
    // Report Export
    byte[] exportVolunteerReport(String volunteerId, String format);
    byte[] exportOrganizationReport(String organizationId, String format);
    CompletableFuture<byte[]> exportVolunteerReportAsync(String volunteerId, String format);
    CompletableFuture<byte[]> exportOrganizationReportAsync(String organizationId, String format);
    
    // Dashboard & Analytics
    DashboardOverviewResponse generateDashboardOverview();
    List<TrendReportResponse> generateTrendReport(String metric, LocalDateTime startDate, LocalDateTime endDate);
    
    // Paginated Report Access
    Page<ReportResponse> getReports(Pageable pageable);
    Page<ReportResponse> getReportsByType(String type, Pageable pageable);
    Page<ReportResponse> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
} 