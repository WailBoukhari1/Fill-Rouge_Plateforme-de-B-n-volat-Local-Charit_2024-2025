import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OrganizationProfile } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule
  ],
  template: `
    <mat-card class="organization-card" [routerLink]="['/dashboard/organization', organization.id]">
      <mat-card-header>
        <div class="flex items-center w-full">
          @if (organization.logo) {
            <img [src]="organization.logo" alt="Organization logo" class="w-12 h-12 rounded-full mr-4">
          } @else {
            <mat-icon class="text-primary-500 mr-4">business</mat-icon>
          }
          <div class="flex-grow">
            <mat-card-title class="text-lg font-semibold">{{organization.name}}</mat-card-title>
            <mat-card-subtitle class="text-sm">
              <mat-icon class="text-sm align-middle">location_on</mat-icon>
              {{organization.city}}, {{organization.country}}
            </mat-card-subtitle>
          </div>
          @if (organization.verified) {
            <mat-icon class="text-primary-500" matTooltip="Verified Organization">verified</mat-icon>
          }
        </div>
      </mat-card-header>

      <mat-card-content class="mt-4">
        <p class="text-gray-600 line-clamp-2 mb-4">{{organization.description}}</p>

        <div class="flex flex-wrap gap-2 mb-4">
          @for (area of organization.focusAreas; track area) {
            <mat-chip>{{area}}</mat-chip>
          }
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div class="flex items-center">
            <mat-icon class="text-sm mr-1">event</mat-icon>
            <span>{{organization.totalEventsHosted}} Events</span>
          </div>
          <div class="flex items-center">
            <mat-icon class="text-sm mr-1">people</mat-icon>
            <span>{{organization.activeVolunteers}} Volunteers</span>
          </div>
          <div class="flex items-center">
            <mat-icon class="text-sm mr-1">schedule</mat-icon>
            <span>{{organization.totalVolunteerHours}} Hours</span>
          </div>
          <div class="flex items-center">
            <mat-icon class="text-sm mr-1">star</mat-icon>
            <span>{{organization.rating | number:'1.1-1'}} Rating</span>
          </div>
        </div>

        @if (organization.acceptingVolunteers) {
          <div class="mt-4">
            <mat-chip color="primary" selected>Accepting Volunteers</mat-chip>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .organization-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .organization-card:hover {
      transform: translateY(-4px);
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class OrganizationCardComponent {
  @Input() organization!: OrganizationProfile;
} 