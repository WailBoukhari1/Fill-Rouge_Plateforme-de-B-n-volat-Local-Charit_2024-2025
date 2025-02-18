import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../../core/services/event.service';
import { IEvent, EventStatus } from '../../../../core/models/event.types';

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
    RouterModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Event Management</h1>
        <button mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Create Event
        </button>
      </div>

      <mat-card>
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="events" class="w-full">
            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let event">{{event.title}}</td>
            </ng-container>

            <!-- Organization Column -->
            <ng-container matColumnDef="organization">
              <th mat-header-cell *matHeaderCellDef>Organization</th>
              <td mat-cell *matCellDef="let event">{{event.organizationName}}</td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let event">{{event.date | date}}</td>
            </ng-container>

            <!-- Participants Column -->
            <ng-container matColumnDef="participants">
              <th mat-header-cell *matHeaderCellDef>Participants</th>
              <td mat-cell *matCellDef="let event">
                {{event.registeredParticipants.size}}/{{event.maxParticipants}}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let event">
                <mat-chip [color]="getStatusColor(event.status)">
                  {{getStatusLabel(event.status)}}
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
                  <button mat-menu-item [routerLink]="[event.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="viewDetails(event)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  @if (event.status === 'PENDING') {
                    <button mat-menu-item (click)="approveEvent(event)">
                      <mat-icon>check_circle</mat-icon>
                      <span>Approve</span>
                    </button>
                  }
                  @if (event.status !== 'CANCELLED') {
                    <button mat-menu-item (click)="cancelEvent(event)">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel</span>
                    </button>
                  }
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

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `
})
export class EventManagementComponent implements OnInit {
  events: IEvent[] = [];
  displayedColumns: string[] = ['title', 'organization', 'date', 'participants', 'status', 'actions'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents({}).subscribe({
      next: (response) => {
        this.events = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  getStatusColor(status: EventStatus): string {
    switch (status) {
      case EventStatus.DRAFT:
        return 'basic';
      case EventStatus.PENDING:
        return 'accent';
      case EventStatus.UPCOMING:
      case EventStatus.ONGOING:
        return 'primary';
      case EventStatus.COMPLETED:
        return 'primary';
      case EventStatus.CANCELLED:
        return 'warn';
      default:
        return '';
    }
  }

  getStatusLabel(status: EventStatus): string {
    switch (status) {
      case EventStatus.PENDING:
        return 'Pending';
      case EventStatus.APPROVED:
        return 'Approved';
      case EventStatus.CANCELLED:
        return 'Cancelled';
      case EventStatus.COMPLETED:
        return 'Completed';
      case EventStatus.DRAFT:
        return 'Draft';
      case EventStatus.UPCOMING:
        return 'Upcoming';
      case EventStatus.ONGOING:
        return 'Ongoing';
      case EventStatus.PUBLISHED:
        return 'Published';
      default:
        return 'Unknown';
    }
  }

  viewDetails(event: IEvent): void {
    // Navigate to event details view
  }

  approveEvent(event: IEvent): void {
    this.updateEventStatus(event, EventStatus.APPROVED);
  }

  cancelEvent(event: IEvent): void {
    this.eventService.cancelEvent(event.id, 'Cancelled by admin').subscribe({
      next: () => this.loadEvents(),
      error: (error) => console.error('Error cancelling event:', error)
    });
  }

  deleteEvent(event: IEvent): void {
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => this.loadEvents(),
      error: (error) => console.error('Error deleting event:', error)
    });
  }

  updateEventStatus(event: IEvent, newStatus: EventStatus): void {
    this.eventService.updateEventStatus(event.id, newStatus).subscribe({
      next: () => {
        event.status = newStatus;
      },
      error: (error) => {
        console.error('Error updating event status:', error);
      }
    });
  }
}