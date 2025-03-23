import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';

import { IEvent } from '../../../../../core/models/event.types';
import { EventService } from '../../../../../core/services/event.service';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserRole } from '../../../../../core/enums/user-role.enum';
import { EventStatus, EventCategory } from '../../../../../core/models/event.types';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { format } from 'date-fns';
import { Page } from '../../../../../core/models/page.model';
import { IEventFilters } from '../../../../../core/models/event.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  timestamp: string;
  status: number;
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-organization-events',
  templateUrl: './organization-events.component.html',
  styleUrls: ['./organization-events.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
  ],
})
export class OrganizationEventsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'title',
    'category',
    'date',
    'location',
    'participants',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<IEvent>;
  EventStatus = EventStatus;
  pageSize = 10;
  pageIndex = 0;
  private organizationId: string | null = null;
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  
  // Add Math reference for template
  Math = Math;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Add refresh interval in milliseconds (30 seconds)
  private readonly REFRESH_INTERVAL = 30000;
  private autoRefreshSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<IEvent>();
    this.organizationId = this.authService.getCurrentOrganizationId();
  }

  ngOnInit(): void {
    if (this.organizationId) {
      this.loadEvents();
      this.setupAutoRefresh();
    } else {
      this.error$.next('Organization ID not found');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Clean up the subscription when component is destroyed
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  private setupAutoRefresh(): void {
    // Auto-refresh events every REFRESH_INTERVAL
    this.autoRefreshSubscription = interval(this.REFRESH_INTERVAL)
      .pipe(
        tap(() => console.log('Auto-refreshing events with updated statuses')),
        switchMap(() => {
          if (this.organizationId) {
            return this.organizationService.getOrganizationEvents(
              this.organizationId,
              this.pageIndex,
              this.pageSize
            );
          }
          throw new Error('No organization ID available');
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Auto-refresh events response:', response);
          this.processEventsResponse(response);
        },
        error: (error) => {
          console.error('Error during auto-refresh:', error);
          // Don't show error to user during auto-refresh
        }
      });
  }
  
  // Extract the processing logic to be reused by both manual and auto refresh
  private processEventsResponse(response: any): void {
    let eventsData: any;
    
    if (response && response.success && Array.isArray(response.data)) {
      eventsData = {
        content: response.data.map((event: any) => this.normalizeEventData(event)),
        totalElements: response.data.length,
        size: this.pageSize,
        number: this.pageIndex
      };
    } else if (response && response.success && response.data && Array.isArray(response.data.content)) {
      eventsData = {
        ...response.data,
        content: response.data.content.map((event: any) => this.normalizeEventData(event))
      };
    } else if (response && Array.isArray(response.content)) {
      eventsData = {
        ...response,
        content: response.content.map((event: any) => this.normalizeEventData(event))
      };
    } else if (response && response.success && !response.data) {
      eventsData = {
        content: [],
        totalElements: 0,
        size: this.pageSize,
        number: this.pageIndex
      };
    } else if (Array.isArray(response)) {
      eventsData = {
        content: response.map((event: any) => this.normalizeEventData(event)),
        totalElements: response.length,
        size: this.pageSize,
        number: this.pageIndex
      };
    } else {
      console.error('Invalid response format:', response);
      return;
    }
    
    if (!eventsData.content || eventsData.content.length === 0) {
      console.log('No events found in the response');
      return;
    }
    
    this.dataSource.data = eventsData.content;
    
    if (this.paginator) {
      this.paginator.length = eventsData.totalElements;
      this.paginator.pageSize = eventsData.size;
      this.paginator.pageIndex = eventsData.number;
    }
  }

  loadEvents(page = 0): void {
    if (!this.organizationId) {
      console.error('Organization ID is missing');
      this.error$.next('Organization ID is missing');
      return;
    }

    console.log('Loading events for organization:', this.organizationId);
    this.loading$ = new BehaviorSubject<boolean>(true);
    this.error$ = new BehaviorSubject<string | null>(null);

    this.organizationService
      .getOrganizationEvents(
        this.organizationId,
        page,
        this.pageSize
      )
      .pipe(finalize(() => this.loading$.next(false)))
      .subscribe({
        next: (response: any) => {
          console.log('Events response:', response);
          this.processEventsResponse(response);
        },
        error: (error: any) => {
          console.error('Error loading events:', error);
          let errorMessage = 'Failed to load events. Please try again.';

          if (error.status === 401) {
            errorMessage = 'You are not authorized to view these events.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to access these events.';
          } else if (error.status === 404) {
            errorMessage = 'Organization not found.';
          } else if (error.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }

          this.error$.next(errorMessage);
        },
      });
  }

  isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  isOrganizer(): boolean {
    return this.authService.hasRole(UserRole.ORGANIZATION);
  }

  getCurrentOrganizationId(): string {
    return this.authService.getCurrentOrganizationId() || '';
  }

  viewDetails(event: IEvent): void {
    const eventId = event._id || event.id;
    if (eventId) {
      this.router.navigate(['/organization/events', eventId]);
    } else {
      console.error('Event details error:', event);
      this.snackBar.open(
        'Unable to view event details: Invalid event ID',
        'Close',
        {
          duration: 3000,
        }
      );
    }
  }

  private getStatusColorClasses(status: EventStatus): string {
    const colorClasses: Record<EventStatus, string> = {
      [EventStatus.DRAFT]: 'text-gray-700 bg-gray-100',
      [EventStatus.PUBLISHED]: 'text-blue-700 bg-blue-100',
      [EventStatus.ONGOING]: 'text-green-700 bg-green-100',
      [EventStatus.COMPLETED]: 'text-purple-700 bg-purple-100',
      [EventStatus.CANCELLED]: 'text-red-700 bg-red-100',
      [EventStatus.PENDING]: 'text-yellow-700 bg-yellow-100',
      [EventStatus.APPROVED]: 'text-green-700 bg-green-100',
      [EventStatus.ACTIVE]: 'text-blue-700 bg-blue-100',
      [EventStatus.UPCOMING]: 'text-teal-700 bg-teal-100',
      [EventStatus.REJECTED]: 'text-red-700 bg-red-100',
      [EventStatus.FULL]: 'text-orange-700 bg-orange-100'
    };
    return colorClasses[status] || colorClasses[EventStatus.DRAFT];
  }

  updateStatus(event: IEvent): void {
    const nextStatus = this.getNextStatus(event.status);
    if (!nextStatus) {
      this.snackBar.open('No valid status transition available', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Update Event Status',
        message: `Are you sure you want to update the status of "${
          event.title
        }" from ${this.formatStatus(event.status)} to ${this.formatStatus(
          nextStatus
        )}?`,
        confirmText: 'Update',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && event._id) {
        this.eventService.updateEventStatus(event._id, nextStatus).subscribe({
          next: () => {
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error updating event status:', error);
            this.snackBar.open('Error updating event status', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  confirmDelete(event: IEvent): void {
    const eventId = event.id || event._id;
    if (!eventId) {
      console.error('Event ID is missing');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Event',
        message: `Are you sure you want to delete the event "${event.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventService.deleteEvent(eventId).subscribe({
          next: () => {
            this.loadEvents();
            this.snackBar.open('Event deleted successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.snackBar.open('Error deleting event', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  cancelEvent(event: IEvent): void {
    const eventId = event._id || event.id;
    if (!eventId) {
      console.error('Event ID is missing');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Event',
        message: `Are you sure you want to cancel the event "${event.title}"?`,
        confirmText: 'Cancel Event',
        cancelText: 'Keep Event',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventService.cancelEvent(eventId).subscribe({
          next: () => {
            this.loadEvents();
            this.snackBar.open('Event cancelled successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            console.error('Error cancelling event:', error);
            this.snackBar.open('Error cancelling event', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  viewParticipants(event: IEvent): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '600px',
      data: {
        title: 'Event Participants',
        message: `
          Registered Participants: ${event.registeredParticipants?.length || 0}
          Waitlisted Participants: ${event.waitlistedParticipants?.length || 0}
          Available Spots: ${
            event.maxParticipants - (event.currentParticipants || 0)
          }
        `,
        confirmText: 'Close',
        showCancel: false,
      },
    });
  }

  formatDate(date: Date): string {
    return format(new Date(date), 'PPp');
  }

  formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      EDUCATION: 'blue',
      HEALTH: 'green',
      ENVIRONMENT: 'teal',
      SOCIAL_SERVICES: 'purple',
      ARTS_AND_CULTURE: 'pink',
      SPORTS_AND_RECREATION: 'orange',
      OTHER: 'gray',
    };
    return colorMap[category.toUpperCase()] || 'gray';
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      DRAFT: 'gray',
      PUBLISHED: 'blue',
      ONGOING: 'green',
      COMPLETED: 'purple',
      CANCELLED: 'red',
    };
    return colorMap[status.toUpperCase()] || 'gray';
  }

  private getNextStatus(currentStatus: EventStatus): EventStatus | null {
    const statusFlow: Record<EventStatus, EventStatus | null> = {
      [EventStatus.DRAFT]: EventStatus.PENDING,
      [EventStatus.PUBLISHED]: EventStatus.ONGOING,
      [EventStatus.ONGOING]: EventStatus.COMPLETED,
      [EventStatus.COMPLETED]: null,
      [EventStatus.CANCELLED]: null,
      [EventStatus.PENDING]: EventStatus.APPROVED,
      [EventStatus.APPROVED]: EventStatus.ACTIVE,
      [EventStatus.ACTIVE]: EventStatus.ONGOING,
      [EventStatus.UPCOMING]: EventStatus.ACTIVE,
      [EventStatus.REJECTED]: EventStatus.PENDING,
      [EventStatus.FULL]: EventStatus.ACTIVE
    };

    return statusFlow[currentStatus] || null;
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  formatRating(rating: number, numberOfRatings: number): string {
    if (!rating || !numberOfRatings) return 'No ratings yet';
    return `${rating.toFixed(1)} (${numberOfRatings} ${
      numberOfRatings === 1 ? 'rating' : 'ratings'
    })`;
  }

  onSort(event: Sort) {
    const data = this.dataSource.data.slice();
    if (!event.active || event.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = event.direction === 'asc';
      switch (event.active) {
        case 'title':
          return this.compare(a.title, b.title, isAsc);
        case 'category':
          return this.compare(a.category, b.category, isAsc);
        case 'date':
          return this.compare(
            new Date(a.startDate),
            new Date(b.startDate),
            isAsc
          );
        case 'location':
          return this.compare(a.location, b.location, isAsc);
        case 'participants':
          return this.compare(
            a.currentParticipants,
            b.currentParticipants,
            isAsc
          );
        case 'status':
          return this.compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    if (a === null || a === undefined) return isAsc ? -1 : 1;
    if (b === null || b === undefined) return isAsc ? 1 : -1;
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  formatParticipants(event: IEvent): string {
    return `${event.currentParticipants || 0} / ${event.maxParticipants}`;
  }

  getAvailableSpots(event: IEvent): number {
    return event.maxParticipants - (event.currentParticipants || 0);
  }

  isRegistrationOpen(event: IEvent): boolean {
    return event.status === 'PENDING' || event.status === 'PUBLISHED';
  }

  isInProgress(event: IEvent): boolean {
    return event.status === 'ONGOING';
  }

  isCompleted(event: IEvent): boolean {
    return event.status === 'COMPLETED';
  }

  // New helper method to normalize event data
  private normalizeEventData(event: any): IEvent {
    if (!event) {
      console.warn('Received null/undefined event object');
      return this.createEmptyEvent();
    }
    
    // Ensure id is set
    const id = event.id || event._id || '';
    if (!id) {
      console.warn('Event has no ID:', event);
    }
    
    return {
      id: id,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      category: event.category || 'OTHER',
      startDate: event.startDate ? new Date(event.startDate) : new Date(),
      endDate: event.endDate ? new Date(event.endDate) : new Date(),
      location: event.location || 'No location specified',
      maxParticipants: typeof event.maxParticipants === 'number' ? event.maxParticipants : 0,
      currentParticipants: typeof event.currentParticipants === 'number' ? event.currentParticipants : 0,
      status: event.status || EventStatus.DRAFT,
      organizationId: event.organizationId || this.organizationId || '',
      contactPerson: event.contactPerson || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      durationHours: typeof event.durationHours === 'number' ? event.durationHours : 0,
      registeredParticipants: Array.isArray(event.registeredParticipants) ? event.registeredParticipants : [],
      waitlistedParticipants: Array.isArray(event.waitlistedParticipants) ? event.waitlistedParticipants : [],
      waitlistEnabled: !!event.waitlistEnabled,
      maxWaitlistSize: typeof event.maxWaitlistSize === 'number' ? event.maxWaitlistSize : 0,
      // Preserve all other properties
      ...event
    };
  }
  
  private createEmptyEvent(): IEvent {
    return {
      id: '',
      _id: '',
      title: 'Untitled Event',
      description: '',
      category: 'OTHER',
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
      location: 'No location specified',
      maxParticipants: 0,
      currentParticipants: 0,
      status: EventStatus.DRAFT,
      organizationId: this.organizationId || '',
      organizationName: '',
      requiresBackground: false,
      durationHours: 0,
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      registeredParticipants: [],
      waitlistedParticipants: [],
      waitlistEnabled: false,
      maxWaitlistSize: 0
    };
  }

  // Debug helper method
  debugEvents(): void {
    console.log('Debug: Organization ID:', this.organizationId);
    console.log('Debug: Current user roles:', this.authService.hasRole(UserRole.ORGANIZATION) ? 'ORGANIZATION' : 'OTHER');
    console.log('Debug: Data source data:', this.dataSource.data);
    
    // Test with mock data if needed
    if (this.dataSource.data.length === 0) {
      console.log('Debug: Adding mock data for testing');
      const mockEvents = this.generateMockEvents();
      this.dataSource.data = mockEvents;
      if (this.paginator) {
        this.paginator.length = mockEvents.length;
      }
      this.error$.next(null);
    } else {
      // If there is data, just reload
      this.loadEvents();
    }
  }
  
  // Generate mock events for testing
  private generateMockEvents(): IEvent[] {
    const categories = ['ENVIRONMENT', 'EDUCATION', 'HEALTH', 'SOCIAL_SERVICES', 'OTHER'];
    const statuses = [EventStatus.DRAFT, EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.CANCELLED];
    
    return Array(5).fill(0).map((_, i) => ({
      ...this.createEmptyEvent(),
      id: `mock-${i}`,
      title: `Mock Event ${i+1}`,
      description: 'This is a mock event for testing',
      category: categories[i % categories.length],
      status: statuses[i % statuses.length],
      startDate: new Date(Date.now() + 86400000 * i),
      endDate: new Date(Date.now() + 86400000 * (i + 1)),
      location: `Mock Location ${i+1}`,
      maxParticipants: 20 + i * 5,
      currentParticipants: i * 3,
      durationHours: 2 + i
    }));
  }
  
  // Pagination helper methods
  showPageNumber(current: number, position: number, total: number): boolean {
    // Return true if this position should show a page number
    if (total <= 5) return position < total;
    
    if (current <= 2) {
      // Show first 5 pages
      return position < 5;
    } else if (current >= total - 3) {
      // Show last 5 pages
      return position >= 0 && total - position <= 5;
    } else {
      // Show 2 before and 2 after current
      return Math.abs(current - position) <= 2;
    }
  }

  pageNumberToShow(current: number, position: number, total: number): number {
    // Return the page number that should be shown at this position
    if (total <= 5) return position;
    
    if (current <= 2) {
      // First 5 pages
      return position;
    } else if (current >= total - 3) {
      // Last 5 pages
      return total - 5 + position;
    } else {
      // Show current in the middle with 2 on each side
      return current - 2 + position;
    }
  }

  // Add a method to determine if the event is a draft
  isDraftEvent(event: IEvent): boolean {
    return event.status === EventStatus.DRAFT;
  }

  // Add a method to submit a draft event for approval
  submitDraftForApproval(event: IEvent): void {
    const eventId = event.id || event._id;
    if (!eventId) {
      console.error('Event ID is missing');
      this.snackBar.open('Cannot submit event: Invalid event ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Submit Event for Approval',
        message: `Are you sure you want to submit "${event.title}" for approval? Once submitted, the event will be reviewed by administrators.`,
        confirmText: 'Submit',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventService
          .updateEventStatus(eventId, EventStatus.PENDING)
          .subscribe({
            next: () => {
              this.loadEvents();
              this.snackBar.open('Event submitted for approval', 'Close', {
                duration: 3000,
              });
            },
            error: (error) => {
              console.error('Error submitting event for approval:', error);
              this.snackBar.open('Error submitting event for approval', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }
}
