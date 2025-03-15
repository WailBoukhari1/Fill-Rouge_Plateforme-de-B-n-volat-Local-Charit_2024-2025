import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-close-account-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Close Account</h2>
    <mat-dialog-content>
      <p>Are you sure you want to close your account? This action cannot be undone.</p>
      <p class="warning-text">All your data, including:</p>
      <ul>
        <li>Profile information</li>
        <li>Volunteer history</li>
        <li>Achievements</li>
        <li>Hours logged</li>
      </ul>
      <p>will be permanently deleted.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Close Account</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 24px;
    }

    .warning-text {
      color: #d32f2f;
      font-weight: 500;
      margin-top: 16px;
    }

    ul {
      margin: 8px 0;
      padding-left: 24px;
    }

    li {
      margin: 4px 0;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class CloseAccountDialogComponent {
  constructor(private dialogRef: MatDialogRef<CloseAccountDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
} 