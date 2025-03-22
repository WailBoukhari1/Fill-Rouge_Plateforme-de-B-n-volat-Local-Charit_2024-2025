import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../../core/services/event.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IEvent, RegistrationStatus } from '../../../../core/models/event.types';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (isLoading) {
      <div class="flex justify-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      } @else if (error) {
      <div class="text-center">
        <h2 class="text-2xl text-red-600">{{ error }}</h2>
        <button mat-button color="primary" (click)="goBack()">Back to Events</button>
      </div>
      } @else if (event) {
      <mat-card class="rounded-lg shadow-lg overflow-hidden">
        @if (event.bannerImage) {
          <div class="h-48 md:h-64 w-full overflow-hidden">
            <img [src]="event.bannerImage" alt="{{ event.title }}" class="w-full h-full object-cover">
          </div>
        }
        
        <mat-card-content class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold">{{ event.title }}</h1>
            <div class="flex items-center space-x-2">
              <mat-chip color="primary">{{ event.category }}</mat-chip>
              <mat-chip [ngClass]="getStatusClass(event.status)">{{ event.status }}</mat-chip>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <p class="text-gray-700">{{ event.description }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-xl font-semibold mb-3 border-b pb-2">Event Details</h2>
              <div class="space-y-3">
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">calendar_today</mat-icon>
                  <span>{{ event.startDate | date : 'EEEE, MMMM d, y, h:mm a' }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">schedule</mat-icon>
                  <span>{{ event.durationHours }} hours</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">location_on</mat-icon>
                  <span>{{ event.location }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">group</mat-icon>
                  <span [ngClass]="{'text-red-500': event.currentParticipants >= event.maxParticipants}">
                    {{ event.currentParticipants }}/{{ event.maxParticipants }}
                    participants
                  </span>
                </div>
                @if (event.organizationId) {
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-primary-500">business</mat-icon>
                    <span>Organized by: {{ event.organizationName }}</span>
                  </div>
                }
              </div>
              
              @if (event.requirements && event.requirements.length > 0) {
                <h3 class="text-lg font-medium mt-4 mb-2">Requirements</h3>
                <ul class="list-disc list-inside">
                  @for (req of event.requirements; track req) {
                    <li>{{ req }}</li>
                  }
                </ul>
              }
              
              @if (event.skills && event.skills.length > 0) {
                <h3 class="text-lg font-medium mt-4 mb-2">Skills Needed</h3>
                <div class="flex flex-wrap gap-2">
                  @for (skill of event.skills; track skill) {
                    <mat-chip>{{ skill }}</mat-chip>
                  }
                </div>
              }
            </div>

            <div>
              <h2 class="text-xl font-semibold mb-3 border-b pb-2">Contact Information</h2>
              <div class="space-y-3">
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">person</mat-icon>
                  <span>{{ event.contactPerson }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">email</mat-icon>
                  <span>{{ event.contactEmail }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">phone</mat-icon>
                  <span>{{ event.contactPhone }}</span>
                </div>
              </div>
              
              @if (event.schedule && event.schedule.length > 0) {
                <h3 class="text-lg font-medium mt-4 mb-2">Event Schedule</h3>
                <div class="bg-gray-50 p-3 rounded-md">
                  @for (item of event.schedule; track item) {
                    <div class="flex justify-between border-b py-2 last:border-0">
                      <span class="font-medium">{{ item.time }}</span>
                      <span>{{ item.activity }}</span>
                    </div>
                  }
                </div>
              }
              
              <!-- Registration Status Section -->
              @if (isLoggedIn) {
                <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 class="text-lg font-medium mb-2">Registration Status</h3>
                  @if (isRegistering) {
                    <div class="flex justify-center my-2">
                      <mat-spinner diameter="30"></mat-spinner>
                    </div>
                  } @else if (event.isRegistered) {
                    <div class="flex items-center text-green-600">
                      <mat-icon class="mr-2">check_circle</mat-icon>
                      <span class="font-medium">You are registered for this event</span>
                    </div>
                    <button 
                      mat-button 
                      color="warn" 
                      class="mt-2 w-full" 
                      (click)="cancelRegistration()">
                      Cancel Registration
                    </button>
                  } @else {
                    <p class="text-gray-600 mb-2">
                      You are not registered for this event.
                    </p>
                  }
                </div>
              }
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions class="flex justify-between p-4 bg-gray-50">
          <button 
            mat-button 
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> Back to Events
          </button>
          
          <div>
            @if (!isLoggedIn) {
              <button 
                mat-raised-button 
                color="primary" 
                (click)="login()">
                Login to Register
              </button>
            } @else if (!event.isRegistered) {
              @if (event.currentParticipants < event.maxParticipants) {
                <button 
                  mat-raised-button 
                  color="primary" 
                  [routerLink]="['/events', event.id, 'register']"
                  [disabled]="event.status === 'COMPLETED' || event.status === 'CANCELLED'">
                  Register Now
                </button>
                <button 
                  mat-stroked-button 
                  color="primary" 
                  (click)="showRegistrationConfirmation()"
                  [disabled]="isRegistering || event.status === 'COMPLETED' || event.status === 'CANCELLED'"
                  class="ml-2">
                  Quick Register
                </button>
              } @else if (event.waitlistEnabled) {
                <button 
                  mat-raised-button 
                  color="accent" 
                  (click)="joinWaitlist()"
                  [disabled]="isRegistering">
                  Join Waitlist
                </button>
              } @else {
                <button 
                  mat-raised-button 
                  disabled>
                  Event Full
                </button>
              }
            }
          </div>
        </mat-card-actions>
      </mat-card>
      }
    </div>
  `,
  styles: [`
    .status-active { background-color: #4CAF50; color: white; }
    .status-pending { background-color: #FFC107; color: black; }
    .status-completed { background-color: #607D8B; color: white; }
    .status-cancelled { background-color: #F44336; color: white; }
  `]
})
export class EventDetailComponent implements OnInit {
  event?: IEvent;
  isLoading = true;
  error?: string;
  isLoggedIn = false;
  isRegistering = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.error = 'Event ID not found';
      this.isLoading = false;
      return;
    }
    this.loadEvent(eventId!);
  }

  private loadEvent(eventId: string): void {
    this.isLoading = true;
    this.eventService.getEventById(eventId).pipe(
      catchError(error => {
        console.error('Error loading event:', error);
        this.error = 'Failed to load event details. Please try again later.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(event => {
      if (event) {
        this.event = event;
      }
    });
  }

  showRegistrationConfirmation(): void {
    if (!this.event) return;
    
    // Check if the user is logged in
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to register for events', 'Login', {
        duration: 5000,
      }).onAction().subscribe(() => this.login());
      return;
    }
    
    // Display confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Register for Event',
        message: `Are you sure you want to register for "${this.event.title}"? By registering, you commit to attending this event.`,
        confirmText: 'Register',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.registerForEvent();
      }
    });
  }

  registerForEvent(): void {
    if (!this.event || this.event.isRegistered || this.isRegistering) return;

    this.isRegistering = true;
    this.eventService.registerForEvent(this.event.id!).pipe(
      catchError(error => {
        console.error('Error registering for event:', error);
        this.snackBar.open(
          error.message || 'Failed to register for the event. Please try again.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        return of(null);
      }),
      finalize(() => {
        this.isRegistering = false;
      })
    ).subscribe(updatedEvent => {
      if (updatedEvent) {
        this.event = updatedEvent;
        this.snackBar.open('Successfully registered for the event!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  cancelRegistration(): void {
    if (!this.event || !this.event.isRegistered || this.isRegistering) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Cancel Registration',
        message: 'Are you sure you want to cancel your registration? Your spot will be given to someone else.',
        confirmText: 'Cancel Registration',
        cancelText: 'Keep Registration'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isRegistering = true;
        this.eventService.unregisterFromEvent(this.event!.id!).pipe(
          catchError(error => {
            console.error('Error cancelling registration:', error);
            this.snackBar.open(
              error.message || 'Failed to cancel registration. Please try again.',
              'Close',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
            return of(null);
          }),
          finalize(() => {
            this.isRegistering = false;
          })
        ).subscribe(updatedEvent => {
          if (updatedEvent) {
            this.event = updatedEvent;
            this.snackBar.open('Registration cancelled successfully', 'Close', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
          }
        });
      }
    });
  }

  joinWaitlist(): void {
    if (!this.event || this.event.isRegistered || this.isRegistering) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Join Waitlist',
        message: 'This event is currently full. Would you like to join the waitlist? You will be notified if a spot becomes available.',
        confirmText: 'Join Waitlist',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isRegistering = true;
        this.eventService.joinWaitlist(this.event!.id!).pipe(
          catchError(error => {
            console.error('Error joining waitlist:', error);
            this.snackBar.open(
              error.message || 'Failed to join waitlist. Please try again.',
              'Close',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
            return of(null);
          }),
          finalize(() => {
            this.isRegistering = false;
          })
        ).subscribe(response => {
          if (response) {
            this.snackBar.open('You have been added to the waitlist!', 'Close', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            // Reload the event to update the UI
            this.loadEvent(this.event!.id!);
          }
        });
      }
    });
  }

  login(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { 
        redirectUrl: `/events/${this.event?.id}`,
        action: 'register'
      } 
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'ONGOING':
      case 'UPCOMING':
        return 'status-active';
      case 'PENDING':
      case 'DRAFT':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
