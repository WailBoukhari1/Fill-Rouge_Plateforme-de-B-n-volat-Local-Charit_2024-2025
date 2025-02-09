import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Volunteers</h2>
      <table mat-table [dataSource]="volunteers" class="w-full">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let volunteer">{{volunteer.name}}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let volunteer">{{volunteer.email}}</td>
        </ng-container>

        <ng-container matColumnDef="skills">
          <th mat-header-cell *matHeaderCellDef>Skills</th>
          <td mat-cell *matCellDef="let volunteer">{{volunteer.skills.join(', ')}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
    </div>
  `
})
export class VolunteerListComponent {
  displayedColumns = ['name', 'email', 'skills'];
  volunteers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      skills: ['Teaching', 'First Aid']
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      skills: ['Organization', 'Leadership']
    }
  ];
} 