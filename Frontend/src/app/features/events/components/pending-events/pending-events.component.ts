import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pending-events',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Pending Events</h2>
      <table mat-table [dataSource]="events" class="w-full">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Title</th>
          <td mat-cell *matCellDef="let event">{{event.title}}</td>
        </ng-container>

        <ng-container matColumnDef="organization">
          <th mat-header-cell *matHeaderCellDef>Organization</th>
          <td mat-cell *matCellDef="let event">{{event.organization}}</td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let event">{{event.date | date}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let event">
            <button mat-icon-button color="primary"><mat-icon>check</mat-icon></button>
            <button mat-icon-button color="warn"><mat-icon>close</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class PendingEventsComponent {
  displayedColumns = ['title', 'organization', 'date', 'actions'];
  events = [
    { title: 'Beach Cleanup', organization: 'Green Earth', date: '2024-03-01' },
    { title: 'Food Drive', organization: 'Local Food Bank', date: '2024-03-15' }
  ];
} 
