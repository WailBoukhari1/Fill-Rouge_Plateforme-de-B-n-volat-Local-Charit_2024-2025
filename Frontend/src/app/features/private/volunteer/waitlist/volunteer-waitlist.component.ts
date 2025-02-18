import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../../../../core/services/event.service';

@Component({
  selector: 'app-volunteer-waitlist',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Waitlisted Events</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <table mat-table [dataSource]="waitlistedEvents" class="w-full">
            <ng-container matColumnDef="event">
              <th mat-header-cell *matHeaderCellDef>Event</th>
              <td mat-cell *matCellDef="let event">{{event.title}}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let event">{{event.date | date}}</td>
            </ng-container>

            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef>Waitlist Position</th>
              <td mat-cell *matCellDef="let event">{{event.waitlistPosition}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let event">
                <button mat-button color="warn" (click)="leaveWaitlist(event.id)">
                  <mat-icon>remove_circle</mat-icon>
                  Leave Waitlist
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class VolunteerWaitlistComponent implements OnInit {
  waitlistedEvents: any[] = [];
  displayedColumns: string[] = ['event', 'date', 'position', 'actions'];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadWaitlistedEvents();
  }

  loadWaitlistedEvents(): void {
    this.eventService.getWaitlistedEvents().subscribe({
      next: (events) => this.waitlistedEvents = events,
      error: (error) => console.error('Error loading waitlisted events:', error)
    });
  }

  leaveWaitlist(eventId: string): void {
    this.eventService.leaveWaitlist(eventId).subscribe({
      next: () => this.loadWaitlistedEvents(),
      error: (error) => console.error('Error leaving waitlist:', error)
    });
  }
} 