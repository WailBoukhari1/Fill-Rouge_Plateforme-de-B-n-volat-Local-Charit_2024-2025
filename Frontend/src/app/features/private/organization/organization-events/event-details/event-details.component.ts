import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, retry, catchError, throwError, finalize } from 'rxjs';
import { EventService } from '@core/services/event.service';
import { IEvent, EventStatus } from '@core/models/event.model';
import { AuthService } from '@core/services/auth.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Page } from '@core/models/page.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ]
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  event: IEvent | null = null;
  loading = false;
  error: string | null = null;
  isOrganizer = false;
  private currentUserId: string | null = null;
  private destroy$ = new Subject<void>();
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  events: IEvent[] = [];
  eventId: string | null = null;
  EventStatus = EventStatus; // Make enum available in template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(eventId);
    } else {
      this.error = 'Event ID is required';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEventDetails(eventId: string): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEventById(eventId)
      .pipe(
        retry(3),
        catchError(error => {
          console.error('Error loading event details:', error);
          if (error.status === 404) {
            this.error = 'Event not found';
          } else {
            this.error = 'Failed to load event details. Please try again later.';
          }
          return throwError(() => error);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (event: IEvent) => {
          this.event = event;
          this.isOrganizer = Boolean(this.currentUserId) && this.currentUserId === event.organizationId;
        }
      });
  }

  canRegister(): boolean {
    if (!this.event) return false;
    return this.event.status === EventStatus.UPCOMING || 
           this.event.status === EventStatus.ACTIVE ||
           this.event.status === EventStatus.PUBLISHED;
  }

  registerForEvent(): void {
    if (!this.event?.id) return;

    this.loading = true;
    this.eventService.quickRegisterForEvent(this.event.id)
      .pipe(
        retry(1),
        catchError(error => {
          console.error('Error registering for event:', error);
          this.snackBar.open(
            error.status === 400 ? 'You are already registered for this event' :
            error.status === 404 ? 'Event not found' :
            'Failed to register for event. Please try again.',
            'Close',
            { duration: 5000 }
          );
          return throwError(() => error);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (event: IEvent) => {
          this.event = event;
          this.snackBar.open('Successfully registered for event!', 'Close', { duration: 3000 });
        }
      });
  }

  unregisterFromEvent(): void {
    if (!this.event?.id) return;

    this.loading = true;
    this.eventService.unregisterFromEvent(this.event.id)
      .pipe(
        retry(1),
        catchError(error => {
          console.error('Error unregistering from event:', error);
          this.snackBar.open(
            error.status === 400 ? 'You are not registered for this event' :
            error.status === 404 ? 'Event not found' :
            'Failed to unregister from event. Please try again.',
            'Close',
            { duration: 5000 }
          );
          return throwError(() => error);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (event: IEvent) => {
          this.event = event;
          this.snackBar.open('Successfully unregistered from event!', 'Close', { duration: 3000 });
        }
      });
  }

  editEvent(): void {
    if (this.event?.id) {
      this.router.navigate(['../edit', this.event.id], { relativeTo: this.route });
    }
  }

  getStatusClass(): string {
    if (!this.event) return '';
    
    const statusClassMap: Record<string, string> = {
      'DRAFT': 'bg-gray-600 text-white',
      'PENDING': 'bg-yellow-500 text-white',
      'PUBLISHED': 'bg-blue-500 text-white',
      'ACTIVE': 'bg-green-500 text-white',
      'ONGOING': 'bg-indigo-500 text-white',
      'COMPLETED': 'bg-purple-500 text-white',
      'CANCELLED': 'bg-red-500 text-white'
    };
    
    return statusClassMap[this.event.status] || 'bg-gray-600 text-white';
  }

  formatDate(date: Date | string | undefined | null): string {
    if (!date) return 'Not specified';
    
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDifficultyColor(): string {
    if (!this.event || !this.event.difficulty) return 'text-gray-600';
    
    const difficultyClassMap: Record<string, string> = {
      'BEGINNER': 'text-green-600',
      'INTERMEDIATE': 'text-blue-600',
      'ADVANCED': 'text-purple-600',
      'EXPERT': 'text-red-600'
    };
    
    return difficultyClassMap[this.event.difficulty.toUpperCase()] || 'text-gray-600';
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents(this.currentPage, this.pageSize)
      .pipe(
        retry(3),
        catchError(error => {
          this.snackBar.open('Failed to load events. Please try again later.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return throwError(() => error);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (page) => {
          this.events = page.content;
          this.totalItems = page.totalElements;
          this.totalPages = page.totalPages;
        },
        error: (error) => {
          console.error('Error loading events:', error);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }
}