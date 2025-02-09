import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-verification-requests',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Pending Verification Requests</h2>
      <table mat-table [dataSource]="requests" class="w-full">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Organization</th>
          <td mat-cell *matCellDef="let req">{{req.name}}</td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let req">{{req.type}}</td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Request Date</th>
          <td mat-cell *matCellDef="let req">{{req.date | date}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let req">
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
export class VerificationRequestsComponent {
  displayedColumns = ['name', 'type', 'date', 'actions'];
  requests = [
    { name: 'Local Food Bank', type: 'Food Security', date: '2024-02-20' },
    { name: 'Youth Center', type: 'Education', date: '2024-02-19' }
  ];
}