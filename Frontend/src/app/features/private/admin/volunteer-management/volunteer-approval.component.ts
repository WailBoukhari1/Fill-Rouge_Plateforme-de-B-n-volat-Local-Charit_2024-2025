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
import { VolunteerService } from '../../../../core/services/volunteer.service';

@Component({
  selector: 'app-volunteer-approval',
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
      <h1 class="text-2xl font-bold mb-6">Volunteer Approval Management</h1>
      
      <mat-card class="mb-6">
        <div class="p-4">
          <h2 class="text-lg font-medium mb-4">Pending Approval Volunteers</h2>
          
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="pendingVolunteers" class="w-full">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let volunteer">{{volunteer.firstName}} {{volunteer.lastName}}</td>
              </ng-container>
              
              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let volunteer">{{volunteer.email}}</td>
              </ng-container>
              
              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let volunteer">{{volunteer.phoneNumber}}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let volunteer">
                  <mat-chip color="warn">{{volunteer.approvalStatus}}</mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let volunteer">
                  <button mat-icon-button color="primary" (click)="approveVolunteer(volunteer)" matTooltip="Approve">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="openRejectDialog(volunteer)" matTooltip="Reject">
                    <mat-icon>cancel</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="viewVolunteerDetails(volunteer)" matTooltip="View Details">
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
          <h2 class="text-lg font-medium mb-4">All Volunteers</h2>
          
          <div class="mb-4 flex items-center">
            <mat-form-field class="w-full">
              <mat-label>Search Volunteers</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="searchVolunteers()">
              <button mat-icon-button matSuffix (click)="searchVolunteers()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>
          </div>
          
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="allVolunteers" class="w-full">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let volunteer">{{volunteer.firstName}} {{volunteer.lastName}}</td>
              </ng-container>
              
              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let volunteer">{{volunteer.email}}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let volunteer">
                  <mat-chip 
                    [color]="getStatusColor(volunteer.approvalStatus)" 
                    [ngClass]="{'line-through': volunteer.banned}">
                    {{volunteer.approvalStatus}}
                  </mat-chip>
                  
                  <mat-chip *ngIf="volunteer.banned" color="warn">BANNED</mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let volunteer">
                  <button 
                    mat-icon-button 
                    [color]="volunteer.banned ? 'primary' : 'warn'"
                    (click)="volunteer.banned ? unbanVolunteer(volunteer) : openBanDialog(volunteer)" 
                    [matTooltip]="volunteer.banned ? 'Unban' : 'Ban'">
                    <mat-icon>{{volunteer.banned ? 'restore' : 'block'}}</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="viewVolunteerDetails(volunteer)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="allVolunteersColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: allVolunteersColumns;"></tr>
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
      <h2 mat-dialog-title>Reject Volunteer</h2>
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
      <h2 mat-dialog-title>Ban Volunteer</h2>
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
          Ban Volunteer
        </button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class VolunteerApprovalComponent implements OnInit {
  pendingVolunteers: any[] = [];
  allVolunteers: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'phone', 'status', 'actions'];
  allVolunteersColumns: string[] = ['name', 'email', 'status', 'actions'];
  
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
    private volunteerService: VolunteerService,
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
    this.loadPendingVolunteers();
    this.loadAllVolunteers();
  }
  
  loadPendingVolunteers(): void {
    // Load pending volunteers from service
    // This will need to be implemented in the volunteer service
    this.volunteerService.getPendingVolunteers(this.currentPagePending, this.pageSizePending)
      .subscribe({
        next: (response) => {
          this.pendingVolunteers = response.volunteers;
          this.totalPending = response.total;
        },
        error: (error) => {
          console.error('Error loading pending volunteers:', error);
          this.snackBar.open('Error loading pending volunteers', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  loadAllVolunteers(): void {
    this.volunteerService.getAllVolunteers(this.currentPageAll, this.pageSizeAll, this.searchQuery)
      .subscribe({
        next: (response) => {
          this.allVolunteers = response.volunteers;
          this.totalAll = response.total;
        },
        error: (error) => {
          console.error('Error loading all volunteers:', error);
          this.snackBar.open('Error loading volunteers', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  approveVolunteer(volunteer: any): void {
    this.volunteerService.approveVolunteer(volunteer.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Volunteer approved successfully', 'Close', {
            duration: 3000
          });
          this.loadPendingVolunteers();
          this.loadAllVolunteers();
        },
        error: (error) => {
          console.error('Error approving volunteer:', error);
          this.snackBar.open('Error approving volunteer', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  openRejectDialog(volunteer: any): void {
    this.rejectForm.reset();
    const dialogRef = this.dialog.open(this.rejectDialog, {
      width: '500px',
      data: volunteer
    });
  }
  
  confirmReject(volunteer: any): void {
    if (this.rejectForm.valid) {
      const reason = this.rejectForm.get('reason')?.value;
      
      this.volunteerService.rejectVolunteer(volunteer.id, reason)
        .subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Volunteer rejected', 'Close', {
              duration: 3000
            });
            this.loadPendingVolunteers();
            this.loadAllVolunteers();
          },
          error: (error) => {
            console.error('Error rejecting volunteer:', error);
            this.snackBar.open('Error rejecting volunteer', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
  
  openBanDialog(volunteer: any): void {
    this.banForm.reset();
    const dialogRef = this.dialog.open(this.banDialog, {
      width: '500px',
      data: volunteer
    });
  }
  
  confirmBan(volunteer: any): void {
    if (this.banForm.valid) {
      const reason = this.banForm.get('reason')?.value;
      
      this.volunteerService.banVolunteer(volunteer.id, reason)
        .subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Volunteer banned', 'Close', {
              duration: 3000
            });
            this.loadAllVolunteers();
          },
          error: (error) => {
            console.error('Error banning volunteer:', error);
            this.snackBar.open('Error banning volunteer', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
  
  unbanVolunteer(volunteer: any): void {
    this.volunteerService.unbanVolunteer(volunteer.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Volunteer unbanned', 'Close', {
            duration: 3000
          });
          this.loadAllVolunteers();
        },
        error: (error) => {
          console.error('Error unbanning volunteer:', error);
          this.snackBar.open('Error unbanning volunteer', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  viewVolunteerDetails(volunteer: any): void {
    // Implement navigation to volunteer details page
    console.log('View details for volunteer:', volunteer);
  }
  
  searchVolunteers(): void {
    this.currentPageAll = 0;
    this.loadAllVolunteers();
  }
  
  onPendingPageChange(event: PageEvent): void {
    this.pageSizePending = event.pageSize;
    this.currentPagePending = event.pageIndex;
    this.loadPendingVolunteers();
  }
  
  onAllPageChange(event: PageEvent): void {
    this.pageSizeAll = event.pageSize;
    this.currentPageAll = event.pageIndex;
    this.loadAllVolunteers();
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'REJECTED':
        return 'warn';
      default:
        return '';
    }
  }
} 