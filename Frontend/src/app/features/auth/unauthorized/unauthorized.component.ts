import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center space-y-8">
        <div>
          <h1 class="text-6xl font-bold text-red-500">401</h1>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            You don't have permission to access this resource.
          </p>
          <p class="mt-2 text-sm text-gray-600" *ngIf="user$ | async as user">
            Current role: {{ user.role }}
          </p>
        </div>

        <div class="flex justify-center space-x-4">
          <button mat-raised-button color="primary" routerLink="/dashboard">
            Go to Dashboard
          </button>
          <button mat-stroked-button routerLink="/">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}
} 