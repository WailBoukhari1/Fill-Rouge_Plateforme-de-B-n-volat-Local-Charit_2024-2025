import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <mat-icon class="text-8xl text-gray-400 mb-6">sentiment_very_dissatisfied</mat-icon>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p class="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="flex justify-center gap-4">
          <a mat-raised-button color="primary" routerLink="/">
            <mat-icon class="mr-2">home</mat-icon>
            Go Home
          </a>
          <button mat-stroked-button (click)="goBack()">
            <mat-icon class="mr-2">arrow_back</mat-icon>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-8xl {
      font-size: 6rem;
    }
  `]
})
export class NotFoundComponent {
  goBack() {
    window.history.back();
  }
} 