import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatPaginatorModule,
    MatBadgeModule
  ],
  template: `
    <section class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p class="text-gray-600">Manage your organization's events and track their progress</p>
        </div>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon class="mr-2">add</mat-icon>
          Create Event
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Events</p>
              <h3 class="text-2xl font-bold">{{ stats.totalEvents }}</h3>
            </div>
            <mat-icon class="text-primary-500">event</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Active Events</p>
              <h3 class="text-2xl font-bold">{{ stats.activeEvents }}</h3>
            </div>
            <mat-icon class="text-green-500">event_available</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Participants</p>
              <h3 class="text-2xl font-bold">{{ stats.totalParticipants }}</h3>
            </div>
            <mat-icon class="text-blue-500">group</mat-icon>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Average Rating</p>
              <h3 class="text-2xl font-bold">{{ stats.averageRating }}/5.0</h3>
            </div>
            <mat-icon class="text-yellow-500">star</mat-icon>
          </div>
        </div>
      </div>

      <!-- Events Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table mat-table [dataSource]="events" class="w-full">
          <!-- Title Column -->
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Event</th>
            <td mat-cell *matCellDef="let event">
              <div class="flex items-center">
                <img [src]="event.imageUrl" [alt]="event.title" 
                     class="w-10 h-10 rounded object-cover mr-3">
                <div>
                  <p class="font-medium">{{ event.title }}</p>
                  <p class="text-sm text-gray-600">{{ event.startDate | date:'mediumDate' }}</p>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let event">
              <mat-chip [color]="getStatusColor(event.status)">
                {{ event.status }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Participants Column -->
          <ng-container matColumnDef="participants">
            <th mat-header-cell *matHeaderCellDef>Participants</th>
            <td mat-cell *matCellDef="let event">
              <div class="flex items-center">
                <span class="mr-2">
                  {{ event.registeredParticipants }}/{{ event.maxParticipants }}
                </span>
                @if (event.waitlistedParticipants > 0) {
                  <mat-icon matBadge="{{ event.waitlistedParticipants }}" 
                           matBadgeColor="warn" 
                           class="text-gray-400">
                    people_alt
                  </mat-icon>
                }
              </div>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let event">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/dashboard/events', event.id]">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item [routerLink]="['/dashboard/events', event.id, 'participants']">
                  <mat-icon>group</mat-icon>
                  <span>Manage Participants</span>
                </button>
                <button mat-menu-item [routerLink]="['/dashboard/events', event.id, 'feedback']">
                  <mat-icon>feedback</mat-icon>
                  <span>View Feedback</span>
                </button>
                @if (event.status === 'DRAFT' || event.status === 'PENDING') {
                  <button mat-menu-item (click)="publishEvent(event.id)">
                    <mat-icon>publish</mat-icon>
                    <span>Publish</span>
                  </button>
                }
                @if (!event.isCancelled) {
                  <button mat-menu-item (click)="cancelEvent(event.id)" class="text-red-500">
                    <mat-icon>event_busy</mat-icon>
                    <span>Cancel Event</span>
                  </button>
                }
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [length]="100"
          [pageSize]="10"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)"
          aria-label="Select page">
        </mat-paginator>
      </div>
    </section>
  `
})
export class EventManagementComponent implements OnInit {
  events: any[] = [];
  displayedColumns: string[] = ['title', 'status', 'participants', 'actions'];
  stats = {
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    averageRating: 0
  };

  constructor() {}

  ngOnInit(): void {
    // TODO: Fetch events and stats from service
    this.stats = {
      totalEvents: 25,
      activeEvents: 8,
      totalParticipants: 450,
      averageRating: 4.7
    };

    this.events = [
      {
        id: '1',
        title: 'Beach Cleanup Drive',
        status: 'UPCOMING',
        startDate: new Date(),
        imageUrl: 'https://source.unsplash.com/random/800x600/?beach',
        registeredParticipants: 15,
        maxParticipants: 30,
        waitlistedParticipants: 5,
        isCancelled: false
      },
      // Add more mock events
    ];
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'basic',
      'PENDING': 'accent',
      'UPCOMING': 'primary',
      'ONGOING': 'primary',
      'COMPLETED': 'basic',
      'CANCELLED': 'warn'
    };
    return statusColors[status] || 'basic';
  }

  onPageChange(event: PageEvent): void {
    // TODO: Implement pagination
    console.log(event);
  }

  publishEvent(eventId: string): void {
    // TODO: Implement publish logic
    console.log('Publishing event:', eventId);
  }

  cancelEvent(eventId: string): void {
    // TODO: Implement cancel logic
    console.log('Cancelling event:', eventId);
  }
} 