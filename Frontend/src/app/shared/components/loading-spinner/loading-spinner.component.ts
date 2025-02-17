import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner-container" [class.overlay]="overlay">
      <mat-spinner 
        [diameter]="diameter"
        [strokeWidth]="strokeWidth"
        [color]="color">
      </mat-spinner>
      <div *ngIf="message" class="message">{{ message }}</div>
    </div>
  `,
  styles: [`
    .loading-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .loading-spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 1000;
    }

    .message {
      margin-top: 1rem;
      color: #666;
      font-size: 0.875rem;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay: boolean = false;
  @Input() message?: string;
} 