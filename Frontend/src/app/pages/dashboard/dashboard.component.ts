import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="p-4">
      <!-- Admin Dashboard -->
      <div *ngIf="(authService.getCurrentUser() | async)?.role === 'ADMIN'">
        <h1>Admin Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>event</mat-icon>
              <mat-card-title>Events</mat-card-title>
              <mat-card-subtitle>Manage all events</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>150</p>
              <p>Total Events</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/events">View All</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>business</mat-icon>
              <mat-card-title>Organizations</mat-card-title>
              <mat-card-subtitle>Manage organizations</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>45</p>
              <p>Active Organizations</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/organizations">View All</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>people</mat-icon>
              <mat-card-title>Volunteers</mat-card-title>
              <mat-card-subtitle>Manage volunteers</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>320</p>
              <p>Registered Volunteers</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/volunteers">View All</a>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Organization Dashboard -->
      <div *ngIf="(authService.getCurrentUser() | async)?.role === 'ORGANIZATION'">
        <h1>Organization Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>event</mat-icon>
              <mat-card-title>My Events</mat-card-title>
              <mat-card-subtitle>Manage your events</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>12</p>
              <p>Active Events</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/events">View Events</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>group</mat-icon>
              <mat-card-title>Applications</mat-card-title>
              <mat-card-subtitle>Manage volunteer applications</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>25</p>
              <p>Pending Applications</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/applications">View Applications</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>analytics</mat-icon>
              <mat-card-title>Analytics</mat-card-title>
              <mat-card-subtitle>View your impact</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>150</p>
              <p>Total Volunteers</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/analytics">View Analytics</a>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Volunteer Dashboard -->
      <div *ngIf="(authService.getCurrentUser() | async)?.role === 'VOLUNTEER'">
        <h1>Volunteer Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>event_available</mat-icon>
              <mat-card-title>My Events</mat-card-title>
              <mat-card-subtitle>View your registered events</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>3</p>
              <p>Upcoming Events</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/my-events">View Events</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>history</mat-icon>
              <mat-card-title>History</mat-card-title>
              <mat-card-subtitle>Past volunteer activities</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>15</p>
              <p>Total Hours</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/history">View History</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>stars</mat-icon>
              <mat-card-title>Achievements</mat-card-title>
              <mat-card-subtitle>Your volunteer milestones</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>5</p>
              <p>Badges Earned</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/dashboard/achievements">View Achievements</a>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  protected authService = inject(AuthService);
} 