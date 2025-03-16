import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { VolunteerProfile } from '../../../../core/services/volunteer.service';

@Component({
  selector: 'app-volunteer-profile-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <mat-card class="volunteer-card">
      <mat-card-header>
        <div class="flex items-center">
          <mat-icon class="text-primary-500 mr-2">person</mat-icon>
          <mat-card-title>{{volunteer.firstName}} {{volunteer.lastName}}</mat-card-title>
        </div>
      </mat-card-header>
      <mat-card-content>
        <div class="mb-4">
          <p class="text-gray-600">{{volunteer.bio}}</p>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          @for(skill of volunteer.skills; track skill) {
            <mat-chip>{{skill}}</mat-chip>
          }
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <mat-icon class="text-sm mr-1">location_on</mat-icon>
          <span>{{volunteer.city}}, {{volunteer.country}}</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .volunteer-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .volunteer-card:hover {
      transform: translateY(-4px);
    }
  `]
})
export class VolunteerProfileCardComponent {
  @Input() volunteer!: VolunteerProfile;
} 