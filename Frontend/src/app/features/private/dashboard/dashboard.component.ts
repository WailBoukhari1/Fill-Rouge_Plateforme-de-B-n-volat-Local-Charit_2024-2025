import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { EventService } from '../../../core/services/event.service';
import { VolunteerStatistics, VolunteerHours } from '../../../core/services/volunteer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">{{getDashboardTitle()}}</h1>

      <!-- Loading Spinner -->
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          @if (userRole === 'VOLUNTEER') {
            <!-- Events Stats -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Total Events</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.totalEventsAttended}}</h2>
                    <p class="text-sm text-gray-500">
                      {{volunteerStats.upcomingEvents}} upcoming
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">event</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Hours Stats -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Hours Contributed</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.totalHoursVolunteered}}</h2>
                    <p class="text-sm text-gray-500">
                      Avg: {{volunteerStats.averageHoursPerEvent | number:'1.0-1'}} per event
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">schedule</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Rating Stats -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Average Rating</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.averageRating | number:'1.0-1'}}</h2>
                    <p class="text-sm text-gray-500">
                      Reliability: {{volunteerStats.reliabilityScore}}%
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">star</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Impact Stats -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Organizations</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.organizationsWorkedWith}}</h2>
                    <p class="text-sm text-gray-500">
                      Growth: {{(volunteerStats.participationGrowthRate * 100) | number:'1.0-1'}}%
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">business</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Recent Activity and Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Recent Activity -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recent Activity</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              @if (recentActivities.length === 0) {
                <div class="text-center py-4 text-gray-500">
                  No recent activities
                </div>
              } @else {
                <div class="space-y-4">
                  @for (activity of recentActivities; track activity.id) {
                    <div class="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
                      <mat-icon [class]="getStatusColor(activity.status)">
                        {{getActivityIcon(activity.status)}}
                      </mat-icon>
                      <div>
                        <p class="font-medium">{{activity.title}}</p>
                        <p class="text-sm text-gray-600">{{activity.description}}</p>
                        <p class="text-xs text-gray-500">{{activity.timestamp | date:'medium'}}</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Quick Actions -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              <div class="grid grid-cols-2 gap-4">
                @if (userRole === 'VOLUNTEER') {
                  <button mat-raised-button color="primary" routerLink="/events">
                    <mat-icon>event</mat-icon>
                    Browse Events
                  </button>
                  <button mat-raised-button color="primary" routerLink="/volunteer/hours">
                    <mat-icon>schedule</mat-icon>
                    View Hours
                  </button>
                  <button mat-raised-button color="primary" routerLink="/volunteer/achievements">
                    <mat-icon>emoji_events</mat-icon>
                    Achievements
                  </button>
                  <button mat-raised-button color="primary" routerLink="/volunteer/profile">
                    <mat-icon>person</mat-icon>
                    Profile
                  </button>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userRole: string = '';
  loading = true;
  recentActivities: any[] = [];
  volunteerStats: VolunteerStatistics = {
    totalEventsAttended: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    canceledEvents: 0,
    totalHoursVolunteered: 0,
    averageHoursPerEvent: 0,
    averageRating: 0,
    reliabilityScore: 0,
    organizationsWorkedWith: 0,
    participationGrowthRate: 0,
    hoursGrowthRate: 0,
    eventsByCategory: {},
    hoursByMonth: {},
    participationByDay: {}
  };

  constructor(
    private authService: AuthService,
    private volunteerService: VolunteerService,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = 'VOLUNTEER'; // For testing, replace with actual role logic
    this.loadDashboardData();
  }

  getDashboardTitle(): string {
    switch (this.userRole) {
      case 'VOLUNTEER':
        return 'Volunteer Dashboard';
      case 'ORGANIZATION':
        return 'Organization Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  }

  loadDashboardData() {
    this.loading = true;
    if (this.userRole === 'VOLUNTEER') {
      this.loadVolunteerData();
    }
  }

  private loadVolunteerData() {
    this.loading = true;
    
    // Load volunteer statistics
    this.volunteerService.getStatistics().subscribe({
      next: (stats) => {
        this.volunteerStats = stats;
        // After statistics are loaded, load hours
        this.loadVolunteerHours();
      },
      error: (error) => {
        console.error('Error loading volunteer statistics:', error);
        this.snackBar.open(
          'Unable to load statistics. Please try again later.',
          'Close',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }

  private loadVolunteerHours() {
    this.volunteerService.getVolunteerHours().subscribe({
      next: (hours) => {
        // Convert volunteer hours to recent activities
        this.recentActivities = hours.slice(0, 5).map(hour => ({
          id: hour.id,
          title: hour.eventName,
          description: `Volunteered for ${hour.hours} hours`,
          timestamp: new Date(hour.date),
          status: hour.status,
          relatedId: hour.eventId
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading volunteer hours:', error);
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-orange-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getActivityIcon(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'check_circle';
      case 'PENDING':
        return 'pending';
      case 'REJECTED':
        return 'cancel';
      default:
        return 'schedule';
    }
  }

  retryLoading() {
    this.loadDashboardData();
  }
}