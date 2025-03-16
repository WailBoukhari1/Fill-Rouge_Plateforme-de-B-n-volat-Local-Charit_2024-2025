import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="share-modal" [class.hidden]="!isOpen" (click)="onBackdropClick($event)">
      <div class="share-modal-content">
        <button class="close-button" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
        <h2>Share</h2>
        <div class="share-options">
          <button mat-button (click)="share('facebook')">
            <mat-icon>facebook</mat-icon>
            Facebook
          </button>
          <button mat-button (click)="share('twitter')">
            <mat-icon>twitter</mat-icon>
            Twitter
          </button>
          <button mat-button (click)="share('linkedin')">
            <mat-icon>linkedin</mat-icon>
            LinkedIn
          </button>
          <button mat-button (click)="share('email')">
            <mat-icon>email</mat-icon>
            Email
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .share-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .share-modal.hidden {
      display: none;
    }
    .share-modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      position: relative;
      min-width: 300px;
    }
    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      cursor: pointer;
    }
    .share-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class ShareModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('share-modal')) {
      this.close();
    }
  }

  share(platform: string) {
    // Implement sharing logic here
    console.log(`Sharing on ${platform}`);
    this.close();
  }
} 