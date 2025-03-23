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
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Organization Management</h1>
        <button mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Add Organization
        </button>
      </div>

      <mat-card>
        <div *ngIf="loading$ | async" class="flex justify-center p-4">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        
        <div *ngIf="!(loading$ | async)" class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <!-- Logo Column -->
            <ng-container matColumnDef="logo">
              <th mat-header-cell *matHeaderCellDef>Logo</th>
              <td mat-cell *matCellDef="let org">
                <img [src]="getLogoUrl(org)" 
                     alt="Organization logo"
                     class="w-10 h-10 rounded-full object-cover">
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let org">{{org.name}}</td>
            </ng-container>

            <!-- Contact Column -->
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let org">{{org.phoneNumber}}</td>
            </ng-container>

            <!-- Location Column -->
            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let org">
                {{org.city}}, {{org.country}}
              </td>
            </ng-container>

            <!-- Verification Column -->
            <ng-container matColumnDef="verification">
              <th mat-header-cell *matHeaderCellDef>Verification</th>
              <td mat-cell *matCellDef="let org">
                <mat-chip [color]="org.verified ? 'primary' : 'warn'">
                  {{org.verified ? 'Verified' : 'Pending'}}
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
                  <button mat-menu-item (click)="viewDetails(org)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  @if (!org.verified) {
                    <button mat-menu-item (click)="verifyOrganization(org)">
                      <mat-icon>verified</mat-icon>
                      <span>Verify</span>
                    </button>
                  }
                  <button mat-menu-item (click)="suspendOrganization(org)">
                    <mat-icon>block</mat-icon>
                    <span>Suspend</span>
                  </button>
                  <button mat-menu-item (click)="reactivateOrganization(org)">
                    <mat-icon>restore</mat-icon>
                    <span>Reactivate</span>
                  </button>
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

        <div *ngIf="error$ | async as error" class="p-4 text-red-600 text-center">
          {{ error }}
        </div>

        <mat-paginator
          [length]="totalCount$ | async"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `
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

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private organizationService: OrganizationService,
    private imagePlaceholderService: ImagePlaceholderService
  ) {
    this.loading$ = this.store.select(AdminSelectors.selectAdminLoading);
    this.error$ = this.store.select(AdminSelectors.selectAdminError);
    this.totalCount$ = this.store.select(AdminSelectors.selectTotalOrganizations);
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
} 