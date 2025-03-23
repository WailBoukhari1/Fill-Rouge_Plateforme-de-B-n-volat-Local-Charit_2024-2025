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
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EventDetailsDialogComponent } from '../../../../shared/components/event-details-dialog/event-details-dialog.component';
import { EventStatusDialogComponent } from '../../../../shared/components/event-status-dialog/event-status-dialog.component';
import { ImagePlaceholderService } from '../../../../shared/services/image-placeholder.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Event Management</h1>
      </div>

      <mat-card>
        <div *ngIf="loading" class="flex justify-center p-4">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        
        <div *ngIf="!loading" class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <!-- Image Column -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>Image</th>
              <td mat-cell *matCellDef="let event">
                <img [src]="getEventImageUrl(event)" 
                     alt="Event image"
                     class="w-10 h-10 rounded-full object-cover">
              </td>
            </ng-container>

            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let event">{{event.title}}</td>
            </ng-container>

            <!-- Organization Column -->
            <ng-container matColumnDef="organization">
              <th mat-header-cell *matHeaderCellDef>Organization</th>
              <td mat-cell *matCellDef="let event">
                {{event.organizationName || 'Organization ' + event.organizationId}}
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let event">
                {{event.startDate | date:'medium'}}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let event">
                <mat-chip [color]="getStatusColor(event.status)" [ngClass]="getStatusClass(event.status)">
                  {{event.status}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let event">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewDetails(event)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="updateEventStatusDialog(event)">
                    <mat-icon>update</mat-icon>
                    <span>Update Status</span>
                  </button>
                  <ng-container *ngIf="event.status !== 'ACTIVE' && event.status !== 'APPROVED'">
                    <button mat-menu-item (click)="approveEvent(event)">
                      <mat-icon>check_circle</mat-icon>
                      <span>Approve</span>
                    </button>
                  </ng-container>
                  <ng-container *ngIf="event.status !== 'PENDING'">
                    <button mat-menu-item (click)="pendingEvent(event)">
                      <mat-icon>pending</mat-icon>
                      <span>Set as Pending</span>
                    </button>
                  </ng-container>
                  <ng-container *ngIf="event.status !== 'REJECTED'">
                    <button mat-menu-item (click)="rejectEvent(event)">
                      <mat-icon>block</mat-icon>
                      <span>Reject</span>
                    </button>
                  </ng-container>
                  <ng-container *ngIf="event.status !== 'CANCELLED'">
                    <button mat-menu-item (click)="cancelEvent(event)">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel</span>
                    </button>
                  </ng-container>
                  <button mat-menu-item (click)="deleteEvent(event)" class="text-red-500">
                    <mat-icon class="text-red-500">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div *ngIf="error" class="p-4 text-red-600 text-center">
          {{ error }}
        </div>

        <mat-paginator
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `
})
export class EventManagementComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['image', 'title', 'organization', 'date', 'status', 'actions'];
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
    private imagePlaceholderService: ImagePlaceholderService
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'REJECTED':
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
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

  pendingEvent(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Set as Pending',
        message: `Are you sure you want to set "${event.title}" as pending?`,
        confirmText: 'Set as Pending',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateEventStatus(event.id, 'PENDING')
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" has been set to pending.`);
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

  cancelEvent(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Event',
        message: `Are you sure you want to cancel "${event.title}"?`,
        confirmText: 'Cancel Event',
        cancelText: 'Keep Active',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateEventStatus(event.id, 'CANCELLED')
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" has been cancelled.`);
              this.loadEvents();
            },
            error: (err) => {
              console.error('Error cancelling event:', err);
              this.notificationService.error(`Failed to cancel event: ${err.message || 'Unknown error'}`);
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

  updateEventStatusDialog(event: any): void {
    const dialogRef = this.dialog.open(EventStatusDialogComponent, {
      width: '500px',
      data: { event }
    });

    dialogRef.afterClosed().subscribe(newStatus => {
      if (newStatus) {
        this.loading = true;
        this.adminService.updateEventStatus(event.id, newStatus)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notificationService.success(`Event "${event.title}" status changed to ${newStatus}`);
              this.loadEvents();
            },
            error: (err) => {
              console.error(`Error updating event status:`, err);
              this.notificationService.error(`Failed to update event status. Please try again.`);
              this.loading = false;
            }
          });
      }
    });
  }
}