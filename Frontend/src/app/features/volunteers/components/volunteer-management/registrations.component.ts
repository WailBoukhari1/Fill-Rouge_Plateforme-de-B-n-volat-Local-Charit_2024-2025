import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Volunteer Registrations</h2>
      <table mat-table [dataSource]="registrations" class="w-full">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let reg">{{reg.name}}</td>
        </ng-container>

        <ng-container matColumnDef="event">
          <th mat-header-cell *matHeaderCellDef>Event</th>
          <td mat-cell *matCellDef="let reg">{{reg.event}}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let reg">
            <mat-chip [color]="reg.status === 'Approved' ? 'primary' : 'warn'">
              {{reg.status}}
            </mat-chip>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class RegistrationsComponent {
  displayedColumns = ['name', 'event', 'status'];
  registrations = [
    { name: 'John Doe', event: 'Beach Cleanup', status: 'Approved' },
    { name: 'Jane Smith', event: 'Food Drive', status: 'Pending' }
  ];
} 