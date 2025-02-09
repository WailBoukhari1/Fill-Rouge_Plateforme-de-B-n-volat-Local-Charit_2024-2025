import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '@core/services/auth.service';
import { EventStatus } from '../../../../core/models/event-status.enum';
import { UserRole } from '@core/models/user.model';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import { EventResponse } from '@core/models/event.model';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    GoogleMapsModule,
    MatSnackBarModule
  ]
})
export class EventDetailsComponent implements OnInit {
  event$: Observable<EventResponse | null>;
  loading = true;
  error: string | null = null;
  isVolunteer$ = this.authService.hasRole(UserRole.VOLUNTEER);
  isOrganizer$: Observable<boolean>;
  
  EventStatus = EventStatus;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/events']);
          return of(null);
        }
        return this.eventService.getEvent(id).pipe(
          catchError(error => {
            this.error = 'Failed to load event details';
            this.snackBar.open(this.error, 'Close', { duration: 3000 });
            return of(null);
          })
        );
      })
    );
    
    this.isOrganizer$ = combineLatest([this.authService.getCurrentUser(), this.event$]).pipe(
      map(([user, event]) => user?.id === event?.organizationId)
    );
  }

  ngOnInit(): void {
    this.event$.subscribe(() => this.loading = false);
  }

  onRegister(eventId: string): void {
    this.eventService.registerForEvent(eventId).subscribe({
      next: () => {
        this.snackBar.open('Successfully registered for event', 'Close', { duration: 3000 });
        // Reload event details
        this.loadEvent(eventId);
      },
      error: () => {
        this.snackBar.open('Failed to register for event', 'Close', { duration: 3000 });
      }
    });
  }

  onCancelRegistration(eventId: string): void {
    this.eventService.cancelRegistration(eventId).subscribe({
      next: () => {
        this.snackBar.open('Registration cancelled', 'Close', { duration: 3000 });
        // Reload event details
        this.loadEvent(eventId);
      },
      error: () => {
        this.snackBar.open('Failed to cancel registration', 'Close', { duration: 3000 });
      }
    });
  }

  private loadEvent(id: string): void {
    this.event$ = this.eventService.getEvent(id);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 