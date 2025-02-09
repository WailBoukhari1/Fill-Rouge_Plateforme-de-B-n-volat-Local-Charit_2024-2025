import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Organizations</h2>
      <table mat-table [dataSource]="organizations" class="w-full">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let org">{{org.name}}</td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let org">{{org.type}}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let org">
            <mat-chip [color]="org.verified ? 'primary' : 'warn'">
              {{org.verified ? 'Verified' : 'Pending'}}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let org">
            <button mat-icon-button color="primary"><mat-icon>visibility</mat-icon></button>
            <button mat-icon-button color="primary"><mat-icon>edit</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class OrganizationListComponent {
  displayedColumns = ['name', 'type', 'status', 'actions'];
  organizations = [
    { name: 'Green Earth Foundation', type: 'Environmental', verified: true },
    { name: 'Local Food Bank', type: 'Food Security', verified: false }
  ];
} 