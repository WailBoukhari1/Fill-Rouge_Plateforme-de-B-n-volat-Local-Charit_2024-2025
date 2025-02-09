import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-participation-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Participation History</h2>
      <table mat-table [dataSource]="history" class="w-full">
        <ng-container matColumnDef="event">
          <th mat-header-cell *matHeaderCellDef>Event</th>
          <td mat-cell *matCellDef="let entry">{{entry.event}}</td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let entry">{{entry.date | date}}</td>
        </ng-container>

        <ng-container matColumnDef="hours">
          <th mat-header-cell *matHeaderCellDef>Hours</th>
          <td mat-cell *matCellDef="let entry">{{entry.hours}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class ParticipationHistoryComponent {
  displayedColumns = ['event', 'date', 'hours'];
  history = [
    { event: 'Beach Cleanup', date: '2024-02-15', hours: 4 },
    { event: 'Food Drive', date: '2024-02-01', hours: 3 }
  ];
} 
