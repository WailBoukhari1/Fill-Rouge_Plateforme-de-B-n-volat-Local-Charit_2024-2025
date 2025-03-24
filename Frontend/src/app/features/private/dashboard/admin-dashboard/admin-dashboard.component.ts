import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminStatistics } from '../../../../core/models/statistics.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxChartsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600 mt-2">Overview of platform statistics and metrics</p>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Users Card -->
          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Total Users</div>
                  <div class="text-2xl font-bold text-blue-600">{{ statistics?.totalUsers || 0 }}</div>
                </div>
                <mat-icon class="text-blue-500 opacity-80 text-3xl">people</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Total Organizations Card -->
          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Total Organizations</div>
                  <div class="text-2xl font-bold text-green-600">{{ statistics?.totalOrganizations || 0 }}</div>
                </div>
                <mat-icon class="text-green-500 opacity-80 text-3xl">business</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Total Events Card -->
          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Total Events</div>
                  <div class="text-2xl font-bold text-purple-600">{{ statistics?.totalEvents || 0 }}</div>
                </div>
                <mat-icon class="text-purple-500 opacity-80 text-3xl">event</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Pending Organizations Card -->
          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Pending Organizations</div>
                  <div class="text-2xl font-bold text-yellow-600">{{ statistics?.pendingOrganizations || 0 }}</div>
                </div>
                <mat-icon class="text-yellow-500 opacity-80 text-3xl">pending</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Users by Role Chart -->
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Users by Role</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-pie-chart
                [results]="usersByRoleData"
                [gradient]="true"
                [labels]="true"
                [doughnut]="false"
                [arcWidth]="0.5"
                [animations]="true"
                [tooltipDisabled]="false">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>

          <!-- Organizations by Status Chart -->
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Organizations by Status</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-pie-chart
                [results]="organizationsByStatusData"
                [gradient]="true"
                [labels]="true"
                [doughnut]="true"
                [arcWidth]="0.5"
                [animations]="true">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Events Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Events by Status Chart -->
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Events by Status</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-bar-vertical
                [results]="eventsByStatusData"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                xAxisLabel="Status"
                yAxisLabel="Count"
                [animations]="true">
              </ngx-charts-bar-vertical>
            </mat-card-content>
          </mat-card>

          <!-- Events by Category Chart -->
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Events by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-pie-chart
                [results]="eventsByCategoryData"
                [gradient]="true"
                [labels]="true"
                [doughnut]="true"
                [arcWidth]="0.5"
                [animations]="true">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Growth Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- User Growth Chart -->
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>User Growth</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-line-chart
                [results]="userGrowthData"
                [xAxis]="true"
                [yAxis]="true"
                [gradient]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                xAxisLabel="Month"
                yAxisLabel="Users"
                [animations]="true">
              </ngx-charts-line-chart>
            </mat-card-content>
          </mat-card>

          <!-- Event Growth Chart -->
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Event Growth</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-line-chart
                [results]="eventGrowthData"
                [xAxis]="true"
                [yAxis]="true"
                [gradient]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                xAxisLabel="Month"
                yAxisLabel="Events"
                [animations]="true">
              </ngx-charts-line-chart>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
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
export class AdminDashboardComponent implements OnInit {
  loading = false;
  statistics: AdminStatistics | null = null;
  error: string | null = null;

