import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { IEvent, EventStatus, EventCategory, EventParticipationStatus } from '../../../../../core/models/event.types';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as EventActions from '../../../../../store/event/event.actions';
import { selectEventContent, selectEventLoading, selectEventTotalElements, selectEventError } from '../../../../../store/event/event.selectors';
import { AuthService } from '../../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './organization-events.component.html',
  styleUrls: ['./organization-events.component.scss']
})
export class OrganizationEventsComponent implements OnInit, OnDestroy {
  events$: Observable<IEvent[]>;
  loading$: Observable<boolean>;
  totalElements$: Observable<number>;
  error$: Observable<string | null>;
  displayedColumns: string[] = [
    'title',
    'category',
    'date',
    'location',
    'status',
    'participants',
    'rating',
    'actions'
  ];
  dataSource = new MatTableDataSource<IEvent>([]);
  pageSize = 10;
  pageIndex = 0;
  private destroy$ = new Subject<void>();
  private organizationId: string | null = null;
  EventStatus = EventStatus;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.events$ = this.store.select(selectEventContent);
    this.loading$ = this.store.select(selectEventLoading);
    this.totalElements$ = this.store.select(selectEventTotalElements);
    this.error$ = this.store.select(selectEventError);
  }

  ngOnInit(): void {
    console.log('Initializing OrganizationEventsComponent');
    
    this.organizationId = this.authService.getCurrentOrganizationId();
    console.log('Organization ID:', this.organizationId);
    
    if (!this.organizationId) {
      console.error('No organization ID found');
      this.snackBar.open('Please log in as an organization first', 'Close', { duration: 5000 });
      this.router.navigate(['/auth/login']);
      return;
    }
    
    console.log('Loading events for organization:', this.organizationId);
    this.loadEvents();
    
    // Subscribe to events updates
    this.events$.pipe(
      takeUntil(this.destroy$),
      tap(events => {
        console.log('========== EVENTS DATA FLOW ==========');
        console.log('1. Raw events received from store:', events);
        
        if (events && events.length > 0) {
          // Log the complete first event for debugging
          console.log('2. Complete first event:', events[0]);

          // Convert date strings to Date objects and ensure all required fields are present
          const processedEvents = events.map(event => {
            // Parse dates safely
            let startDate = new Date();
            let endDate = new Date();
            
            try {
              if (event.startDate) {
                startDate = new Date(event.startDate);
                if (isNaN(startDate.getTime())) {
                  console.warn('Invalid startDate, using current date');
                  startDate = new Date();
                }
              }
              
              if (event.endDate) {
                endDate = new Date(event.endDate);
                if (isNaN(endDate.getTime())) {
                  console.warn('Invalid endDate, using current date');
                  endDate = new Date();
                }
              }
            } catch (error) {
              console.error('Error parsing dates:', error);
            }

            return {
              ...event,
              title: event.title || 'Untitled Event',
              category: event.category || EventCategory.OTHER,
              startDate,
              endDate,
              location: event.location || 'No location specified',
              status: event.status || EventStatus.DRAFT,
              registeredParticipants: event.registeredParticipants || [],
              maxParticipants: event.maxParticipants || 0
            };
          });

          console.log('3. Processed first event:', processedEvents[0]);
          
          this.dataSource.data = processedEvents;
          console.log('4. Data source after update:', {
            dataLength: this.dataSource.data.length,
            firstRow: this.dataSource.data[0],
            sortActive: this.dataSource.sort?.active,
            sortDirection: this.dataSource.sort?.direction
          });
          console.log('====================================');
          
          // Initialize sorting if not already done
          if (this.sort && !this.dataSource.sort) {
            this.dataSource.sort = this.sort;
          }
        } else {
          console.log('No events received or empty array');
          this.dataSource.data = [];
        }
      })
    ).subscribe();

    // Subscribe to loading state
    this.loading$.pipe(
      takeUntil(this.destroy$),
      tap(loading => {
        console.log('Loading state:', loading);
      })
    ).subscribe();

    // Subscribe to error state
    this.error$.pipe(
      takeUntil(this.destroy$),
      tap(error => {
        if (error) {
          console.error('Error loading events:', error);
          this.snackBar.open('Error loading events', 'Close', { duration: 5000 });
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    if (!this.organizationId) {
      console.log('No organization ID available');
      return;
    }

    console.log('Loading events for organization:', this.organizationId);
    const action = EventActions.loadEvents({
      filters: { organizationId: this.organizationId },
      page: this.pageIndex,
      size: this.pageSize
    });
    console.log('Dispatching loadEvents action:', action);
    this.store.dispatch(action);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadEvents();
  }

  onSort(sort: Sort): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadEvents();
  }

  formatStatus(status: EventStatus): string {
    if (!status) return '';
    return status.toString()
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatCategory(category: EventCategory): string {
    if (!category) return '';
    return category.toString()
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  formatRating(rating: number, numberOfRatings: number): string {
    if (!rating || !numberOfRatings) return 'No ratings';
    return `${rating.toFixed(1)} (${numberOfRatings} ${numberOfRatings === 1 ? 'rating' : 'ratings'})`;
  }

  canUpdateStatus(event: IEvent): boolean {
    if (!event) return false;
    return event.status !== EventStatus.COMPLETED && 
           event.status !== EventStatus.CANCELLED;
  }

  canDelete(event: IEvent): boolean {
    if (!event) return false;
    return event.status === EventStatus.DRAFT || 
           event.status === EventStatus.CANCELLED ||
           (event.status === EventStatus.PENDING && event.registeredParticipants.length === 0);
  }

  getNextStatus(currentStatus: EventStatus): EventStatus | null {
    switch (currentStatus) {
      case EventStatus.DRAFT:
        return EventStatus.PENDING;
      case EventStatus.PENDING:
        return EventStatus.APPROVED;
      case EventStatus.APPROVED:
        return EventStatus.ACTIVE;
      case EventStatus.ACTIVE:
        return EventStatus.ONGOING;
      case EventStatus.ONGOING:
        return EventStatus.COMPLETED;
      default:
        return null;
    }
  }

  updateStatus(event: IEvent): void {
    const newStatus = this.getNextStatus(event.status);
    if (!newStatus) {
      this.snackBar.open('Invalid status transition', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Update Event Status',
        message: `Are you sure you want to change the status of "${event.title}" from ${this.formatStatus(event.status)} to ${this.formatStatus(newStatus)}?`,
        confirmText: 'Update',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && event._id) {
        this.store.dispatch(EventActions.updateEventStatus({
          id: event._id,
          status: newStatus
        }));
      }
    });
  }

  confirmDelete(event: IEvent): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Event',
        message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && event._id) {
        this.store.dispatch(EventActions.deleteEvent({ id: event._id }));
      }
    });
  }

  viewDetails(event: IEvent): void {
    // TODO: Implement event details dialog
    console.log('View details:', event);
  }

  viewParticipants(event: IEvent): void {
    // TODO: Implement participants dialog
    console.log('View participants:', event);
  }

  cancelEvent(event: IEvent): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Event',
        message: `Are you sure you want to cancel "${event.title}"? This action cannot be undone.`,
        confirmText: 'Cancel Event',
        cancelText: 'Keep Event'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && event._id) {
        this.store.dispatch(EventActions.updateEventStatus({
          id: event._id,
          status: EventStatus.CANCELLED
        }));
      }
    });
  }

  getStatusColor(status: EventStatus): string {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'green';
      case EventStatus.COMPLETED:
        return 'blue';
      case EventStatus.CANCELLED:
        return 'red';
      case EventStatus.PENDING:
        return 'yellow';
      case EventStatus.APPROVED:
        return 'indigo';
      case EventStatus.DRAFT:
        return 'gray';
      case EventStatus.UPCOMING:
        return 'purple';
      case EventStatus.ONGOING:
        return 'green';
      case EventStatus.PUBLISHED:
        return 'blue';
      default:
        return 'gray';
    }
  }

  getCategoryColor(category: EventCategory): string {
    switch (category) {
      case EventCategory.ENVIRONMENT:
        return 'green';
      case EventCategory.COMMUNITY_DEVELOPMENT:
        return 'blue';
      case EventCategory.ARTS_AND_CULTURE:
        return 'purple';
      case EventCategory.EDUCATION:
        return 'yellow';
      case EventCategory.ANIMAL_WELFARE:
        return 'red';
      case EventCategory.SPORTS_AND_RECREATION:
        return 'indigo';
      case EventCategory.HEALTH:
        return 'pink';
      case EventCategory.DISASTER_RELIEF:
        return 'orange';
      case EventCategory.SOCIAL_SERVICES:
        return 'teal';
      case EventCategory.OTHER:
      default:
        return 'gray';
    }
  }
} 