import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { Organization } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-organization-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Organization Management</h1>
        <button mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Add Organization
        </button>
      </div>

      <mat-card>
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="organizations" class="w-full">
            <!-- Logo Column -->
            <ng-container matColumnDef="logo">
              <th mat-header-cell *matHeaderCellDef>Logo</th>
              <td mat-cell *matCellDef="let org">
                <img [src]="org.logo || 'assets/images/default-org.png'" 
                     alt="Organization logo"
                     class="w-10 h-10 rounded-full object-cover">
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let org">{{org.name}}</td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let org">{{org.email}}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let org">
                <mat-chip [color]="getStatusColor(org.status)">
                  {{org.status}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Verification Column -->
            <ng-container matColumnDef="verification">
              <th mat-header-cell *matHeaderCellDef>Verification</th>
              <td mat-cell *matCellDef="let org">
                <mat-chip [color]="org.verificationStatus === 'VERIFIED' ? 'primary' : 'warn'">
                  {{org.verificationStatus}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let org">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="[org.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="viewDetails(org)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  @if (org.verificationStatus === 'UNVERIFIED') {
                    <button mat-menu-item (click)="verifyOrganization(org)">
                      <mat-icon>verified</mat-icon>
                      <span>Verify</span>
                    </button>
                  }
                  @if (org.status === 'ACTIVE') {
                    <button mat-menu-item (click)="suspendOrganization(org)">
                      <mat-icon>block</mat-icon>
                      <span>Suspend</span>
                    </button>
                  } @else if (org.status === 'SUSPENDED') {
                    <button mat-menu-item (click)="reactivateOrganization(org)">
                      <mat-icon>restore</mat-icon>
                      <span>Reactivate</span>
                    </button>
                  }
                  <button mat-menu-item (click)="deleteOrganization(org)" class="text-red-500">
                    <mat-icon class="text-red-500">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `
})
export class OrganizationManagementComponent implements OnInit {
  organizations: Organization[] = [];
  displayedColumns: string[] = ['logo', 'name', 'email', 'status', 'verification', 'actions'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;

  constructor(private organizationService: OrganizationService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loading = true;
    this.organizationService.getOrganizationsDetailed(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.organizations = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.snackBar.open('Error loading organizations', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrganizations();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'SUSPENDED':
        return 'warn';
      default:
        return '';
    }
  }

  viewDetails(org: Organization): void {
    // Navigate to organization details view
  }

  verifyOrganization(org: Organization): void {
    this.organizationService.verifyOrganization(org.id).subscribe({
      next: () => this.loadOrganizations(),
      error: (error) => console.error('Error verifying organization:', error)
    });
  }

  suspendOrganization(org: Organization): void {
    // Implement suspension dialog and logic
  }

  reactivateOrganization(org: Organization): void {
    this.organizationService.reactivateOrganization(org.id).subscribe({
      next: () => this.loadOrganizations(),
      error: (error) => console.error('Error reactivating organization:', error)
    });
  }

  deleteOrganization(org: Organization): void {
    // Implement deletion confirmation dialog and logic
  }
} 