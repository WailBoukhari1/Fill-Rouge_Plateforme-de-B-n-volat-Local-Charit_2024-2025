import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrganizationProfile } from '../../../../core/services/organization.service';

@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="organization-card">
      <div class="card-header">
        <img [src]="organization.profilePicture || 'assets/default-org.png'" 
             [alt]="organization.name"
             class="profile-picture">
        <div class="header-info">
          <h3>{{organization.name}}</h3>
          <p class="location">
            <mat-icon>location_on</mat-icon>
            {{organization.location}}
          </p>
        </div>
      </div>

      <div class="card-content">
        <p class="description">{{organization.description}}</p>

        <div class="stats">
          <div class="stat-item">
            <mat-icon>event</mat-icon>
            <span>{{organization.totalEvents}} Events</span>
          </div>
          <div class="stat-item">
            <mat-icon>people</mat-icon>
            <span>{{organization.totalVolunteers}} Volunteers</span>
          </div>
          <div class="stat-item">
            <mat-icon>schedule</mat-icon>
            <span>{{organization.totalHours}} Hours</span>
          </div>
        </div>

        <div class="category">
          <mat-chip>{{organization.category}}</mat-chip>
          <mat-chip>{{organization.size}}</mat-chip>
        </div>

        <div class="rating">
          <mat-icon class="star">star</mat-icon>
          <span>{{organization.rating | number:'1.1-1'}}</span>
        </div>
      </div>

      <div class="card-footer">
        <span [class]="'status ' + organization.status.toLowerCase()">
          {{organization.status}}
        </span>
      </div>
    </mat-card>
  `,
  styles: [`
    .organization-card {
      margin: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .organization-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .profile-picture {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 1rem;
    }

    .header-info {
      flex: 1;
    }

    .header-info h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .location {
      display: flex;
      align-items: center;
      color: #666;
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
    }

    .location mat-icon {
      font-size: 1rem;
      margin-right: 0.25rem;
    }

    .card-content {
      padding: 1rem;
    }

    .description {
      color: #666;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      color: #666;
    }

    .stat-item mat-icon {
      font-size: 1.2rem;
      margin-right: 0.25rem;
    }

    .category {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .rating {
      display: flex;
      align-items: center;
      color: #f59e0b;
    }

    .rating .star {
      color: #f59e0b;
    }

    .card-footer {
      padding: 0.5rem 1rem;
      border-top: 1px solid #eee;
    }

    .status {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      text-transform: uppercase;
    }

    .status.active {
      background-color: #dcfce7;
      color: #166534;
    }

    .status.inactive {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .status.pending {
      background-color: #fef3c7;
      color: #92400e;
    }
  `]
})
export class OrganizationCardComponent {
  @Input() organization!: OrganizationProfile;
} 