  // Chart Data
  usersByRoleData: any[] = [];
  organizationsByStatusData: any[] = [];
  eventsByStatusData: any[] = [];
  eventsByCategoryData: any[] = [];
  userGrowthData: any[] = [];
  eventGrowthData: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getAdminStatistics().subscribe({
      next: (response: any) => {
        console.log('Raw API Response:', response);
        this.statistics = response;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admin statistics:', error);
        
        let errorDetail = '';
        if (error instanceof HttpErrorResponse && error.status === 500) {
          // Use more specific error message for the /api/admin/statistics endpoint
          errorDetail = 'The statistics service is currently unavailable.';
          
          // Log additional debug information for developers
          const userId = localStorage.getItem('userId');
          if (userId) {
            console.log(`User ID attempting to access statistics: ${userId}`);
          }
        } else {
          errorDetail = `Server returned: ${error.status} ${error.statusText}`;
        }
        
        this.error = `Unable to load dashboard statistics. ${errorDetail}`;
        this.loading = false;
        
        // Provide empty statistics to avoid null reference errors
        this.statistics = {
          totalUsers: 0,
          totalOrganizations: 0,
          totalEvents: 0,
          totalVolunteers: 0,
          pendingOrganizations: 0,
          usersByRole: {
            ADMIN: 0,
            ORGANIZATION: 0,
            VOLUNTEER: 0,
            UNASSIGNED: 0
          },
          organizationsByStatus: {
            PENDING: 0,
            VERIFIED: 0
          },
          eventsByStatus: {
            ACTIVE: 0,
            COMPLETED: 0,
            CANCELLED: 0,
            ONGOING: 0,
            PENDING: 0,
            SCHEDULED: 0,
            FULL: 0,
            REJECTED: 0
          },
          eventsByCategory: {},
          userGrowth: {},
          eventGrowth: {}
        };
        
        // Initialize empty chart data
        this.prepareChartData();
      }
    });
  }

  private prepareChartData(): void {
    if (!this.statistics) return;

    console.log('Preparing chart data with statistics:', this.statistics);

    // Prepare Users by Role data
    this.usersByRoleData = [
      { name: 'Admin', value: this.statistics.usersByRole.ADMIN || 0 },
      { name: 'Organization', value: this.statistics.usersByRole.ORGANIZATION || 0 },
      { name: 'Volunteer', value: this.statistics.usersByRole.VOLUNTEER || 0 },
      { name: 'Unassigned', value: this.statistics.usersByRole.UNASSIGNED || 0 }
    ].filter(item => item.value > 0);

    // Prepare Organizations by Status data
    this.organizationsByStatusData = [
      { name: 'Pending', value: this.statistics.organizationsByStatus.PENDING || 0 },
      { name: 'Verified', value: this.statistics.organizationsByStatus.VERIFIED || 0 }
    ].filter(item => item.value > 0);

    // Prepare Events by Status data
    this.eventsByStatusData = [
      { name: 'Active', value: this.statistics.eventsByStatus.ACTIVE || 0 },
      { name: 'Completed', value: this.statistics.eventsByStatus.COMPLETED || 0 },
      { name: 'Cancelled', value: this.statistics.eventsByStatus.CANCELLED || 0 },
      { name: 'Ongoing', value: this.statistics.eventsByStatus.ONGOING || 0 },
      { name: 'Pending', value: this.statistics.eventsByStatus.PENDING || 0 },
      { name: 'Scheduled', value: this.statistics.eventsByStatus.SCHEDULED || 0 },
      { name: 'Full', value: this.statistics.eventsByStatus.FULL || 0 },
      { name: 'Rejected', value: this.statistics.eventsByStatus.REJECTED || 0 }
    ].filter(item => item.value > 0);

    // Prepare Events by Category data
    this.eventsByCategoryData = Object.entries(this.statistics.eventsByCategory || {})
      .map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value: value
      }))
      .filter(item => item.value > 0);

    // Prepare User Growth data
    this.userGrowthData = [{
      name: 'User Growth',
      series: Object.entries(this.statistics.userGrowth || {})
        .map(([date, value]) => ({
          name: this.formatMonth(date),
          value: value
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }];

    // Prepare Event Growth data
    this.eventGrowthData = [{
      name: 'Event Growth',
      series: Object.entries(this.statistics.eventGrowth || {})
        .map(([date, value]) => ({
          name: this.formatMonth(date),
          value: value
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }];
  }

  private formatMonth(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  }
}
