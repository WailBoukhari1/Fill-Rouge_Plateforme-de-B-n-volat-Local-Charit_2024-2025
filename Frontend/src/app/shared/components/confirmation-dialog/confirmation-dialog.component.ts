import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title class="dialog-title" [ngClass]="data.type">
        <mat-icon class="title-icon">
          {{ getIcon() }}
        </mat-icon>
        {{ data.title }}
      </h2>

      <mat-dialog-content class="dialog-content">
        {{ data.message }}
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button
                [color]="getButtonColor()"
                (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      padding: 1rem;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      margin: 0;
      padding-bottom: 1rem;
    }

    .title-icon {
      margin-right: 0.5rem;
    }

    .dialog-content {
      padding: 1rem 0;
      color: #666;
    }

    .warning {
      color: #f59e0b;
    }

    .danger {
      color: #ef4444;
    }

    .info {
      color: #3b82f6;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warn';
      case 'danger':
        return 'warn';
      default:
        return 'primary';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 