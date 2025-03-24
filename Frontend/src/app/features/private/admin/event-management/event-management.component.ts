import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminService } from '../../../../core/services/admin.service';
import { EventService } from '../../../../core/services/event.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EventDetailsDialogComponent } from '../../../../shared/components/event-details-dialog/event-details-dialog.component';
import { EventStatusDialogComponent } from '../../../../shared/components/event-status-dialog/event-status-dialog.component';
import { ImagePlaceholderService } from '../../../../shared/services/image-placeholder.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EventStatus } from '../../../../core/models/event.types';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Event Management</h1>
            <p class="mt-2 text-gray-600 text-lg">Manage and moderate all events across the platform</p>
          </div>
          <button mat-raised-button 
                  color="primary" 
                  (click)="loadEvents()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2">
            <mat-icon class="text-xl">refresh</mat-icon>
            <span class="font-medium">Refresh Events</span>
          </button>
        </div>

        <!-- Main Content -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <!-- Loading State -->
          <div *ngIf="loading" class="flex justify-center items-center py-16">
            <mat-spinner diameter="48" class="text-blue-600"></mat-spinner>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="p-6 text-center">
            <div class="bg-red-50 border border-red-200 rounded-xl p-6 inline-flex flex-col items-center">
              <mat-icon class="text-red-500 text-4xl mb-4">error_outline</mat-icon>
              <p class="text-red-600 text-lg">{{ error }}</p>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="loadEvents()" 
                class="mt-4 flex items-center gap-2">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          </div>

          <!-- Table -->
          <div *ngIf="!loading && !error" class="overflow-x-auto">
            <table mat-table [dataSource]="dataSource" class="w-full">
              <!-- Image Column -->
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Image</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4">
                  <img [src]="getEventImageUrl(event)" 
                       alt="Event image"
                       class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100">
                </td>
              </ng-container>

              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Title</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{event.title}}</div>
                  <div class="text-sm text-gray-500 line-clamp-2">{{event.description}}</div>
                </td>
              </ng-container>

              <!-- Organization Column -->
              <ng-container matColumnDef="organization">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Organization</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="text-gray-400 mr-2">business</mat-icon>
                    {{event.organizationName || 'N/A'}}
                  </div>
                </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Date</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="text-gray-400 mr-2">calendar_today</mat-icon>
                    {{event.startDate | date: 'MMM d, y'}}
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Status</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4">
                  <span
                    [class]="'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-' +
                    getStatusInfo(event.status).color + '-100 text-' +
                    getStatusInfo(event.status).color + '-800'"
                  >
                    <mat-icon class="h-4 w-4 mr-1">{{ getStatusInfo(event.status).icon }}</mat-icon>
                    {{ getStatusInfo(event.status).displayName }}
                  </span>
                </td>
              </ng-container>

              <!-- Participants Column -->
              <ng-container matColumnDef="participants">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Participants</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="text-gray-400 mr-2">people</mat-icon>
                    {{ event.currentParticipants || 0 }}/{{ event.maxParticipants || 0 }}
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4 text-right">Actions</th>
                <td mat-cell *matCellDef="let event" class="px-6 py-4 text-right">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menu"
                          class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu" class="rounded-xl shadow-lg">
                    <button mat-menu-item (click)="viewDetails(event)" class="hover:bg-gray-50">
                      <mat-icon class="text-blue-500">visibility</mat-icon>
                      <span class="ml-2">View Details</span>
                    </button>
                    
                    <div *ngIf="event.status === 'PENDING'">
                      <button mat-menu-item (click)="approveEvent(event)" class="hover:bg-gray-50">
                        <mat-icon class="text-green-500">check_circle</mat-icon>
                        <span class="ml-2">Approve</span>
                      </button>
                      <button mat-menu-item (click)="rejectEvent(event)" class="hover:bg-gray-50">
                        <mat-icon class="text-red-500">cancel</mat-icon>
                        <span class="ml-2">Reject</span>
                      </button>
                    </div>
                    
                    <div *ngIf="event.status === 'ACTIVE' || event.status === 'FULL'">
                      <button mat-menu-item (click)="changeStatus(event, 'PENDING')" class="hover:bg-gray-50">
                        <mat-icon class="text-yellow-500">pending</mat-icon>
                        <span class="ml-2">Set to Pending</span>
                      </button>
                      <button mat-menu-item (click)="changeStatus(event, 'CANCELLED')" class="hover:bg-gray-50">
                        <mat-icon class="text-red-500">cancel</mat-icon>
                        <span class="ml-2">Cancel Event</span>
                      </button>
                    </div>
                    
                    <div *ngIf="event.status === 'ONGOING'">
                      <button mat-menu-item (click)="changeStatus(event, 'COMPLETED')" class="hover:bg-gray-50">
                        <mat-icon class="text-purple-500">done_all</mat-icon>
                        <span class="ml-2">Mark as Completed</span>
                      </button>
                      <button mat-menu-item (click)="changeStatus(event, 'CANCELLED')" class="hover:bg-gray-50">
                        <mat-icon class="text-red-500">cancel</mat-icon>
                        <span class="ml-2">Cancel Event</span>
                      </button>
                    </div>
                    
                    <div *ngIf="event.status === 'CANCELLED'">
                      <button mat-menu-item (click)="changeStatus(event, 'ACTIVE')" class="hover:bg-gray-50">
                        <mat-icon class="text-blue-500">restore</mat-icon>
                        <span class="ml-2">Restore Event</span>
                      </button>
                    </div>
                    
                    <div *ngIf="event.status === 'REJECTED'">
                      <button mat-menu-item (click)="approveEvent(event)" class="hover:bg-gray-50">
                        <mat-icon class="text-green-500">check_circle</mat-icon>
                        <span class="ml-2">Approve Now</span>
                      </button>
                    </div>
                    
                    <button mat-menu-item (click)="deleteEvent(event)" class="hover:bg-gray-50">
                      <mat-icon class="text-red-500">delete</mat-icon>
                      <span class="ml-2 text-red-500">Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="hover:bg-gray-50 transition-colors duration-200"></tr>
            </table>
          </div>

          <!-- No Data State -->
          <div *ngIf="!loading && !error && dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16">
            <mat-icon class="text-gray-400 text-5xl mb-4">event_busy</mat-icon>
            <p class="text-lg text-gray-600">No events found</p>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="loadEvents()" 
              class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm">
              Refresh Events
            </button>
          </div>

          <!-- Paginator -->
          <mat-paginator
            *ngIf="!loading && !error && dataSource.data.length > 0"
            [length]="totalCount"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 100]"
            [pageIndex]="pageIndex"
            (page)="onPageChange($event)"
            class="border-t border-gray-200">
          </mat-paginator>
        </div>
      </div>
    </div>
  `
})
export class EventManagementComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['image', 'title', 'organization', 'date', 'status', 'participants', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  pageSize = 10;
  pageIndex = 0;
  totalCount = 0;
  
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private imagePlaceholderService: ImagePlaceholderService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getEvents(this.pageIndex, this.pageSize, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Events loaded:', response);
          this.dataSource.data = response.events || [];
          this.totalCount = response.totalEvents || 0;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading events:', err);
          this.error = 'Failed to load events. Please try again.';
          this.loading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  getStatusInfo(status: EventStatus | string) {
    return this.eventService.getEventStatusInfo(status);
  }

  getEventImageUrl(event: any): string {
    if (event && event.imageUrl) {
      return event.imageUrl;
    }
    if (event && (event as any).image) {
      return (event as any).image;
    }
    return this.imagePlaceholderService.getEventPlaceholder();
  }

  viewDetails(event: any): void {
    this.dialog.open(EventDetailsDialogComponent, {
      width: '800px',
      data: {
        event: event,
        isAdminView: true
      }
    });
  }

  approveEvent(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Event',
        message: `Are you sure you want to approve "${event.title}"?`,
        confirmText: 'Approve',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.approveEvent(event.id)
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" has been approved.`);
              this.loadEvents();
            },
            error: (err) => {
              console.error('Error approving event:', err);
              this.notificationService.error(`Failed to approve event: ${err.message || 'Unknown error'}`);
            }
          });
      }
    });
  }

  rejectEvent(event: any): void {
    const dialogRef = this.dialog.open(EventStatusDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Event',
        event: event,
        status: 'REJECTED',
        requireReason: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.rejectEvent(event.id, result.reason)
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" has been rejected.`);
              this.loadEvents();
            },
            error: (err) => {
              console.error('Error rejecting event:', err);
              this.notificationService.error(`Failed to reject event: ${err.message || 'Unknown error'}`);
            }
          });
      }
    });
  }

  /**
   * Changes the status of an event
   * @param event The event to update
   * @param newStatus The new status as a string
   */
  changeStatus(event: any, newStatus: string): void {
    const displayName = this.getStatusInfo(newStatus).displayName;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Update Event Status',
        message: `Are you sure you want to update "${event.title}" to "${displayName}"?`,
        confirmText: 'Update',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateEventStatus(event.id, newStatus)
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" status changed to ${displayName}`);
              this.loadEvents();
            },
            error: (err) => {
              console.error('Error updating event status:', err);
              this.notificationService.error(`Failed to update event status: ${err.message || 'Unknown error'}`);
            }
          });
      }
    });
  }

  deleteEvent(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Event',
        message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteEvent(event.id)
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" has been deleted.`);
              this.loadEvents();
            },
            error: (err) => {
              console.error('Error deleting event:', err);
              this.notificationService.error(`Failed to delete event: ${err.message || 'Unknown error'}`);
            }
          });
      }
    });
  }
}