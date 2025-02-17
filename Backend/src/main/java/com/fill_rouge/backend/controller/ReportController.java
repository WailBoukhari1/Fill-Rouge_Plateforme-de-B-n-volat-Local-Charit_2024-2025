package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.request.CustomReportRequest;
import com.fill_rouge.backend.dto.response.*;
import com.fill_rouge.backend.service.report.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Volunteer Reports
    @GetMapping("/volunteer/{volunteerId}")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<VolunteerReportResponse> getVolunteerReport(
            @PathVariable String volunteerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.generateVolunteerReport(volunteerId, startDate, endDate));
    }

    // Organization Reports
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<OrganizationReportResponse> getOrganizationReport(
            @PathVariable String organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.generateOrganizationReport(organizationId, startDate, endDate));
    }

    // Impact Reports
    @GetMapping("/impact")
    public ResponseEntity<ImpactReportResponse> getImpactReport(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.generateImpactReport(category, startDate, endDate));
    }

    // Skills and Matching Reports
    @GetMapping("/skills-matching")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SkillsMatchingReportResponse> getSkillsMatchingReport() {
        return ResponseEntity.ok(reportService.generateSkillsMatchingReport());
    }

    // Engagement Reports
    @GetMapping("/engagement")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EngagementReportResponse> getEngagementReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.generateEngagementReport(startDate, endDate));
    }

    // Custom Reports
    @PostMapping("/custom")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomReportResponse> generateCustomReport(
            @Valid @RequestBody CustomReportRequest request) {
        return ResponseEntity.ok(reportService.generateCustomReport(request));
    }

    // Export Reports
    @GetMapping("/export/volunteer/{volunteerId}")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<byte[]> exportVolunteerReport(
            @PathVariable String volunteerId,
            @RequestParam(defaultValue = "PDF") String format) {
        byte[] report = reportService.exportVolunteerReport(volunteerId, format);
        return ResponseEntity.ok()
                .header("Content-Type", getContentType(format))
                .header("Content-Disposition", "attachment; filename=volunteer-report." + format.toLowerCase())
                .body(report);
    }

    @GetMapping("/export/organization/{organizationId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<byte[]> exportOrganizationReport(
            @PathVariable String organizationId,
            @RequestParam(defaultValue = "PDF") String format) {
        byte[] report = reportService.exportOrganizationReport(organizationId, format);
        return ResponseEntity.ok()
                .header("Content-Type", getContentType(format))
                .header("Content-Disposition", "attachment; filename=organization-report." + format.toLowerCase())
                .body(report);
    }

    // Analytics Dashboard Data
    @GetMapping("/dashboard/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardOverviewResponse> getDashboardOverview() {
        return ResponseEntity.ok(reportService.generateDashboardOverview());
    }

    @GetMapping("/dashboard/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrendReportResponse>> getTrends(
            @RequestParam(required = false) String metric,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.generateTrendReport(metric, startDate, endDate));
    }

    private String getContentType(String format) {
        return switch (format.toUpperCase()) {
            case "PDF" -> "application/pdf";
            case "EXCEL" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "CSV" -> "text/csv";
            default -> "application/octet-stream";
        };
    }
} 