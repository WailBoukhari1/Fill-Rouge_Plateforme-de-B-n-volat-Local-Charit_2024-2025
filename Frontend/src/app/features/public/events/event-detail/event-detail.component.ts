import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../core/services/auth.service';
import { EventService } from '../../../../core/services/event.service';
import { UserService } from '../../../../core/services/user.service';
import { IEvent } from '../../../../core/models/event.types';

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
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div *ngIf="loading" class="flex justify-center items-center p-8">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <div *ngIf="error" class="bg-red-50 p-4 rounded-md mb-4">
        <p class="text-red-700">{{error}}</p>
      </div>
      
      <div *ngIf="!loading && event" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Event Status Banner -->
        <div *ngIf="event && (event.status !== 'ACTIVE' || isEventOrganizer)" 
             class="md:col-span-3 mb-4 p-3 rounded-md" 
             [ngClass]="{
               'bg-yellow-50': event.status === 'PENDING',
               'bg-green-50': event.status === 'ACTIVE',
               'bg-red-50': event.status === 'CANCELLED',
               'bg-blue-50': event.status === 'COMPLETED'
             }">
          <p class="flex items-center" 
             [ngClass]="{
               'text-yellow-700': event.status === 'PENDING',
               'text-green-700': event.status === 'ACTIVE',
               'text-red-700': event.status === 'CANCELLED',
               'text-blue-700': event.status === 'COMPLETED'
             }">
            <mat-icon class="mr-2" 
              [ngClass]="{
                'text-yellow-600': event.status === 'PENDING',
                'text-green-600': event.status === 'ACTIVE',
                'text-red-600': event.status === 'CANCELLED',
                'text-blue-600': event.status === 'COMPLETED'
              }">
              <ng-container *ngIf="event.status === 'PENDING'">pending</ng-container>
              <ng-container *ngIf="event.status === 'ACTIVE'">check_circle</ng-container>
              <ng-container *ngIf="event.status === 'CANCELLED'">cancel</ng-container>
              <ng-container *ngIf="event.status === 'COMPLETED'">done_all</ng-container>
            </mat-icon>
            
            <ng-container *ngIf="event.status === 'PENDING'">
              This event is pending admin approval and is not visible to the public yet.
            </ng-container>
            <ng-container *ngIf="event.status === 'ACTIVE'">
              This event is approved and open for registration.
            </ng-container>
            <ng-container *ngIf="event.status === 'CANCELLED'">
              This event has been cancelled.
            </ng-container>
            <ng-container *ngIf="event.status === 'COMPLETED'">
              This event has been completed.
            </ng-container>
          </p>
        </div>
        
        <!-- Registration Status Banner (if user is registered) -->
        <div *ngIf="isRegistered && registrationStatus" 
             class="md:col-span-3 mb-4 p-3 rounded-md"
             [ngClass]="{
               'bg-yellow-50': registrationStatus === 'PENDING' || registrationStatus === 'WAITLISTED',
               'bg-green-50': registrationStatus === 'APPROVED',
               'bg-red-50': registrationStatus === 'REJECTED'
             }">
          <p class="flex items-center"
             [ngClass]="{
               'text-yellow-700': registrationStatus === 'PENDING' || registrationStatus === 'WAITLISTED',
               'text-green-700': registrationStatus === 'APPROVED',
               'text-red-700': registrationStatus === 'REJECTED'
             }">
            <mat-icon class="mr-2"
              [ngClass]="{
                'text-yellow-600': registrationStatus === 'PENDING' || registrationStatus === 'WAITLISTED',
                'text-green-600': registrationStatus === 'APPROVED',
                'text-red-600': registrationStatus === 'REJECTED'
              }">
              <ng-container *ngIf="registrationStatus === 'PENDING'">pending</ng-container>
              <ng-container *ngIf="registrationStatus === 'WAITLISTED'">pending</ng-container>
              <ng-container *ngIf="registrationStatus === 'APPROVED'">check_circle</ng-container>
              <ng-container *ngIf="registrationStatus === 'REJECTED'">cancel</ng-container>
            </mat-icon>
            
            <ng-container *ngIf="registrationStatus === 'PENDING'">
              Your registration is pending approval from the organizer.
            </ng-container>
            <ng-container *ngIf="registrationStatus === 'WAITLISTED'">
              You are currently on the waitlist for this event.
            </ng-container>
            <ng-container *ngIf="registrationStatus === 'APPROVED'">
              Your registration has been approved! We look forward to seeing you at the event.
            </ng-container>
            <ng-container *ngIf="registrationStatus === 'REJECTED'">
              Your registration request was not approved for this event.
            </ng-container>
          </p>
        </div>
        
        <!-- Main Content -->
        <div class="md:col-span-2">
          <mat-card class="mb-6">
            <div class="p-4">
              <h1 class="text-2xl font-bold mb-2">{{event.title}}</h1>
              
              <div class="flex flex-wrap gap-2 mb-4">
                <mat-chip color="primary">{{event.category}}</mat-chip>
                <mat-chip *ngIf="event?.isVirtual" color="accent">Virtual</mat-chip>
                <mat-chip *ngIf="event?.isVirtual === false" color="accent">In-Person</mat-chip>
                <mat-chip *ngIf="event.currentParticipants >= event.maxParticipants" color="warn">Full</mat-chip>
              </div>
              
              <p class="mb-4 whitespace-pre-line">{{event.description}}</p>
              
              <mat-divider class="mb-4"></mat-divider>
              
              <h2 class="text-lg font-medium mb-3">Event Details</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-gray-500">calendar_today</mat-icon>
                  <span>{{event.startDate | date:'fullDate'}}</span>
                </div>
                
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-gray-500">schedule</mat-icon>
                  <span>{{event.startDate | date:'shortTime'}} - {{event.endDate | date:'shortTime'}}</span>
                </div>
                
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-gray-500">location_on</mat-icon>
                  <span>{{event.location}}</span>
                </div>
                
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-gray-500">group</mat-icon>
                  <span>{{event.currentParticipants}}/{{event.maxParticipants}} participants</span>
                </div>
              </div>
              
              <div *ngIf="event.skills?.length" class="mb-4">
                <h3 class="text-md font-medium mb-2">Skills Needed</h3>
                <div class="flex flex-wrap gap-1">
                  <mat-chip *ngFor="let skill of event.skills">{{skill}}</mat-chip>
                </div>
              </div>
              
              <div *ngIf="event.requirements" class="mb-4">
                <h3 class="text-md font-medium mb-2">Requirements</h3>
                <p class="whitespace-pre-line">{{event.requirements}}</p>
              </div>
            </div>
          </mat-card>
        </div>
        
        <!-- Sidebar -->
        <div class="md:col-span-1">
          <mat-card class="mb-6 sticky top-4">
            <div class="p-4">
              <h2 class="text-lg font-medium mb-4">Registration</h2>
              
              <div *ngIf="!isLoggedIn" class="mb-4 bg-blue-50 p-3 rounded">
                <p class="text-blue-700 mb-2">Please log in to register for this event.</p>
                <button mat-raised-button color="primary" routerLink="/auth/login" [queryParams]="{redirectUrl: '/events/' + event.id}">
                  Log In
                </button>
              </div>
              
              <div *ngIf="isLoggedIn && !isRegistered" class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="font-medium">Spaces Available:</span>
                  <span [ngClass]="{'text-green-600': event.currentParticipants < event.maxParticipants, 'text-red-600': event.currentParticipants >= event.maxParticipants}">
                    {{Math.max(0, event.maxParticipants - event.currentParticipants)}} / {{event.maxParticipants}}
                  </span>
                </div>
                
                <div *ngIf="event.currentParticipants >= event.maxParticipants" class="mb-2">
                  <div class="text-red-600 mb-2">This event is currently full.</div>
                  <div *ngIf="event.waitlistEnabled" class="text-yellow-600">
                    Waitlist is available. You can still register to join the waitlist.
                  </div>
                </div>
                
                <button 
                  mat-raised-button 
                  color="primary" 
                  class="w-full"
                  [routerLink]="['/events', event.id, 'register']"
                  [disabled]="event.status !== 'ACTIVE' || (event.currentParticipants >= event.maxParticipants && !event.waitlistEnabled) || isRegistering">
                  <span *ngIf="event.currentParticipants < event.maxParticipants">Register Now</span>
                  <span *ngIf="event.currentParticipants >= event.maxParticipants && event.waitlistEnabled">Join Waitlist</span>
                  <span *ngIf="event.currentParticipants >= event.maxParticipants && !event.waitlistEnabled">Event Full</span>
                </button>
              </div>
              
              <div *ngIf="isLoggedIn && isRegistered" class="space-y-4">
                <p class="text-green-600 font-medium mb-2">You are registered for this event!</p>
                
                <div *ngIf="registrationStatus === 'PENDING'" class="text-yellow-600">
                  Your registration is awaiting approval.
                </div>
                
                <div *ngIf="registrationStatus === 'WAITLISTED'" class="text-yellow-600">
                  You are currently on the waitlist.
                </div>
                
                <button 
                  mat-stroked-button 
                  color="warn" 
                  class="w-full"
                  (click)="cancelRegistration()"
                  [disabled]="isRegistering">
                  Cancel Registration
                  <mat-spinner *ngIf="isRegistering" diameter="20" class="ml-2"></mat-spinner>
                </button>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  eventId: string | null = null;
  event: IEvent | null = null;
  loading: boolean = true;
  error: string | null = null;
  isEventOrganizer: boolean = false;
  isLoggedIn = false;
  isRegistering = false;
  registrationStatus: string | null = null;
  isRegistered: boolean = false;
  Math = Math; // Make Math available to the template
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.eventId = this.route.snapshot.paramMap.get('id');
    
    if (!this.eventId) {
      this.error = 'Event ID not found';
      this.loading = false;
      return;
    }
    
    this.loadEvent();
  }
  
  private loadEvent(): void {
    if (!this.eventId) return;
    
    this.loading = true;
    this.error = null;
    
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        if (event) {
          this.event = event;
          this.checkRegistrationStatus();
        }
      },
      error: (error) => {
        this.error = 'Failed to load event details. Please try again later.';
        console.error('Error loading event:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  cancelRegistration(): void {
    if (!this.eventId || !this.isRegistered) return;
    
    this.isRegistering = true;
    
    this.eventService.cancelRegistration(this.eventId).subscribe({
      next: () => {
        this.isRegistered = false;
        this.registrationStatus = null;
        this.snackBar.open('Registration cancelled successfully', 'Close', { duration: 3000 });
        // Reload the event to get updated participant count
        this.loadEvent();
      },
      error: (error) => {
        console.error('Error cancelling registration:', error);
        this.snackBar.open('Failed to cancel registration. Please try again.', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isRegistering = false;
      }
    });
  }
  
  private checkRegistrationStatus(): void {
    if (!this.authService.isLoggedIn() || !this.event) {
      return;
    }

    // Fetch the event again with the registration info
    const userId = this.authService.getCurrentUserId();
    if (userId && this.event.id) {
      // Check if the service has the method before calling it
      if (typeof this.eventService.checkRegistrationStatus === 'function') {
        this.eventService.checkRegistrationStatus(this.event.id, userId)
          .subscribe({
            next: (response: { isRegistered: boolean; status: string }) => {
              this.isRegistered = response.isRegistered;
              this.registrationStatus = response.status;
            },
            error: (error: any) => {
              console.error('Error checking registration status:', error);
            }
          });
      } else {
        // Fallback mechanism if the method doesn't exist
        this.isRegistered = false;
        // Check if the current user is in the event's registered participants
        if (this.event.registeredParticipants?.includes(userId)) {
          this.isRegistered = true;
          this.registrationStatus = 'APPROVED'; // Default assumption
        }
      }
    }
  }
}