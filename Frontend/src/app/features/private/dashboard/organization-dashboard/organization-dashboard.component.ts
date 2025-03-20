import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationService } from '../../../../core/services/organization.service';
import { OrganizationStats } from '../../../../store/organization/organization.types';
import { AuthService } from '../../../../core/services/auth.service';
import { StatisticsService } from '../../../../core/services/statistics.service';
import { take } from 'rxjs/operators';
import { User } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-organization-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Organization Dashboard</h1>

      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Active Events -->
          <mat-card class="stats-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm">Active Events</p>
                  <h3 class="text-2xl font-bold">{{stats?.activeEvents || 0}}</h3>
                </div>
                <mat-icon class="text-primary-600">event_available</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Active Volunteers -->
          <mat-card class="stats-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm">Active Volunteers</p>
                  <h3 class="text-2xl font-bold">{{stats?.activeVolunteers || 0}}</h3>
                </div>
                <mat-icon class="text-primary-600">people</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Total Hours -->
          <mat-card class="stats-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm">Total Volunteer Hours</p>
                  <h3 class="text-2xl font-bold">{{stats?.totalHours || 0}}</h3>
                </div>
                <mat-icon class="text-primary-600">schedule</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Impact Score -->
          <mat-card class="stats-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm">Impact Score</p>
                  <h3 class="text-2xl font-bold">{{stats?.impactScore?.toFixed(1) || '0.0'}}</h3>
                </div>
                <mat-icon class="text-primary-600">trending_up</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <mat-card>
            <mat-card-content>
              <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
              <div class="space-y-4">
                <a mat-button color="primary" routerLink="/organization/events/create" class="w-full">
                  <mat-icon class="mr-2">add_circle</mat-icon>
                  Create New Event
                </a>
                <a mat-button color="primary" routerLink="/organization/profile" class="w-full">
                  <mat-icon class="mr-2">edit</mat-icon>
                  Update Profile
                </a>
                <a mat-button color="primary" routerLink="/organization/volunteers" class="w-full">
                  <mat-icon class="mr-2">people</mat-icon>
                  Manage Volunteers
                </a>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Recent Activity -->
          <mat-card class="md:col-span-2">
            <mat-card-content>
              <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
              @if (stats?.recentActivity?.length) {
                <div class="space-y-4">
                  @for (activity of stats!.recentActivity; track activity.id) {
                    <div class="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
                      <mat-icon [class]="activity.icon">{{activity.icon}}</mat-icon>
                      <div class="flex-1">
                        <p class="font-medium">{{activity.description}}</p>
                        <p class="text-sm text-gray-600">{{activity.timestamp | date:'medium'}}</p>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-gray-600">No recent activity</p>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-card {
      transition: transform 0.2s;
    }
    .stats-card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class OrganizationDashboardComponent implements OnInit {
  loading = false;
  stats: OrganizationStats | null = null;

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.loading = true;
    
    // Get organization ID from auth service
    const organizationId = this.authService.getCurrentOrganizationId();
    console.log('Attempting to load statistics for organization ID:', organizationId);

    if (!organizationId) {
      console.error('No organization ID available');
      this.loading = false;
      return;
    }

    this.fetchStatistics(organizationId);
  }

  private fetchStatistics(organizationId: string): void {
    if (!organizationId) {
      console.error('Attempted to fetch statistics with no organization ID');
      this.loading = false;
      return;
    }

    console.log('Fetching statistics for organization:', organizationId);
    this.statisticsService.getOrganizationStatistics(organizationId).subscribe({
      next: (response) => {
        if (!response.data) {
          console.error('No data in response');
          this.loading = false;
          return;
        }

        const stats = response.data;
        // Calculate impact score based on available metrics
        const impactScore = ((stats.activeVolunteers / (stats.totalVolunteers || 1)) * 100) || 0;
        
        this.stats = {
          totalEvents: stats.totalEvents || 0,
          activeEvents: stats.activeEvents || 0,
          totalVolunteers: stats.totalVolunteers || 0,
          activeVolunteers: stats.activeVolunteers || 0,
          totalHours: stats.totalVolunteerHours || 0,
          averageRating: stats.averageEventRating || 0,
          impactScore,
          totalEventsHosted: stats.totalEvents || 0,
          recentActivity: [{
            id: new Date().toISOString(),
            icon: 'info',
            description: 'Statistics loaded',
            timestamp: new Date()
          }]
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organization stats:', error);
        this.loading = false;
      }
    });
  }
} 