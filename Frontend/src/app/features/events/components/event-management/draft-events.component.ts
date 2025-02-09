import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-draft-events',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Draft Events</h2>
      <table mat-table [dataSource]="events" class="w-full">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Title</th>
          <td mat-cell *matCellDef="let event">{{event.title}}</td>
        </ng-container>

        <ng-container matColumnDef="lastEdited">
          <th mat-header-cell *matHeaderCellDef>Last Edited</th>
          <td mat-cell *matCellDef="let event">{{event.lastEdited | date}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let event">
            <button mat-icon-button color="primary"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="primary"><mat-icon>publish</mat-icon></button>
            <button mat-icon-button color="warn"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class DraftEventsComponent {
  displayedColumns = ['title', 'lastEdited', 'actions'];
  events = [
    { title: 'Community Garden Project', lastEdited: '2024-02-20' },
    { title: 'Youth Mentorship Program', lastEdited: '2024-02-18' }
  ];
} 