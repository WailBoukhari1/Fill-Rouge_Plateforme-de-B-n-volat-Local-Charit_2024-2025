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
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Event, EventStatus } from '../../../../core/models/event.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as EventActions from '../../../../store/event/event.actions';
import { selectEvents, selectEventLoading, selectTotalElements, selectEventContent } from '../../../../store/event/event.selectors';
import { AuthService } from '../../../../core/services/auth.service';
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
    MatDialogModule
  ],
  template: `
    <div class="events-container">
      <div class="header">
        <h1>Event Management</h1>
        <button mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Create Event
        </button>
      </div>

      @if (loading$ | async) {
        <div class="loading-wrapper">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSort($event)">
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                <td mat-cell *matCellDef="let event">{{event.title}}</td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let event">{{formatCategory(event.category)}}</td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let event">
                  {{event.startDate | date:'mediumDate'}} - {{event.endDate | date:'mediumDate'}}
                </td>
              </ng-container>

              <!-- Location Column -->
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Location</th>
                <td mat-cell *matCellDef="let event">{{event.location}}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let event">
                  <span class="status-badge" [class]="event.status.toLowerCase()">
                    {{formatStatus(event.status)}}
                  </span>
                </td>
              </ng-container>

              <!-- Participants Column -->
              <ng-container matColumnDef="participants">
                <th mat-header-cell *matHeaderCellDef>Participants</th>
                <td mat-cell *matCellDef="let event">
                  {{event.registeredParticipants?.size || 0}} / {{event.maxParticipants}}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let event">
                  <button mat-icon-button color="primary" [routerLink]="['edit', event.id]" 
                    matTooltip="Edit event">
                    <mat-icon>edit</mat-icon>
                  </button>
                  @if (canUpdateStatus(event)) {
                    <button mat-icon-button color="accent" (click)="updateStatus(event)" 
                      matTooltip="Update status">
                      <mat-icon>update</mat-icon>
                    </button>
                  }
                  @if (canDelete(event)) {
                    <button mat-icon-button color="warn" (click)="confirmDelete(event)" 
                      matTooltip="Delete event">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator 
              [length]="totalElements$ | async"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 100]"
              [showFirstLastButtons]="true"
              (page)="onPageChange($event)"
              aria-label="Select page of events">
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .events-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .loading-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    table {
      width: 100%;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-badge.active {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.completed {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-badge.cancelled {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-badge.full {
      background-color: #ede7f6;
      color: #4527a0;
    }

    .status-badge.ongoing {
      background-color: #e0f2f1;
      color: #00695c;
    }

    .status-badge.scheduled {
      background-color: #f3e5f5;
      color: #6a1b9a;
    }

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .mat-column-status {
      width: 120px;
    }

    .mat-column-participants {
      width: 100px;
      text-align: center;
    }
  `]
})
export class OrganizationEventsComponent implements OnInit, OnDestroy {
  events$: Observable<Event[]>;
  loading$: Observable<boolean>;
  totalElements$: Observable<number>;
  displayedColumns: string[] = ['title', 'category', 'date', 'location', 'status', 'participants', 'actions'];
  dataSource: MatTableDataSource<Event>;
  
  pageSize = 10;
  pageIndex = 0;
  private destroy$ = new Subject<void>();
  private organizationId: string | null = null;

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
    this.totalElements$ = this.store.select(selectTotalElements);
    this.dataSource = new MatTableDataSource<Event>();
  }

  ngOnInit(): void {
    this.organizationId = localStorage.getItem('organizationId');
    if (!this.organizationId) {
      this.snackBar.open('Please log in as an organization first', 'Close', { duration: 5000 });
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadEvents();
    
    // Subscribe to events updates
    this.events$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(events => {
      this.dataSource.data = events || [];
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvents(): void {
    if (!this.organizationId) {
      return;
    }

    this.store.dispatch(EventActions.loadEvents({
      filters: {},
      page: this.pageIndex,
      size: this.pageSize
    }));
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
    return status.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatCategory(category: string): string {
    return category.toLowerCase()
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  canUpdateStatus(event: Event): boolean {
    return ![EventStatus.COMPLETED, EventStatus.CANCELLED].includes(event.status);
  }

  canDelete(event: Event): boolean {
    return [EventStatus.DRAFT, EventStatus.PENDING].includes(event.status);
  }

  updateStatus(event: Event): void {
    let newStatus: EventStatus;
    
    switch (event.status) {
      case EventStatus.DRAFT:
        newStatus = EventStatus.PENDING;
        break;
      case EventStatus.PENDING:
        newStatus = EventStatus.APPROVED;
        break;
      case EventStatus.APPROVED:
        newStatus = EventStatus.ACTIVE;
        break;
      case EventStatus.ACTIVE:
        newStatus = EventStatus.ONGOING;
        break;
      case EventStatus.UPCOMING:
        newStatus = EventStatus.ACTIVE;
        break;
      case EventStatus.ONGOING:
        newStatus = EventStatus.COMPLETED;
        break;
      case EventStatus.PUBLISHED:
        newStatus = EventStatus.ACTIVE;
        break;
      default:
        this.snackBar.open('Invalid status transition', 'Close', { duration: 3000 });
        return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Update Event Status',
        message: `Are you sure you want to change the event status from ${this.formatStatus(event.status)} to ${this.formatStatus(newStatus)}?`,
        confirmText: 'Update',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(EventActions.updateEventStatus({
          eventId: event.id,
          status: newStatus
        }));
      }
    });
  }

  confirmDelete(event: Event): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Event',
        message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(EventActions.deleteEvent({ id: event.id }));
      }
    });
  }
} 