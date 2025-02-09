import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-past-events',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Past Events</h2>
      <table mat-table [dataSource]="events" class="w-full">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Title</th>
          <td mat-cell *matCellDef="let event">{{event.title}}</td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let event">{{event.date | date}}</td>
        </ng-container>

        <ng-container matColumnDef="participants">
          <th mat-header-cell *matHeaderCellDef>Participants</th>
          <td mat-cell *matCellDef="let event">{{event.participants}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class PastEventsComponent {
  displayedColumns = ['title', 'date', 'participants'];
  events = [
    { title: 'Beach Cleanup', date: '2024-01-15', participants: 25 },
    { title: 'Food Drive', date: '2024-01-01', participants: 15 }
  ];
} 