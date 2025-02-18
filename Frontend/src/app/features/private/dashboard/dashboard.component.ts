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
            <!-- Volunteer Stats -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">My Events</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.totalEvents}}</h2>
                  </div>
                  <mat-icon class="text-primary-500">event</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Hours Contributed</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.totalHours}}</h2>
                  </div>
                  <mat-icon class="text-primary-500">schedule</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Achievements</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.achievements}}</h2>
                  </div>
                  <mat-icon class="text-primary-500">emoji_events</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Upcoming Events</p>
                    <h2 class="text-2xl font-bold">{{volunteerStats.upcomingEvents}}</h2>
                  </div>
                  <mat-icon class="text-primary-500">upcoming</mat-icon>
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
                    <div class="flex items-center space-x-4">
                      <mat-icon>{{activity.icon}}</mat-icon>
                      <div>
                        <p class="font-medium">{{activity.description}}</p>
                        <p class="text-sm text-gray-500">{{activity.timestamp | date:'short'}}</p>
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
                  <button mat-raised-button color="primary" routerLink="/dashboard/volunteer/events">
                    <mat-icon>event</mat-icon>
                    Browse Events
                  </button>
                  <button mat-raised-button color="primary" routerLink="/dashboard/volunteer/hours">
                    <mat-icon>schedule</mat-icon>
                    View Hours
                  </button>
                  <button mat-raised-button color="primary" routerLink="/dashboard/volunteer/achievements">
                    <mat-icon>emoji_events</mat-icon>
                    Achievements
                  </button>
                  <button mat-raised-button color="primary" routerLink="/dashboard/volunteer/profile">
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

  // Volunteer Statistics
  volunteerStats = {
    totalEvents: 0,
    totalHours: 0,
    achievements: 0,
    upcomingEvents: 0
  };

  constructor(
    private authService: AuthService,
    private volunteerService: VolunteerService,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
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
    
    // Create a default stats object
    const defaultStats = {
      totalEvents: 0,
      totalHours: 0,
      achievements: 0,
      upcomingEvents: 0
    };

    // Load volunteer statistics
    this.volunteerService.getStatistics().subscribe({
      next: (stats) => {
        this.volunteerStats = {
          totalEvents: stats.totalEventsAttended || 0,
          totalHours: stats.totalHoursVolunteered || 0,
          achievements: stats.badges?.length || 0,
          upcomingEvents: 0 // Will be set by upcoming events call
        };
      },
      error: (error) => {
        console.error('Error loading volunteer statistics:', error);
        this.snackBar.open(
          'Unable to load volunteer statistics. Please try again later.',
          'Close',
          { duration: 5000 }
        );
        this.volunteerStats = defaultStats;
      }
    });

    // Load upcoming events count
    this.eventService.getUpcomingEvents().subscribe({
      next: (events) => {
        this.volunteerStats.upcomingEvents = events.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading upcoming events:', error);
        this.snackBar.open(
          'Unable to load upcoming events. Please try again later.',
          'Close',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });

    // Load recent activities with error handling
    this.volunteerService.getVolunteerHours().subscribe({
      next: (hours) => {
        this.recentActivities = hours.slice(0, 5).map(hour => ({
          id: hour.id,
          icon: 'schedule',
          description: `Volunteered ${hour.hours} hours at ${hour.eventName}`,
          timestamp: hour.date
        }));
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
        this.snackBar.open(
          'Unable to load recent activities. Please try again later.',
          'Close',
          { duration: 5000 }
        );
        this.recentActivities = [];
      }
    });
  }

  // Add a retry method for manual refresh
  retryLoading() {
    this.loadDashboardData();
  }
} 