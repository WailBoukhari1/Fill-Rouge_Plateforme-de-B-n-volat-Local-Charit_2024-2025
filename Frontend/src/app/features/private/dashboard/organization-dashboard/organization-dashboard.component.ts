import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { OrganizationService } from '../../../../core/services/organization.service';
import { AuthService } from '../../../../core/services/auth.service';
import { StatisticsService } from '../../../../core/services/statistics.service';
import { User } from '../../../../core/models/auth.models';
import { Router } from '@angular/router';
import { curveLinear } from 'd3-shape';

// Interfaces for chart data
interface ChartDataPoint {
  name: string;
  value: number;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
  category: string | null;
}

// Updated stats interface to match the new API response
interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  totalVolunteers: number;
  activeVolunteers: number;
  averageVolunteersPerEvent: number;
  totalVolunteerHours: number;
  eventSuccessRate: number;
  volunteerRetentionRate: number;
  averageEventRating: number;
  eventTrends: TimeSeriesPoint[];
  volunteerTrends: TimeSeriesPoint[];
  eventsByCategory: Record<string, number>;
  volunteersBySkill: Record<string, number>;
}

@Component({
  selector: 'app-organization-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule,
    NgxChartsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Organization Dashboard</h1>

      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Active Events</div>
                  <div class="text-2xl font-bold text-blue-600">{{ stats?.activeEvents || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Total: {{ stats?.totalEvents || 0 }}</div>
                </div>
                <mat-icon class="text-blue-500 opacity-80 text-3xl">event_available</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Active Volunteers</div>
                  <div class="text-2xl font-bold text-indigo-600">{{ stats?.activeVolunteers || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Total: {{ stats?.totalVolunteers || 0 }}</div>
                </div>
                <mat-icon class="text-indigo-500 opacity-80 text-3xl">people</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Volunteer Hours</div>
                  <div class="text-2xl font-bold text-green-600">{{ stats?.totalVolunteerHours || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Per Event: {{ stats?.averageVolunteersPerEvent?.toFixed(1) || 0 }}</div>
                </div>
                <mat-icon class="text-green-500 opacity-80 text-3xl">schedule</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Event Rating</div>
                  <div class="text-2xl font-bold text-amber-600">{{ stats?.averageEventRating?.toFixed(1) || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Success Rate: {{ stats?.eventSuccessRate?.toFixed(0) || 0 }}%</div>
                </div>
                <mat-icon class="text-amber-500 opacity-80 text-3xl">star</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Event Trends</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-area-chart
                [results]="[{ name: 'Events', series: eventTrendsChartData }]"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                [xAxisLabel]="'Date'"
                [yAxisLabel]="'Events'"
                [curve]="curve"
                [legend]="false"
                [autoScale]="true">
              </ngx-charts-area-chart>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Events by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-pie-chart
                [results]="eventsByCategoryChartData"
                [gradient]="true"
                [labels]="true"
                [doughnut]="true"
                [legend]="true"
                [arcWidth]="0.35"
                [animations]="true">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Additional Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Event Success Rate</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-64 flex items-center justify-center">
              <ngx-charts-gauge
                [results]="[{name: 'Success Rate', value: stats?.eventSuccessRate || 0}]"
                [min]="0"
                [max]="100"
                [units]="'%'"
                [showAxis]="true"
                [bigSegments]="10"
                [smallSegments]="5"
                [angleSpan]="240"
                [startAngle]="-120"
                [animations]="true"
                [legend]="false">
              </ngx-charts-gauge>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Volunteer Retention</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-64 flex items-center justify-center">
              <ngx-charts-gauge
                [results]="[{name: 'Retention', value: stats?.volunteerRetentionRate || 0}]"
                [min]="0"
                [max]="100"
                [units]="'%'"
                [showAxis]="true"
                [bigSegments]="10"
                [smallSegments]="5"
                [angleSpan]="240"
                [startAngle]="-120"
                [animations]="true"
                [legend]="false">
              </ngx-charts-gauge>
            </mat-card-content>
          </mat-card>
        </div>

        @if (stats?.volunteersBySkill && hasSkills(stats?.volunteersBySkill)) {
          <div class="mb-8">
            <mat-card class="shadow-md">
              <mat-card-header>
                <mat-card-title>Volunteers by Skill</mat-card-title>
              </mat-card-header>
              <mat-card-content class="h-80">
                <ngx-charts-bar-vertical
                  [results]="volunteersBySkillChartData"
                  [gradient]="true"
                  [xAxis]="true"
                  [yAxis]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  [xAxisLabel]="'Skill'"
                  [yAxisLabel]="'Volunteers'"
                  [animations]="true">
                </ngx-charts-bar-vertical>
              </mat-card-content>
            </mat-card>
          </div>
        }

        <!-- Quick Actions -->
        <div class="mt-8">
          <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <mat-card class="shadow-md">
              <mat-card-content>
                <h3 class="text-lg font-semibold mb-4">Manage Events</h3>
                <div class="space-y-4">
                  <a mat-button color="primary" routerLink="/organization/events/create" class="w-full">
                    <mat-icon class="mr-2">add_circle</mat-icon>
                    Create New Event
                  </a>
                  <a mat-button color="primary" routerLink="/organization/events" class="w-full">
                    <mat-icon class="mr-2">event</mat-icon>
                    View All Events
                  </a>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="shadow-md">
              <mat-card-content>
                <h3 class="text-lg font-semibold mb-4">Profile Management</h3>
                <div class="space-y-4">
                  <a mat-button color="primary" routerLink="/organization/profile" class="w-full">
                    <mat-icon class="mr-2">edit</mat-icon>
                    Update Profile
                  </a>
                  <a mat-button color="primary" routerLink="/organization/resources" class="w-full">
                    <mat-icon class="mr-2">description</mat-icon>
                    Manage Resources
                  </a>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="shadow-md">
              <mat-card-content>
                <h3 class="text-lg font-semibold mb-4">Volunteer Management</h3>
                <div class="space-y-4">
                  <a mat-button color="primary" routerLink="/organization/volunteers" class="w-full">
                    <mat-icon class="mr-2">people</mat-icon>
                    Manage Volunteers
                  </a>
                  <a mat-button color="primary" routerLink="/organization/applications" class="w-full">
                    <mat-icon class="mr-2">assignment_ind</mat-icon>
                    View Applications
                  </a>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    mat-card {
      border-radius: 8px;
      overflow: hidden;
    }
    mat-card:hover {
      transform: translateY(-2px);
      transition: transform 0.2s ease-in-out;
    }
  `]
})
export class OrganizationDashboardComponent implements OnInit {
  loading = false;
  stats: OrganizationStats | null = null;
  currentUser: User | null = null;
  curve = curveLinear;
  
  // Chart data
  eventTrendsChartData: any[] = [];
  eventsByCategoryChartData: ChartDataPoint[] = [];
  volunteerTrendsChartData: any[] = [];
  volunteersBySkillChartData: ChartDataPoint[] = [];

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.checkProfileCompletion();
  }

  private loadStats() {
    this.loading = true;
    
    // For demonstration purposes, using the provided static data
    // In a real implementation, replace this with actual API call
    
    // Simulated API response
    const mockResponse = {
      data: {
        totalEvents: 3,
        activeEvents: 0,
        completedEvents: 0,
        upcomingEvents: 0,
        totalVolunteers: 0,
        activeVolunteers: 0,
        averageVolunteersPerEvent: 0.0,
        totalVolunteerHours: 0,
        eventSuccessRate: 0.0,
        volunteerRetentionRate: 0.0,
        averageEventRating: 0.0,
        eventTrends: [
          {
            date: "2025-03",
            value: 2,
            category: null
          },
          {
            date: "2026-03",
            value: 1,
            category: null
          }
        ],
        volunteerTrends: [],
        eventsByCategory: {
          "community development": 2,
          "environment": 1
        },
        volunteersBySkill: {}
      }
    };

    // Simulate API response timing
    setTimeout(() => {
      this.stats = mockResponse.data as OrganizationStats;
      this.prepareChartData();
      this.loading = false;
    }, 500);
    
    // In a real implementation, this would be:
    /*
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      console.error('No organization ID available');
      this.loading = false;
      return;
    }
    this.statisticsService.getOrganizationStatistics(organizationId).subscribe({
      next: (response) => {
        this.stats = response.data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching organization statistics:', error);
        this.loading = false;
      }
    });
    */
  }

  private prepareChartData(): void {
    // Prepare event trends data
    if (this.stats?.eventTrends && this.stats.eventTrends.length > 0) {
      this.eventTrendsChartData = this.stats.eventTrends.map((item: TimeSeriesPoint) => ({
        name: item.date,
        value: item.value
      }));
    } else {
      this.eventTrendsChartData = this.generateMockTimeseriesData('Events');
    }

    // Prepare volunteer trends data
    if (this.stats?.volunteerTrends && this.stats.volunteerTrends.length > 0) {
      this.volunteerTrendsChartData = this.stats.volunteerTrends.map((item: TimeSeriesPoint) => ({
        name: item.date,
        value: item.value
      }));
    } else {
      this.volunteerTrendsChartData = this.generateMockTimeseriesData('Volunteers');
    }

    // Prepare events by category data
    if (this.stats?.eventsByCategory) {
      this.eventsByCategoryChartData = Object.entries(this.stats.eventsByCategory).map(([name, value]) => ({
        name: this.capitalizeFirstLetter(name),
        value: value as number
      }));
    } else {
      this.eventsByCategoryChartData = [
        { name: 'Education', value: 2 },
        { name: 'Environment', value: 1 },
        { name: 'Community', value: 3 }
      ];
    }

    // Prepare volunteers by skill data
    if (this.stats?.volunteersBySkill) {
      const skillEntries = Object.entries(this.stats.volunteersBySkill);
      if (skillEntries.length > 0) {
        this.volunteersBySkillChartData = skillEntries.map(([name, value]) => ({
          name: this.capitalizeFirstLetter(name),
          value: value as number
        }));
      } else {
        this.setDefaultSkillsData();
      }
    } else {
      this.setDefaultSkillsData();
    }
  }

  private setDefaultSkillsData(): void {
    this.volunteersBySkillChartData = [
      { name: 'Teaching', value: 0 },
      { name: 'Mentoring', value: 0 },
      { name: 'Construction', value: 0 }
    ];
  }

  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private generateMockTimeseriesData(label: string): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = 5;
    
    return months.map((month, index) => ({
      name: month,
      value: Math.max(0, baseValue - (3 - index))
    }));
  }

  private checkProfileCompletion() {
    // Simplified for demo
    // In a real app, check profile completion status and show appropriate guidance
  }

  hasSkills(skillsObj: Record<string, number> | undefined): boolean {
    return skillsObj ? Object.keys(skillsObj).length > 0 : false;
  }
} 