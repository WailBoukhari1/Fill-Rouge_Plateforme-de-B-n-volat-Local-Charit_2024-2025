import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <section class="container mx-auto px-4 py-8">
      <!-- Event Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button mat-icon-button routerLink="/events">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <div class="flex items-center gap-4">
              <h1 class="text-3xl font-bold text-gray-900">{{ event.title }}</h1>
              <mat-chip [color]="getStatusColor(event.status)">{{ event.status }}</mat-chip>
            </div>
            <p class="text-gray-600">Organized by {{ event.organizationName }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Event Image -->
          <img [src]="event.imageUrl" [alt]="event.title" 
               class="w-full h-96 object-cover rounded-lg mb-8">

          <!-- Event Details -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4">About This Event</h2>
            <p class="text-gray-700 mb-6">{{ event.description }}</p>

            <!-- Event Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <mat-icon class="text-primary-500">calendar_today</mat-icon>
                <p class="text-sm text-gray-600 mt-2">Date</p>
                <p class="font-semibold">{{ event.startDate | date:'mediumDate' }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <mat-icon class="text-primary-500">schedule</mat-icon>
                <p class="text-sm text-gray-600 mt-2">Time</p>
                <p class="font-semibold">{{ event.startDate | date:'shortTime' }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <mat-icon class="text-primary-500">location_on</mat-icon>
                <p class="text-sm text-gray-600 mt-2">Location</p>
                <p class="font-semibold">{{ event.location }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <mat-icon class="text-primary-500">group</mat-icon>
                <p class="text-sm text-gray-600 mt-2">Spots Left</p>
                <p class="font-semibold">{{ event.maxParticipants - event.registeredParticipants }}</p>
              </div>
            </div>

            <mat-divider class="mb-6"></mat-divider>

            <!-- Required Skills -->
            <h3 class="text-xl font-semibold mb-4">Required Skills</h3>
            <div class="flex flex-wrap gap-2 mb-6">
              @for (skill of event.requiredSkills; track skill) {
                <mat-chip>{{ skill }}</mat-chip>
              }
            </div>

            <mat-divider class="mb-6"></mat-divider>

            <!-- Impact -->
            <h3 class="text-xl font-semibold mb-4">Event Impact</h3>
            <p class="text-gray-700 mb-4">{{ event.impactSummary }}</p>

            <!-- Organization -->
            <mat-divider class="mb-6"></mat-divider>
            <h3 class="text-xl font-semibold mb-4">About the Organization</h3>
            <div class="flex items-start gap-4">
              <img [src]="event.organizationLogo" alt="Organization Logo" 
                   class="w-16 h-16 rounded-full object-cover">
              <div>
                <h4 class="font-semibold mb-2">{{ event.organizationName }}</h4>
                <p class="text-gray-600 mb-4">{{ event.organizationDescription }}</p>
                <a mat-button color="primary" [routerLink]="['/organizations', event.organizationId]">
                  View Organization
                  <mat-icon class="ml-2">arrow_forward</mat-icon>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Registration Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h3 class="text-xl font-semibold mb-4">Registration</h3>
            
            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>{{ event.registeredParticipants }} registered</span>
                <span>{{ event.maxParticipants }} spots</span>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="(event.registeredParticipants / event.maxParticipants) * 100">
              </mat-progress-bar>
            </div>

            <!-- Registration Button -->
            @if (!isEventFull()) {
              <button mat-raised-button color="primary" class="w-full mb-4" 
                      (click)="registerForEvent()" [disabled]="isRegistered">
                {{ isRegistered ? 'Already Registered' : 'Register Now' }}
              </button>
            } @else {
              <button mat-raised-button color="accent" class="w-full mb-4" 
                      (click)="joinWaitlist()" [disabled]="isWaitlisted">
                {{ isWaitlisted ? 'On Waitlist' : 'Join Waitlist' }}
              </button>
            }

            <!-- Event Details -->
            <div class="text-sm text-gray-600">
              <div class="flex items-center gap-2 mb-2">
                <mat-icon class="text-gray-400">event</mat-icon>
                <span>Registration closes {{ event.registrationDeadline | date }}</span>
              </div>
              @if (event.minimumAge > 0) {
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon class="text-gray-400">person</mat-icon>
                  <span>Minimum age: {{ event.minimumAge }}+ years</span>
                </div>
              }
              @if (event.requiresBackground) {
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon class="text-gray-400">verified_user</mat-icon>
                  <span>Background check required</span>
                </div>
              }
            </div>

            <!-- Share -->
            <mat-divider class="my-4"></mat-divider>
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-2">Share this event</p>
              <div class="flex justify-center gap-4">
                <button mat-icon-button color="primary" (click)="shareEvent('facebook')">
                  <mat-icon>facebook</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="shareEvent('twitter')">
                  <mat-icon>twitter</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="shareEvent('linkedin')">
                  <mat-icon>linkedin</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="copyEventLink()">
                  <mat-icon>link</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class EventDetailComponent implements OnInit {
  event: any = {};
  isRegistered: boolean = false;
  isWaitlisted: boolean = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // TODO: Fetch event details from service
    this.event = {
      id: '1',
      title: 'Beach Cleanup Drive',
      description: 'Join us for a community beach cleanup event to help protect our marine environment and local wildlife. We will be collecting trash, recyclables, and documenting the types of waste found to help inform future conservation efforts.',
      status: 'UPCOMING',
      organizationId: 'org1',
      organizationName: 'Ocean Conservation Society',
      organizationLogo: 'https://source.unsplash.com/random/100x100/?logo',
      organizationDescription: 'A non-profit organization dedicated to protecting marine ecosystems.',
      startDate: new Date(),
      registrationDeadline: new Date(new Date().setDate(new Date().getDate() + 7)),
      location: 'Miami Beach',
      imageUrl: 'https://source.unsplash.com/random/800x600/?beach',
      registeredParticipants: 15,
      maxParticipants: 30,
      requiredSkills: ['Physical Activity', 'Teamwork', 'Environmental Knowledge'],
      impactSummary: 'This event will help remove harmful waste from our beaches, protect marine life, and contribute to ongoing research about marine pollution.',
      minimumAge: 16,
      requiresBackground: false
    };
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'UPCOMING': 'primary',
      'ONGOING': 'accent',
      'COMPLETED': 'basic',
      'CANCELLED': 'warn'
    };
    return statusColors[status] || 'basic';
  }

  isEventFull(): boolean {
    return this.event.registeredParticipants >= this.event.maxParticipants;
  }

  registerForEvent(): void {
    // TODO: Implement registration logic
    this.isRegistered = true;
    this.snackBar.open('Successfully registered for the event!', 'Close', {
      duration: 3000
    });
  }

  joinWaitlist(): void {
    // TODO: Implement waitlist logic
    this.isWaitlisted = true;
    this.snackBar.open('Added to the waitlist!', 'Close', {
      duration: 3000
    });
  }

  shareEvent(platform: string): void {
    // TODO: Implement social sharing
    console.log(`Sharing on ${platform}`);
  }

  copyEventLink(): void {
    // TODO: Implement copy to clipboard
    this.snackBar.open('Event link copied to clipboard!', 'Close', {
      duration: 2000
    });
  }
} 