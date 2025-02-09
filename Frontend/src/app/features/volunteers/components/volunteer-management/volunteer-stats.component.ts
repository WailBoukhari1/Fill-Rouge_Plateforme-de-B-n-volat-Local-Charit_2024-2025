import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-volunteer-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Volunteer Statistics</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>people</mat-icon>
            <mat-card-title>Total Volunteers</mat-card-title>
            <mat-card-subtitle>Active this month</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="text-3xl font-bold pt-4">
            150
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>event</mat-icon>
            <mat-card-title>Events Covered</mat-card-title>
            <mat-card-subtitle>This month</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="text-3xl font-bold pt-4">
            45
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>schedule</mat-icon>
            <mat-card-title>Hours Contributed</mat-card-title>
            <mat-card-subtitle>Total this month</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="text-3xl font-bold pt-4">
            1,250
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class VolunteerStatsComponent {} 