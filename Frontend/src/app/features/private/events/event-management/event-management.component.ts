import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p class="text-gray-600">Manage your organization's events</p>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon class="mr-2">add</mat-icon>
          Create Event
        </a>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <table mat-table [dataSource]="events" class="w-full">
            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Event</th>
              <td mat-cell *matCellDef="let event">
                <div class="flex items-center">
                  <img [src]="event.imageUrl" [alt]="event.title" 
                       class="w-10 h-10 rounded object-cover mr-3">
                  <div>
                    <p class="font-medium">{{event.title}}</p>
                    <p class="text-sm text-gray-600">{{event.startDate | date}}</p>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let event">
                <mat-chip [color]="getStatusColor(event.status)">
                  {{event.status}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Participants Column -->
            <ng-container matColumnDef="participants">
              <th mat-header-cell *matHeaderCellDef>Participants</th>
              <td mat-cell *matCellDef="let event">
                {{event.registeredParticipants.size}}/{{event.maxParticipants}}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let event">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['edit', event.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </a>
                  <a mat-menu-item [routerLink]="[event.id, 'participants']">
                    <mat-icon>people</mat-icon>
                    <span>Manage Participants</span>
                  </a>
                  <a mat-menu-item [routerLink]="[event.id, 'feedback']">
                    <mat-icon>feedback</mat-icon>
                    <span>View Feedback</span>
                  </a>
                  @if (event.status === 'DRAFT') {
                    <button mat-menu-item (click)="publishEvent(event.id)">
                      <mat-icon>publish</mat-icon>
                      <span>Publish</span>
                    </button>
                  }
                  @if (!event.isCancelled) {
                    <button mat-menu-item (click)="cancelEvent(event.id)">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel Event</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalEvents"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 100]"
            (page)="onPageChange($event)"
            aria-label="Select page">
          </mat-paginator>
        </div>
      }
    </div>
  `
})
export class EventManagementComponent implements OnInit {
  events: any[] = [];
  isLoading = true;
  displayedColumns: string[] = ['title', 'status', 'participants', 'actions'];
  totalEvents = 0;
  pageSize = 10;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    // TODO: Implement event loading from service
    setTimeout(() => {
      this.events = [
        {
          id: '1',
          title: 'Beach Cleanup',
          status: 'UPCOMING',
          startDate: new Date('2024-04-15'),
          imageUrl: 'assets/images/events/beach-cleanup.jpg',
          registeredParticipants: new Set(['1', '2', '3']),
          maxParticipants: 20,
          isCancelled: false
        }
      ];
      this.totalEvents = 100;
      this.isLoading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'basic',
      'UPCOMING': 'primary',
      'ONGOING': 'accent',
      'COMPLETED': 'primary',
      'CANCELLED': 'warn'
    };
    return statusColors[status] || 'basic';
  }

  onPageChange(event: PageEvent) {
    // TODO: Implement pagination
    console.log('Page changed:', event);
  }

  publishEvent(eventId: string) {
    // TODO: Implement publish functionality
    console.log('Publish event:', eventId);
  }

  cancelEvent(eventId: string) {
    // TODO: Implement cancellation
    console.log('Cancel event:', eventId);
  }
} 