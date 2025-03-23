import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-event-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    FormsModule,
    MatDividerModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-2xl font-bold">Update Event Status</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <p class="mb-4">Event: <span class="font-semibold">{{ data.event.title }}</span></p>
      <p class="mb-4">Current Status: <span class="font-semibold">{{ data.event.status }}</span></p>
      
      <mat-divider class="my-4"></mat-divider>
      
      <div class="mb-4">
        <p class="mb-2 font-medium">Select New Status:</p>
        <mat-radio-group [(ngModel)]="selectedStatus" class="flex flex-col gap-3">
          <mat-radio-button *ngFor="let status of availableStatuses" [value]="status" [disabled]="status === data.event.status">
            {{ status }}
          </mat-radio-button>
        </mat-radio-group>
      </div>
      
      <div class="flex justify-end gap-2 mt-6">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" [disabled]="!selectedStatus || selectedStatus === data.event.status" (click)="onSave()">
          Update Status
        </button>
      </div>
    </div>
  `
})
export class EventStatusDialogComponent {
  selectedStatus: string = '';
  availableStatuses: string[] = [
    'PENDING',
    'APPROVED',
    'ACTIVE',
    'CANCELLED',
    'REJECTED',
    'COMPLETED',
    'SCHEDULED'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {event: any},
    private dialogRef: MatDialogRef<EventStatusDialogComponent>
  ) {
    // Set initial status to current event status
    this.selectedStatus = data.event.status;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (this.selectedStatus && this.selectedStatus !== this.data.event.status) {
      this.dialogRef.close(this.selectedStatus);
    } else {
      this.dialogRef.close(null);
    }
  }
} 