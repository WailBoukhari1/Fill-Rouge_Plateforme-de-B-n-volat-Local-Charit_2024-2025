import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Event {
  id: number;
  title: string;
  organization: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  role: string;
  hours: number;
  imageUrl: string;
}

@Component({
  selector: 'app-volunteer-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p class="text-gray-600">Track your volunteer activities and commitments</p>
      </div>

      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading">
        <mat-tab-group>
          <!-- Upcoming Events Tab -->
          <mat-tab label="Upcoming Events">
            <div class="py-6">
              <div *ngIf="upcomingEvents.length === 0" class="text-center py-8">
                <mat-icon class="text-gray-400 text-5xl mb-4">event_busy</mat-icon>
                <p class="text-gray-600">No upcoming events</p>
                <button mat-raised-button color="primary" class="mt-4" routerLink="/events">
                  Browse Events
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <mat-card *ngFor="let event of upcomingEvents" class="h-full">
                  <img [src]="event.imageUrl" alt="Event image" class="w-full h-48 object-cover">
                  <mat-card-content class="p-4">
                    <h3 class="text-xl font-semibold mb-2">{{ event.title }}</h3>
                    <p class="text-gray-600 mb-2">{{ event.organization }}</p>
                    <div class="flex items-center mb-2">
                      <mat-icon class="text-gray-500 mr-1">location_on</mat-icon>
                      <span class="text-gray-600">{{ event.location }}</span>
                    </div>
                    <div class="flex items-center mb-2">
                      <mat-icon class="text-gray-500 mr-1">event</mat-icon>
                      <span class="text-gray-600">{{ event.startDate | date:'medium' }}</span>
                    </div>
                    <mat-chip-set>
                      <mat-chip>{{ event.role }}</mat-chip>
                    </mat-chip-set>
                  </mat-card-content>
                  <mat-card-actions class="p-4 pt-0">
                    <button mat-button color="primary" [routerLink]="['/events', event.id]">
                      View Details
                    </button>
                    <button mat-button color="warn" (click)="cancelRegistration(event)">
                      Cancel Registration
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Past Events Tab -->
          <mat-tab label="Past Events">
            <div class="py-6">
              <div *ngIf="pastEvents.length === 0" class="text-center py-8">
                <mat-icon class="text-gray-400 text-5xl mb-4">history</mat-icon>
                <p class="text-gray-600">No past events</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <mat-card *ngFor="let event of pastEvents" class="h-full">
                  <img [src]="event.imageUrl" alt="Event image" class="w-full h-48 object-cover">
                  <mat-card-content class="p-4">
                    <h3 class="text-xl font-semibold mb-2">{{ event.title }}</h3>
                    <p class="text-gray-600 mb-2">{{ event.organization }}</p>
                    <div class="flex items-center mb-2">
                      <mat-icon class="text-gray-500 mr-1">location_on</mat-icon>
                      <span class="text-gray-600">{{ event.location }}</span>
                    </div>
                    <div class="flex items-center mb-2">
                      <mat-icon class="text-gray-500 mr-1">event</mat-icon>
                      <span class="text-gray-600">{{ event.startDate | date:'medium' }}</span>
                    </div>
                    <div class="flex items-center mb-2">
                      <mat-icon class="text-gray-500 mr-1">schedule</mat-icon>
                      <span class="text-gray-600">{{ event.hours }} hours</span>
                    </div>
                    <mat-chip-set>
                      <mat-chip [color]="event.status === 'completed' ? 'primary' : 'warn'">
                        {{ event.status | titlecase }}
                      </mat-chip>
                    </mat-chip-set>
                  </mat-card-content>
                  <mat-card-actions class="p-4 pt-0">
                    <button mat-button color="primary" [routerLink]="['/events', event.id]">
                      View Details
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `
})
export class VolunteerEventsComponent implements OnInit {
  isLoading = true;
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];

  ngOnInit() {
    // TODO: Load events from service
    this.loadEvents();
  }

  loadEvents() {
    // Simulate API call
    setTimeout(() => {
      this.upcomingEvents = [
        {
          id: 1,
          title: 'Beach Cleanup Drive',
          organization: 'Ocean Guardians',
          startDate: new Date('2024-04-15T09:00:00'),
          endDate: new Date('2024-04-15T13:00:00'),
          location: 'Miami Beach',
          status: 'upcoming',
          role: 'Team Leader',
          hours: 4,
          imageUrl: 'assets/images/events/beach-cleanup.jpg'
        },
        {
          id: 2,
          title: 'Food Bank Distribution',
          organization: 'Community Food Bank',
          startDate: new Date('2024-04-20T10:00:00'),
          endDate: new Date('2024-04-20T14:00:00'),
          location: 'Downtown Miami',
          status: 'upcoming',
          role: 'Volunteer',
          hours: 4,
          imageUrl: 'assets/images/events/food-bank.jpg'
        }
      ];

      this.pastEvents = [
        {
          id: 3,
          title: 'Tree Planting Initiative',
          organization: 'Green Earth',
          startDate: new Date('2024-03-10T08:00:00'),
          endDate: new Date('2024-03-10T12:00:00'),
          location: 'City Park',
          status: 'completed',
          role: 'Volunteer',
          hours: 4,
          imageUrl: 'assets/images/events/tree-planting.jpg'
        },
        {
          id: 4,
          title: 'Senior Center Visit',
          organization: 'Elder Care',
          startDate: new Date('2024-03-05T14:00:00'),
          endDate: new Date('2024-03-05T17:00:00'),
          location: 'Sunshine Senior Center',
          status: 'completed',
          role: 'Activity Coordinator',
          hours: 3,
          imageUrl: 'assets/images/events/senior-center.jpg'
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  cancelRegistration(event: Event) {
    // TODO: Implement cancellation logic
    console.log('Cancelling registration for event:', event.id);
  }
} 