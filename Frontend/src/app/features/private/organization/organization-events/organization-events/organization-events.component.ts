import { Component, OnInit, ViewChild } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs';

import { IEvent } from '../../../../../core/models/event.types';
import { EventService } from '../../../../../core/services/event.service';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserRole } from '../../../../../core/enums/user-role.enum';
import { EventStatus } from '../../../../../core/models/event.types';
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
export class OrganizationEventsComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'category',
    'date',
    'location',
    'participants',
    'status',
    'actions'
  ];
  dataSource: MatTableDataSource<IEvent>;
  EventStatus = EventStatus;
  pageSize = 10;
  pageIndex = 0;
  private organizationId: string | null = null;
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
    } else {
      this.error$.next('Organization ID not found');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEvents(): void {
    if (!this.organizationId) return;

    this.loading$.next(true);
    this.error$.next(null);

    const filters: IEventFilters = {
      organizationId: this.organizationId,
      sortBy: 'startDate',
      sortDirection: 'desc' as 'desc'
    };

    this.eventService.getEventsByOrganization(this.organizationId, this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (Array.isArray(response)) {
          this.dataSource.data = response;
          if (this.paginator) {
            this.paginator.length = response.length;
            this.paginator.pageSize = this.pageSize;
            this.paginator.pageIndex = this.pageIndex;
          }
          this.loading$.next(false);
        } else {
          console.error('Invalid response format:', response);
          this.error$.next('Invalid response format');
          this.loading$.next(false);
        }
      },
      error: (error: Error) => {
        console.error('Error loading events:', error);
        this.error$.next('Failed to load events. Please try again.');
        this.loading$.next(false);
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
      this.snackBar.open('Unable to view event details: Invalid event ID', 'Close', {
        duration: 3000,
      });
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
      [EventStatus.UPCOMING]: 'text-teal-700 bg-teal-100'
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
    if (!event._id) {
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
        this.eventService
          .updateEventStatus(event._id!, EventStatus.CANCELLED)
          .subscribe({
            next: () => {
              this.loadEvents();
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
    const statusFlow = {
      [EventStatus.DRAFT]: EventStatus.PUBLISHED,
      [EventStatus.PUBLISHED]: EventStatus.ONGOING,
      [EventStatus.ONGOING]: EventStatus.COMPLETED,
      [EventStatus.COMPLETED]: null,
      [EventStatus.CANCELLED]: null,
      [EventStatus.PENDING]: EventStatus.APPROVED,
      [EventStatus.APPROVED]: EventStatus.ACTIVE,
      [EventStatus.ACTIVE]: EventStatus.ONGOING,
      [EventStatus.UPCOMING]: EventStatus.ACTIVE,
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
    return `${rating.toFixed(1)} (${numberOfRatings} ${numberOfRatings === 1 ? 'rating' : 'ratings'})`;
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
          return this.compare(new Date(a.startDate), new Date(b.startDate), isAsc);
        case 'location':
          return this.compare(a.location, b.location, isAsc);
        case 'participants':
          return this.compare(a.currentParticipants, b.currentParticipants, isAsc);
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
}
