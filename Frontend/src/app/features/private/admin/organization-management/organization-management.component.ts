import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { Organization, OrganizationStatus, VerificationStatus } from '../../../../core/models/organization.model';
import { EventStatus } from '../../../../core/models/event.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrganizationDetailsDialogComponent } from '../../../../shared/components/organization-details-dialog/organization-details-dialog.component';
import { ImagePlaceholderService } from '../../../../shared/services/image-placeholder.service';

import * as AdminActions from '../../../../store/admin/admin.actions';
import * as AdminSelectors from '../../../../store/admin/admin.selectors';
import { AppState } from '../../../../store';

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
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Organization Management</h1>
            <p class="mt-2 text-gray-600 text-lg">Manage and monitor all organizations in the platform</p>
          </div>
          <button mat-raised-button 
                  color="primary" 
                  routerLink="create"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2">
            <mat-icon class="text-xl">add</mat-icon>
            <span class="font-medium">Add Organization</span>
          </button>
        </div>

        <!-- Main Content -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <!-- Loading State -->
          <div *ngIf="loading$ | async" class="flex justify-center items-center py-16">
            <mat-spinner diameter="48" class="text-blue-600"></mat-spinner>
          </div>

          <!-- Error State -->
          <div *ngIf="error$ | async as error" class="p-6 text-center">
            <div class="bg-red-50 border border-red-200 rounded-xl p-6 inline-flex flex-col items-center">
              <mat-icon class="text-red-500 text-4xl mb-4">error_outline</mat-icon>
              <p class="text-red-600 text-lg">{{ error }}</p>
            </div>
          </div>

          <!-- Table -->
          <div *ngIf="!(loading$ | async)" class="overflow-x-auto">
            <table mat-table [dataSource]="dataSource" class="w-full">
              <!-- Logo Column -->
              <ng-container matColumnDef="logo">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Logo</th>
                <td mat-cell *matCellDef="let org" class="px-6 py-4">
                  <img [src]="getLogoUrl(org)" 
                       alt="Organization logo"
                       class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100">
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Name</th>
                <td mat-cell *matCellDef="let org" class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{org.name}}</div>
                  <div class="text-sm text-gray-500">{{org.email}}</div>
                </td>
              </ng-container>

              <!-- Contact Column -->
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Contact</th>
                <td mat-cell *matCellDef="let org" class="px-6 py-4">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="text-gray-400 mr-2">phone</mat-icon>
                    {{org.phoneNumber}}
                  </div>
                </td>
              </ng-container>

              <!-- Location Column -->
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Location</th>
                <td mat-cell *matCellDef="let org" class="px-6 py-4">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="text-gray-400 mr-2">location_on</mat-icon>
                    {{org.city}}, {{org.country}}
                  </div>
                </td>
              </ng-container>

              <!-- Verification Column -->
              <ng-container matColumnDef="verification">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Verification</th>
                <td mat-cell *matCellDef="let org" class="px-6 py-4">
                  <mat-chip [color]="org.verified ? 'primary' : 'warn'"
                           class="font-medium">
                    {{org.verified ? 'Verified' : 'Pending'}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-gray-600 font-medium px-6 py-4">Actions</th>
                <td mat-cell *matCellDef="let org" class="px-6 py-4">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menu"
                          class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu" class="rounded-xl shadow-lg">
                    <button mat-menu-item (click)="viewDetails(org)" class="hover:bg-gray-50">
                      <mat-icon class="text-gray-500">visibility</mat-icon>
                      <span class="ml-2">View Details</span>
                    </button>
                    @if (!org.verified) {
                      <button mat-menu-item (click)="verifyOrganization(org)" class="hover:bg-gray-50">
                        <mat-icon class="text-green-500">verified</mat-icon>
                        <span class="ml-2">Verify</span>
                      </button>
                    }
                    <button mat-menu-item (click)="suspendOrganization(org)" class="hover:bg-gray-50">
                      <mat-icon class="text-yellow-500">block</mat-icon>
                      <span class="ml-2">Suspend</span>
                    </button>
                    <button mat-menu-item (click)="reactivateOrganization(org)" class="hover:bg-gray-50">
                      <mat-icon class="text-blue-500">restore</mat-icon>
                      <span class="ml-2">Reactivate</span>
                    </button>
                    <button mat-menu-item (click)="deleteOrganization(org)" class="hover:bg-gray-50">
                      <mat-icon class="text-red-500">delete</mat-icon>
                      <span class="ml-2 text-red-500">Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="hover:bg-gray-50 transition-colors duration-200"></tr>
            </table>
          </div>

          <!-- Paginator -->
          <mat-paginator
            [length]="totalCount$ | async"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 100]"
            (page)="onPageChange($event)"
            class="border-t border-gray-200">
          </mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    ::ng-deep .mat-mdc-table {
      background: transparent;
    }

    ::ng-deep .mat-mdc-row {
      min-height: 64px;
    }

    ::ng-deep .mat-mdc-cell {
      border-bottom: 1px solid #e5e7eb;
    }

    ::ng-deep .mat-mdc-header-cell {
      border-bottom: 2px solid #e5e7eb;
    }

    ::ng-deep .mat-mdc-menu-panel {
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    ::ng-deep .mat-mdc-menu-item {
      height: 48px;
      line-height: 48px;
      padding: 0 16px;
    }

    ::ng-deep .mat-mdc-menu-item .mat-icon {
      margin-right: 8px;
    }

    ::ng-deep .mat-mdc-paginator {
      background: transparent;
      border-top: 1px solid #e5e7eb;
    }

    ::ng-deep .mat-mdc-paginator-container {
      min-height: 56px;
      padding: 0 16px;
    }

    ::ng-deep .mat-mdc-paginator-range-label {
      color: #6b7280;
    }

    ::ng-deep .mat-mdc-paginator-navigation-next,
    ::ng-deep .mat-mdc-paginator-navigation-previous {
      color: #3b82f6;
    }

    ::ng-deep .mat-mdc-paginator-navigation-next:hover,
    ::ng-deep .mat-mdc-paginator-navigation-previous:hover {
      background-color: #f3f4f6;
    }

    ::ng-deep .mat-mdc-paginator-page-size {
      margin-right: 16px;
    }

    ::ng-deep .mat-mdc-paginator-page-size-label {
      color: #6b7280;
    }

    ::ng-deep .mat-mdc-paginator-page-size-select {
      margin: 0 8px;
    }

    ::ng-deep .mat-mdc-paginator-page-size-option {
      color: #374151;
    }

    ::ng-deep .mat-mdc-paginator-page-size-option:hover {
      background-color: #f3f4f6;
    }

    ::ng-deep .mat-mdc-paginator-page-size-option.mat-mdc-selected {
      color: #3b82f6;
    }

    ::ng-deep .mat-mdc-paginator-range-actions {
      margin-left: 16px;
    }

    ::ng-deep .mat-mdc-paginator-range-actions button {
      color: #3b82f6;
    }

    ::ng-deep .mat-mdc-paginator-range-actions button:hover {
      background-color: #f3f4f6;
    }

    ::ng-deep .mat-mdc-paginator-range-actions button:disabled {
      color: #9ca3af;
    }
  `]
})
export class OrganizationManagementComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['logo', 'name', 'contact', 'location', 'verification', 'actions'];
  dataSource = new MatTableDataSource<Organization>([]);
  pageSize = 10;
  pageIndex = 0;
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  totalCount$: Observable<number>;
  private destroy$ = new Subject<void>();
  
  // Make enums available in the template
  OrganizationStatus = OrganizationStatus;
  VerificationStatus = VerificationStatus;
  EventStatus = EventStatus;

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private organizationService: OrganizationService,
    private imagePlaceholderService: ImagePlaceholderService
  ) {
    this.loading$ = this.store.select(AdminSelectors.selectAdminLoading);
    this.error$ = this.store.select(AdminSelectors.selectAdminError);
    this.totalCount$ = this.store.select(AdminSelectors.selectTotalOrganizationsCount);
  }

  ngOnInit(): void {
    this.loadOrganizations();
    
    // Subscribe to organizations from the store
    this.store.select(AdminSelectors.selectAllOrganizations)
      .pipe(takeUntil(this.destroy$))
      .subscribe(organizations => {
        // Update the data source with the organizations
        this.dataSource.data = organizations || [];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrganizations(): void {
    console.log('Loading organizations, page:', this.pageIndex, 'size:', this.pageSize);
    this.store.dispatch(AdminActions.loadOrganizations({ page: this.pageIndex, size: this.pageSize }));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrganizations();
  }

  getStatusColor(status: OrganizationStatus): string {
    switch (status) {
      case OrganizationStatus.ACTIVE:
        return 'primary';
      case OrganizationStatus.SUSPENDED:
        return 'warn';
      default:
        return '';
    }
  }

  viewDetails(org: Organization): void {
    console.log('Opening details dialog for organization:', org);
    const dialogRef = this.dialog.open(OrganizationDetailsDialogComponent, {
      width: '600px',
      data: org,
    });
  }

  verifyOrganization(org: Organization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Verify Organization',
        message: `Are you sure you want to verify ${org.name}?`,
        confirmText: 'Verify',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.verifyOrganization({ organizationId: org.id }));
      }
    });
  }

  suspendOrganization(org: Organization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suspend Organization',
        message: `Are you sure you want to suspend ${org.name}?`,
        confirmText: 'Suspend',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.suspendOrganization({ organizationId: org.id }));
      }
    });
  }

  reactivateOrganization(org: Organization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reactivate Organization',
        message: `Are you sure you want to reactivate ${org.name}?`,
        confirmText: 'Reactivate',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.reactivateOrganization({ organizationId: org.id }));
      }
    });
  }

  deleteOrganization(org: Organization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Organization',
        message: `Are you sure you want to delete ${org.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.deleteOrganization({ organizationId: org.id }));
      }
    });
  }

  getLogoUrl(organization: Organization): string {
    // Check if the organization has a logo, otherwise return default
    if (organization && organization.logoUrl) {
      return organization.logoUrl;
    }
    // Use type assertion to access potential logo property
    if (organization && (organization as any).logo) {
      return (organization as any).logo;
    }
    return this.imagePlaceholderService.getOrganizationPlaceholder();
  }

  canApproveEvent(event: any): boolean {
    return event.status === EventStatus.PENDING;
  }

  canRejectEvent(event: any): boolean {
    return event.status === EventStatus.PENDING;
  }
} 