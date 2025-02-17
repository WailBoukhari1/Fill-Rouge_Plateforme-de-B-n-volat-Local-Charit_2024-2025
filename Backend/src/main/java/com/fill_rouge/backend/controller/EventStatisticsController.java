package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.dto.response.EventStatisticsResponse;
import com.fill_rouge.backend.service.event.EventStatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events/statistics")
@RequiredArgsConstructor
public class EventStatisticsController {

    private final EventStatisticsService statisticsService;
    // Admin Dashboard Endpoints
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventStatisticsResponse> getAdminDashboardStats() {
        return ResponseEntity.ok(statisticsService.getAdminDashboardStats());
    }

    @GetMapping("/admin/dashboard/range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventStatisticsResponse> getAdminDashboardStatsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(statisticsService.getAdminDashboardStatsByDateRange(start, end));
    }

    // Organization Dashboard Endpoints
    @GetMapping("/organization/{organizationId}/dashboard")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<EventStatisticsResponse> getOrganizationDashboardStats(
            @PathVariable String organizationId) {
        return ResponseEntity.ok(statisticsService.getOrganizationDashboardStats(organizationId));
    }

    @GetMapping("/organization/{organizationId}/dashboard/range")
    @PreAuthorize("hasRole('ORGANIZATION')")
    public ResponseEntity<EventStatisticsResponse> getOrganizationDashboardStatsByDateRange(
            @PathVariable String organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(statisticsService.getOrganizationDashboardStatsByDateRange(
                organizationId, start, end));
    }

    // Volunteer Dashboard Endpoints
    @GetMapping("/volunteer/{volunteerId}/dashboard")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<EventStatisticsResponse> getVolunteerDashboardStats(
            @PathVariable String volunteerId) {
        return ResponseEntity.ok(statisticsService.getVolunteerDashboardStats(volunteerId));
    }

    @GetMapping("/volunteer/{volunteerId}/dashboard/range")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<EventStatisticsResponse> getVolunteerDashboardStatsByDateRange(
            @PathVariable String volunteerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(statisticsService.getVolunteerDashboardStatsByDateRange(
                volunteerId, start, end));
    }

    // Specific Statistics Endpoints
    @GetMapping("/volunteer/{volunteerId}/reliability")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZATION')")
    public ResponseEntity<Double> getVolunteerReliabilityScore(@PathVariable String volunteerId) {
        return ResponseEntity.ok(statisticsService.calculateVolunteerReliabilityScore(volunteerId));
    }

    @GetMapping("/organization/{organizationId}/rating")
    public ResponseEntity<Double> getOrganizationRating(@PathVariable String organizationId) {
        return ResponseEntity.ok(statisticsService.calculateOrganizationRating(organizationId));
    }

    @GetMapping("/event/{eventId}/success-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZATION')")
    public ResponseEntity<Double> getEventSuccessRate(@PathVariable String eventId) {
        return ResponseEntity.ok(statisticsService.calculateEventSuccessRate(eventId));
    }
} 