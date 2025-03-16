import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';

interface VolunteerData {
  id: string;
  name: string;
  email: string;
  joinedDate: Date;
  totalHours: number;
  eventsParticipated: number;
  status: string;
}

@Component({
  selector: 'app-volunteer-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Volunteer Management</h1>
        <div class="flex items-center space-x-4">
          <mat-form-field appearance="outline" class="w-64">
            <mat-label>Search Volunteers</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by name or email" #input>
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="exportVolunteers()">
            <mat-icon class="mr-2">download</mat-icon>
            Export Data
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="mat-elevation-z8">
          <table mat-table [dataSource]="volunteers" matSort (matSortChange)="sortData($event)">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
              <td mat-cell *matCellDef="let row"> {{row.name}} </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
              <td mat-cell *matCellDef="let row"> {{row.email}} </td>
            </ng-container>

            <!-- Joined Date Column -->
            <ng-container matColumnDef="joinedDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Joined Date </th>
              <td mat-cell *matCellDef="let row"> {{row.joinedDate | date}} </td>
            </ng-container>

            <!-- Total Hours Column -->
            <ng-container matColumnDef="totalHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Total Hours </th>
              <td mat-cell *matCellDef="let row"> {{row.totalHours}} </td>
            </ng-container>

            <!-- Events Participated Column -->
            <ng-container matColumnDef="eventsParticipated">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Events </th>
              <td mat-cell *matCellDef="let row"> {{row.eventsParticipated}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let row">
                <span [class]="getStatusClass(row.status)">
                  {{row.status}}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewVolunteerDetails(row)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="sendMessage(row)">
                    <mat-icon>message</mat-icon>
                    <span>Send Message</span>
                  </button>
                  <button mat-menu-item (click)="manageAccess(row)">
                    <mat-icon>security</mat-icon>
                    <span>Manage Access</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no matching data. -->
            @if (volunteers.length === 0) {
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="7">No volunteers found</td>
              </tr>
            }
          </table>

          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 100]"
            (page)="onPageChange($event)"
            aria-label="Select page">
          </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .status-active {
      @apply px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800;
    }
    .status-inactive {
      @apply px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800;
    }
    .status-pending {
      @apply px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800;
    }
  `]
})
export class VolunteerManagementComponent implements OnInit {
  volunteers: VolunteerData[] = [];
  displayedColumns: string[] = ['name', 'email', 'joinedDate', 'totalHours', 'eventsParticipated', 'status', 'actions'];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  constructor(
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadVolunteers();
  }

  loadVolunteers() {
    this.loading = true;
    // TODO: Implement actual API call
    // this.organizationService.getVolunteers(this.currentPage, this.pageSize).subscribe({
    //   next: (response) => {
    //     this.volunteers = response.content;
    //     this.totalItems = response.totalElements;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading volunteers:', error);
    //     this.snackBar.open('Error loading volunteers', 'Close', { duration: 3000 });
    //     this.loading = false;
    //   }
    // });

    // Mock data for now
    setTimeout(() => {
      this.volunteers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          joinedDate: new Date('2024-01-01'),
          totalHours: 45,
          eventsParticipated: 8,
          status: 'Active'
        },
        // Add more mock data as needed
      ];
      this.totalItems = this.volunteers.length;
      this.loading = false;
    }, 1000);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Implement filtering logic
  }

  sortData(sort: Sort) {
    // Implement sorting logic
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVolunteers();
  }

  exportVolunteers() {
    // Implement export functionality
  }

  viewVolunteerDetails(volunteer: VolunteerData) {
    // Implement view details functionality
  }

  sendMessage(volunteer: VolunteerData) {
    // Implement send message functionality
  }

  manageAccess(volunteer: VolunteerData) {
    // Implement manage access functionality
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }
} 