import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrganizationService } from '../../../../core/services/organization.service';

@Component({
  selector: 'app-organization-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Organization Approval Management</h1>
      
      <mat-card class="mb-6">
        <div class="p-4">
          <h2 class="text-lg font-medium mb-4">Pending Approval Organizations</h2>
          
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="pendingOrganizations" class="w-full">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let org">{{org.name}}</td>
              </ng-container>
              
              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let org">{{org.contactEmail}}</td>
              </ng-container>
              
              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let org">{{org.phoneNumber}}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let org">
                  <mat-chip color="warn">{{org.roleStatus || 'PENDING'}}</mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let org">
                  <button mat-icon-button color="primary" (click)="approveOrganization(org)" matTooltip="Approve">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="openRejectDialog(org)" matTooltip="Reject">
                    <mat-icon>cancel</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="viewOrganizationDetails(org)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          
          <mat-paginator
            [length]="totalPending"
            [pageSize]="pageSizePending"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="onPendingPageChange($event)">
          </mat-paginator>
        </div>
      </mat-card>
      
      <mat-card>
        <div class="p-4">
          <h2 class="text-lg font-medium mb-4">All Organizations</h2>
          
          <div class="mb-4 flex items-center">
            <mat-form-field class="w-full">
              <mat-label>Search Organizations</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="searchOrganizations()">
              <button mat-icon-button matSuffix (click)="searchOrganizations()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>
          </div>
          
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="allOrganizations" class="w-full">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let org">{{org.name}}</td>
              </ng-container>
              
              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let org">{{org.contactEmail}}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let org">
                  <mat-chip 
                    [color]="getStatusColor(org.roleStatus || 'PENDING')" 
                    [ngClass]="{'line-through': org.banned}">
                    {{org.roleStatus || 'PENDING'}}
                  </mat-chip>
                  
                  <mat-chip *ngIf="org.banned" color="warn">BANNED</mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let org">
                  <button 
                    mat-icon-button 
                    [color]="org.banned ? 'primary' : 'warn'"
                    (click)="org.banned ? unbanOrganization(org) : openBanDialog(org)" 
                    [matTooltip]="org.banned ? 'Unban' : 'Ban'">
                    <mat-icon>{{org.banned ? 'restore' : 'block'}}</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="viewOrganizationDetails(org)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="allOrganizationsColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: allOrganizationsColumns;"></tr>
            </table>
          </div>
          
          <mat-paginator
            [length]="totalAll"
            [pageSize]="pageSizeAll"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="onAllPageChange($event)">
          </mat-paginator>
        </div>
      </mat-card>
    </div>
    
    <!-- Reject Dialog Template -->
    <ng-template #rejectDialog let-data>
      <h2 mat-dialog-title>Reject Organization</h2>
      <mat-dialog-content>
        <form [formGroup]="rejectForm">
          <mat-form-field class="w-full">
            <mat-label>Rejection Reason</mat-label>
            <textarea matInput formControlName="reason" rows="4" required></textarea>
            <mat-error *ngIf="rejectForm.get('reason')?.hasError('required')">
              Rejection reason is required
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="warn" 
          [disabled]="rejectForm.invalid"
          (click)="confirmReject(data)">
          Reject
        </button>
      </mat-dialog-actions>
    </ng-template>
    
    <!-- Ban Dialog Template -->
    <ng-template #banDialog let-data>
      <h2 mat-dialog-title>Ban Organization</h2>
      <mat-dialog-content>
        <form [formGroup]="banForm">
          <mat-form-field class="w-full">
            <mat-label>Ban Reason</mat-label>
            <textarea matInput formControlName="reason" rows="4" required></textarea>
            <mat-error *ngIf="banForm.get('reason')?.hasError('required')">
              Ban reason is required
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="warn" 
          [disabled]="banForm.invalid"
          (click)="confirmBan(data)">
          Ban Organization
        </button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class OrganizationApprovalComponent implements OnInit {
  pendingOrganizations: any[] = [];
  allOrganizations: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'phone', 'status', 'actions'];
  allOrganizationsColumns: string[] = ['name', 'email', 'status', 'actions'];
  
  // Pagination
  pageSizePending: number = 10;
  currentPagePending: number = 0;
  totalPending: number = 0;
  
  pageSizeAll: number = 10;
  currentPageAll: number = 0;
  totalAll: number = 0;
  
  // Search
  searchQuery: string = '';
  
  // Forms
  rejectForm: FormGroup;
  banForm: FormGroup;
  
  @ViewChild('rejectDialog') rejectDialog!: TemplateRef<any>;
  @ViewChild('banDialog') banDialog!: TemplateRef<any>;
  
  constructor(
    private organizationService: OrganizationService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.rejectForm = this.formBuilder.group({
      reason: ['', Validators.required]
    });
    
    this.banForm = this.formBuilder.group({
      reason: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.loadPendingOrganizations();
    this.loadAllOrganizations();
  }
  
  loadPendingOrganizations(): void {
    // Load pending organizations from service
    this.organizationService.getPendingOrganizations(this.currentPagePending, this.pageSizePending)
      .subscribe({
        next: (response: any) => {
          this.pendingOrganizations = response.organizations || response.content;
          this.totalPending = response.total || response.totalElements;
        },
        error: (error: any) => {
          console.error('Error loading pending organizations:', error);
          this.snackBar.open('Error loading pending organizations', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  loadAllOrganizations(): void {
    this.organizationService.getAllOrganizations(this.currentPageAll, this.pageSizeAll, this.searchQuery)
      .subscribe({
        next: (response: any) => {
          this.allOrganizations = response.organizations || response.content;
          this.totalAll = response.total || response.totalElements;
        },
        error: (error: any) => {
          console.error('Error loading all organizations:', error);
          this.snackBar.open('Error loading organizations', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  approveOrganization(org: any): void {
    this.organizationService.approveOrganization(org.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Organization approved successfully', 'Close', {
            duration: 3000
          });
          this.loadPendingOrganizations();
          this.loadAllOrganizations();
        },
        error: (error) => {
          console.error('Error approving organization:', error);
          this.snackBar.open('Error approving organization', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  openRejectDialog(org: any): void {
    this.rejectForm.reset();
    const dialogRef = this.dialog.open(this.rejectDialog, {
      width: '500px',
      data: org
    });
  }
  
  confirmReject(org: any): void {
    if (this.rejectForm.valid) {
      const reason = this.rejectForm.get('reason')?.value;
      
      this.organizationService.rejectOrganization(org.id, reason)
        .subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Organization rejected', 'Close', {
              duration: 3000
            });
            this.loadPendingOrganizations();
            this.loadAllOrganizations();
          },
          error: (error) => {
            console.error('Error rejecting organization:', error);
            this.snackBar.open('Error rejecting organization', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
  
  openBanDialog(org: any): void {
    this.banForm.reset();
    const dialogRef = this.dialog.open(this.banDialog, {
      width: '500px',
      data: org
    });
  }
  
  confirmBan(org: any): void {
    if (this.banForm.valid) {
      const reason = this.banForm.get('reason')?.value;
      
      this.organizationService.banOrganization(org.id, reason)
        .subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Organization banned', 'Close', {
              duration: 3000
            });
            this.loadAllOrganizations();
          },
          error: (error) => {
            console.error('Error banning organization:', error);
            this.snackBar.open('Error banning organization', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
  
  unbanOrganization(org: any): void {
    this.organizationService.unbanOrganization(org.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Organization unbanned', 'Close', {
            duration: 3000
          });
          this.loadAllOrganizations();
        },
        error: (error) => {
          console.error('Error unbanning organization:', error);
          this.snackBar.open('Error unbanning organization', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  viewOrganizationDetails(org: any): void {
    // Implement navigation to organization details page
    console.log('View details for organization:', org);
  }
  
  searchOrganizations(): void {
    this.currentPageAll = 0;
    this.loadAllOrganizations();
  }
  
  onPendingPageChange(event: PageEvent): void {
    this.pageSizePending = event.pageSize;
    this.currentPagePending = event.pageIndex;
    this.loadPendingOrganizations();
  }
  
  onAllPageChange(event: PageEvent): void {
    this.pageSizeAll = event.pageSize;
    this.currentPageAll = event.pageIndex;
    this.loadAllOrganizations();
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'REJECTED':
        return 'warn';
      case 'INCOMPLETE':
        return 'accent';
      default:
        return '';
    }
  }
} 