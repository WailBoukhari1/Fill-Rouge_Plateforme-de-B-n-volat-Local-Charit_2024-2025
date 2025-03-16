import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsResponse } from '../../core/models/statistics.model';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  statistics: StatisticsResponse;
  loading = true;
  error: string | null = null;
  charts: { [key: string]: Chart } = {};

  constructor(
    private statisticsService: StatisticsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User ID not found';
      this.loading = false;
      return;
    }

    this.statisticsService.getStatistics(userId).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
        this.renderCharts();
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.error = 'Failed to load statistics';
        this.loading = false;
      }
    });
  }

  private renderCharts() {
    switch (this.statistics.userRole) {
      case 'ADMIN':
        this.renderAdminCharts();
        break;
      case 'ORGANIZATION':
        this.renderOrganizationCharts();
        break;
      case 'VOLUNTEER':
        this.renderVolunteerCharts();
        break;
    }
  }

  private renderAdminCharts() {
    if (!this.statistics.adminStats) return;

    const stats = this.statistics.adminStats;

    // User Growth Chart
    this.createLineChart('userGrowth', {
      ...this.statisticsService.transformTimeSeriesData(stats.userGrowth),
      options: {
        responsive: true,
        title: { display: true, text: 'User Growth Over Time' }
      }
    });

    // Events by Category Chart
    this.createPieChart('eventsByCategory', {
      ...this.statisticsService.transformCategoryData(stats.eventsByCategory),
      options: {
        responsive: true,
        title: { display: true, text: 'Events by Category' }
      }
    });

    // Volunteers by Location Chart
    this.createBarChart('volunteersByLocation', {
      ...this.statisticsService.transformCategoryData(stats.volunteersByLocation),
      options: {
        responsive: true,
        title: { display: true, text: 'Volunteers by Location' }
      }
    });
  }

  private renderOrganizationCharts() {
    if (!this.statistics.organizationStats) return;

    const stats = this.statistics.organizationStats;

    // Event Trends Chart
    this.createLineChart('eventTrends', {
      ...this.statisticsService.transformTimeSeriesData(stats.eventTrends),
      options: {
        responsive: true,
        title: { display: true, text: 'Event Trends' }
      }
    });

    // Volunteer Trends Chart
    this.createLineChart('volunteerTrends', {
      ...this.statisticsService.transformTimeSeriesData(stats.volunteerTrends),
      options: {
        responsive: true,
        title: { display: true, text: 'Volunteer Participation Trends' }
      }
    });

    // Events by Category Chart
    this.createPieChart('eventsByCategory', {
      ...this.statisticsService.transformCategoryData(stats.eventsByCategory),
      options: {
        responsive: true,
        title: { display: true, text: 'Events by Category' }
      }
    });

    // Volunteers by Skill Chart
    this.createBarChart('volunteersBySkill', {
      ...this.statisticsService.transformCategoryData(stats.volunteersBySkill),
      options: {
        responsive: true,
        title: { display: true, text: 'Volunteers by Skill' }
      }
    });
  }

  private renderVolunteerCharts() {
    if (!this.statistics.volunteerStats) return;

    const stats = this.statistics.volunteerStats;

    // Hours Contributed Chart
    this.createLineChart('hoursContributed', {
      ...this.statisticsService.transformTimeSeriesData(stats.hoursContributed),
      options: {
        responsive: true,
        title: { display: true, text: 'Hours Contributed Over Time' }
      }
    });

    // Events Participation Chart
    this.createLineChart('eventsParticipation', {
      ...this.statisticsService.transformTimeSeriesData(stats.eventsParticipation),
      options: {
        responsive: true,
        title: { display: true, text: 'Event Participation Over Time' }
      }
    });

    // Events by Category Chart
    this.createPieChart('eventsByCategory', {
      ...this.statisticsService.transformCategoryData(stats.eventsByCategory),
      options: {
        responsive: true,
        title: { display: true, text: 'Events by Category' }
      }
    });

    // Impact by Category Chart
    this.createBarChart('impactByCategory', {
      ...this.statisticsService.transformCategoryData(stats.impactByCategory),
      options: {
        responsive: true,
        title: { display: true, text: 'Impact by Category' }
      }
    });
  }

  private createLineChart(id: string, config: any) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    if (this.charts[id]) {
      this.charts[id].destroy();
    }

    this.charts[id] = new Chart(ctx, {
      type: 'line',
      data: config.data,
      options: config.options
    });
  }

  private createPieChart(id: string, config: any) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    if (this.charts[id]) {
      this.charts[id].destroy();
    }

    this.charts[id] = new Chart(ctx, {
      type: 'pie',
      data: config.data,
      options: config.options
    });
  }

  private createBarChart(id: string, config: any) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    if (this.charts[id]) {
      this.charts[id].destroy();
    }

    this.charts[id] = new Chart(ctx, {
      type: 'bar',
      data: config.data,
      options: config.options
    });
  }
} 