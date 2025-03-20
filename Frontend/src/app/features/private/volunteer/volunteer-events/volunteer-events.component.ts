import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { EventStatus } from '../../../../core/models/event.types';
import { IEvent } from '../../../../core/models/event.types';
import { EventService } from '../../../../core/services/event.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as EventActions from '../../../../store/event/event.actions';
import { 
  selectEventContent, 
  selectEventLoading, 
  selectEventError, 
  selectEvents,
  selectUpcomingEvents,
  selectOngoingEvents,
  selectCompletedEvents,
  selectRegisteredEvents
} from '../../../../store/event/event.selectors';
import { Page } from '../../../../core/models/page.model';

@Component({
  selector: 'app-volunteer-events',
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
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="events-container">
      <div class="header">
        <h1>My Events</h1>
        <button mat-raised-button color="primary" routerLink="/events">
          <mat-icon>search</mat-icon>
          Browse Events
        </button>
      </div>

      <mat-tab-group>
        <!-- Upcoming Events -->
        <mat-tab label="Upcoming">
          <ng-template matTabContent>
            <div class="tab-content">
              @if (loading$ | async) {
                <div class="loading-wrapper">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
              } @else if (error$ | async) {
                <mat-card>
                  <mat-card-content>
                    <div class="error-message">
                      <mat-icon color="warn">error_outline</mat-icon>
                      <p>{{ error$ | async }}</p>
                      <button mat-raised-button color="primary" (click)="loadEvents()">
                        <mat-icon>refresh</mat-icon>
                        Retry
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              } @else {
                <mat-card>
                  <mat-card-content>
                    <table mat-table [dataSource]="upcomingEventsDataSource" matSort (matSortChange)="onSort($event)">
                      <!-- Title Column -->
                      <ng-container matColumnDef="title">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                        <td mat-cell *matCellDef="let event">{{event?.title || 'N/A'}}</td>
                      </ng-container>

                      <!-- Organization Column -->
                      <ng-container matColumnDef="organization">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Organization</th>
                        <td mat-cell *matCellDef="let event">{{event?.organizationName || 'N/A'}}</td>
                      </ng-container>

                      <!-- Date Column -->
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                        <td mat-cell *matCellDef="let event">
                          {{event?.startDate | date:'mediumDate'}} - {{event?.endDate | date:'mediumDate'}}
                        </td>
                      </ng-container>

                      <!-- Location Column -->
                      <ng-container matColumnDef="location">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Location</th>
                        <td mat-cell *matCellDef="let event">{{event?.location || 'N/A'}}</td>
                      </ng-container>

                      <!-- Status Column -->
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                        <td mat-cell *matCellDef="let event">
                          <span class="status-badge" [class]="event?.status?.toLowerCase()">
                            {{formatStatus(event?.status) || 'N/A'}}
                          </span>
                        </td>
                      </ng-container>

                      <!-- Actions Column -->
                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Actions</th>
                        <td mat-cell *matCellDef="let event">
                          <button mat-icon-button color="primary" [routerLink]="['/events', event?.id]" matTooltip="View details">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          @if (event?.isRegistered) {
                            <button mat-icon-button color="warn" (click)="confirmCancelRegistration(event)" matTooltip="Cancel registration">
                              <mat-icon>cancel</mat-icon>
                            </button>
                          }
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </ng-template>
        </mat-tab>

        <!-- Ongoing Events -->
        <mat-tab label="Ongoing">
          <ng-template matTabContent>
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <table mat-table [dataSource]="ongoingEventsDataSource" matSort (matSortChange)="onSort($event)">
                    <!-- Same columns as above -->
                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </ng-template>
        </mat-tab>

        <!-- Completed Events -->
        <mat-tab label="Completed">
          <ng-template matTabContent>
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <table mat-table [dataSource]="completedEventsDataSource" matSort (matSortChange)="onSort($event)">
                    <!-- Same columns as above -->
                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </ng-template>
        </mat-tab>

        <!-- Registered Events -->
        <mat-tab label="Registered">
          <ng-template matTabContent>
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <table mat-table [dataSource]="registeredEventsDataSource" matSort (matSortChange)="onSort($event)">
                    <!-- Same columns as above -->
                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
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

    .tab-content {
      padding: 1rem 0;
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

    .status-badge.upcoming {
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

    .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
    }

    .error-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .error-message p {
      color: #f44336;
      font-size: 1.2rem;
      margin: 0;
    }
  `]
})
export class VolunteerEventsComponent implements OnInit {
  upcomingEvents$: Observable<IEvent[]>;
  ongoingEvents$: Observable<IEvent[]>;
  completedEvents$: Observable<IEvent[]>;
  registeredEvents$: Observable<IEvent[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  displayedColumns: string[] = ['title', 'organization', 'date', 'location', 'status', 'actions'];
  
  upcomingEventsDataSource: MatTableDataSource<IEvent>;
  ongoingEventsDataSource: MatTableDataSource<IEvent>;
  completedEventsDataSource: MatTableDataSource<IEvent>;
  registeredEventsDataSource: MatTableDataSource<IEvent>;
  
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private store: Store,
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.upcomingEvents$ = this.store.select(selectUpcomingEvents);
    this.ongoingEvents$ = this.store.select(selectOngoingEvents);
    this.completedEvents$ = this.store.select(selectCompletedEvents);
    this.registeredEvents$ = this.store.select(selectRegisteredEvents);
    this.loading$ = this.store.select(selectEventLoading);
    this.error$ = this.store.select(selectEventError);

    // Initialize table data sources
    this.upcomingEventsDataSource = new MatTableDataSource<IEvent>([]);
    this.ongoingEventsDataSource = new MatTableDataSource<IEvent>([]);
    this.completedEventsDataSource = new MatTableDataSource<IEvent>([]);
    this.registeredEventsDataSource = new MatTableDataSource<IEvent>([]);
  }

  ngOnInit(): void {
    this.loadEvents();
    this.setupTableDataSources();
  }

  private setupTableDataSources(): void {
    this.upcomingEvents$.pipe(
      map(events => events || [])
    ).subscribe(events => {
      this.upcomingEventsDataSource.data = events;
    });

    this.ongoingEvents$.pipe(
      map(events => events || [])
    ).subscribe(events => {
      this.ongoingEventsDataSource.data = events;
    });

    this.completedEvents$.pipe(
      map(events => events || [])
    ).subscribe(events => {
      this.completedEventsDataSource.data = events;
    });

    this.registeredEvents$.pipe(
      map(events => events || [])
    ).subscribe(events => {
      this.registeredEventsDataSource.data = events;
    });
  }

  loadEvents(): void {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (organizationId) {
      this.store.dispatch(EventActions.loadEvents({ 
        filters: { organizationId }, 
        page: this.pageIndex, 
        size: this.pageSize 
      }));
    }
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

  confirmCancelRegistration(event: IEvent): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Registration',
        message: `Are you sure you want to cancel your registration for "${event.title}"?`,
        confirmText: 'Cancel Registration',
        cancelText: 'Keep Registration'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(EventActions.cancelEventRegistration({ eventId: event.id }));
      }
    });
  }
} 