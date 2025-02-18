import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VolunteerService } from '../../../../core/services/volunteer.service';

@Component({
  selector: 'app-volunteer-hours',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Volunteer Hours</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <table mat-table [dataSource]="volunteerHours" class="w-full">
            <ng-container matColumnDef="event">
              <th mat-header-cell *matHeaderCellDef>Event</th>
              <td mat-cell *matCellDef="let record">{{record.eventName}}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let record">{{record.date | date}}</td>
            </ng-container>

            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef>Hours</th>
              <td mat-cell *matCellDef="let record">{{record.hours}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let record">{{record.status}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class VolunteerHoursComponent implements OnInit {
  volunteerHours: any[] = [];
  displayedColumns: string[] = ['event', 'date', 'hours', 'status'];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loadVolunteerHours();
  }

  loadVolunteerHours(): void {
    this.volunteerService.getVolunteerHours().subscribe({
      next: (hours) => this.volunteerHours = hours,
      error: (error) => console.error('Error loading volunteer hours:', error)
    });
  }
} 