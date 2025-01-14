import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Dashboard</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Welcome to your dashboard!</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class DashboardComponent {
  constructor() {}
} 