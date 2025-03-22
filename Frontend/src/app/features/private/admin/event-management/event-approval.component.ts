import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../../core/services/event.service';
import { IEvent, EventStatus } from '../../../../core/models/event.types';
import { Page } from '../../../../core/models/page.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-approval',
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
    MatTooltipModule,
    RouterModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Event Approval Management</h1>
      
      <mat-card class="mb-6">
        <div class="p-4">
          <h2 class="text-lg font-medium mb-4">Pending Approval Events</h2>
          
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="pendingEvents" class="w-full">
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let event">{{event.title}}</td>
              </ng-container>
              
              <!-- Organization Column -->
              <ng-container matColumnDef="organization">
                <th mat-header-cell *matHeaderCellDef>Organization</th>
                <td mat-cell *matCellDef="let event">{{event.organizationName || 'N/A'}}</td>
              </ng-container>
              
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let event">{{event.startDate | date:'mediumDate'}}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let event">
                  <mat-chip color="accent">{{event.status}}</mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let event">
                  <button mat-icon-button color="primary" (click)="approveEvent(event)" matTooltip="Approve">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="openRejectDialog(event)" matTooltip="Reject">
                    <mat-icon>cancel</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" [routerLink]="['/events', event.id]" matTooltip="View Details">
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
          <h2 class="text-lg font-medium mb-4">All Events</h2>
          
          <div class="mb-4 flex items-center">
            <mat-form-field class="w-full">
              <mat-label>Search Events</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="searchEvents()">
              <button mat-icon-button matSuffix (click)="searchEvents()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>
          </div>
          
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="allEvents" class="w-full">
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let event">{{event.title}}</td>
              </ng-container>
              
              <!-- Organization Column -->
              <ng-container matColumnDef="organization">
                <th mat-header-cell *matHeaderCellDef>Organization</th>
                <td mat-cell *matCellDef="let event">{{event.organizationName || 'N/A'}}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let event">
                  <mat-chip [color]="getStatusColor(event.status)">
                    {{event.status}}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let event">
                  <ng-container *ngIf="event.status === 'PENDING'">
                    <button mat-icon-button color="primary" (click)="approveEvent(event)" matTooltip="Approve">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="openRejectDialog(event)" matTooltip="Reject">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </ng-container>
                  <button mat-icon-button color="primary" [routerLink]="['/events', event.id]" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="allEventsColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: allEventsColumns;"></tr>
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
      <h2 mat-dialog-title>Reject Event</h2>
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
  `
})
export class EventApprovalComponent implements OnInit {
  pendingEvents: IEvent[] = [];
  allEvents: IEvent[] = [];
  
  // Pagination for pending events
  currentPagePending = 0;
  pageSizePending = 10;
  totalPending = 0;
  
  // Pagination for all events
  currentPageAll = 0;
  pageSizeAll = 10;
  totalAll = 0;
  
  // Search
  searchQuery = '';
  
  // Table columns
  displayedColumns: string[] = ['title', 'organization', 'date', 'status', 'actions'];
  allEventsColumns: string[] = ['title', 'organization', 'status', 'actions'];
  
  // Forms
  rejectForm: FormGroup;
  
  @ViewChild('rejectDialog') rejectDialog!: TemplateRef<any>;
  
  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.loadPendingEvents();
    this.loadAllEvents();
  }
  
  loadPendingEvents(): void {
    // Load pending events from service
    this.eventService.getAllEventsForAdmin(this.currentPagePending, this.pageSizePending)
      .subscribe({
        next: (response) => {
          this.pendingEvents = response.content.filter(event => event.status === 'PENDING');
          this.totalPending = this.pendingEvents.length;
        },
        error: (error) => {
          console.error('Error loading pending events:', error);
          this.snackBar.open('Error loading pending events', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  loadAllEvents(): void {
    // Load all events from service
    this.eventService.getAllEventsForAdmin(this.currentPageAll, this.pageSizeAll)
      .subscribe({
        next: (response) => {
          this.allEvents = response.content;
          this.totalAll = response.totalElements;
        },
        error: (error) => {
          console.error('Error loading all events:', error);
          this.snackBar.open('Error loading events', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  onPendingPageChange(event: PageEvent): void {
    this.currentPagePending = event.pageIndex;
    this.pageSizePending = event.pageSize;
    this.loadPendingEvents();
  }
  
  onAllPageChange(event: PageEvent): void {
    this.currentPageAll = event.pageIndex;
    this.pageSizeAll = event.pageSize;
    this.loadAllEvents();
  }
  
  searchEvents(): void {
    // Implement search logic
    if (!this.searchQuery.trim()) {
      this.loadAllEvents();
      return;
    }
    
    // For now we'll just filter the current results
    // In a real implementation, you'd call an API with the search query
    this.eventService.getAllEventsForAdmin(0, 100)
      .subscribe({
        next: (response) => {
          const query = this.searchQuery.toLowerCase();
          this.allEvents = response.content.filter(event => 
            event.title.toLowerCase().includes(query) || 
            (event.description && event.description.toLowerCase().includes(query))
          );
          this.totalAll = this.allEvents.length;
        }
      });
  }
  
  approveEvent(event: IEvent): void {
    if (!event.id) {
      this.snackBar.open('Event ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    this.eventService.approveEvent(event.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Event approved successfully', 'Close', {
            duration: 3000
          });
          this.loadPendingEvents();
          this.loadAllEvents();
        },
        error: (error) => {
          console.error('Error approving event:', error);
          this.snackBar.open('Error approving event', 'Close', {
            duration: 3000
          });
        }
      });
  }
  
  openRejectDialog(event: IEvent): void {
    if (!event.id) {
      this.snackBar.open('Event ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    this.rejectForm.reset();
    const dialogRef = this.dialog.open(this.rejectDialog, {
      width: '500px',
      data: event
    });
  }
  
  confirmReject(event: IEvent): void {
    if (!event.id) {
      this.snackBar.open('Event ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    if (this.rejectForm.valid) {
      const reason = this.rejectForm.get('reason')?.value || '';
      
      this.eventService.rejectEvent(event.id, reason)
        .subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Event rejected', 'Close', {
              duration: 3000
            });
            this.loadPendingEvents();
            this.loadAllEvents();
          },
          error: (error) => {
            console.error('Error rejecting event:', error);
            this.snackBar.open('Error rejecting event', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'REJECTED':
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }
} 