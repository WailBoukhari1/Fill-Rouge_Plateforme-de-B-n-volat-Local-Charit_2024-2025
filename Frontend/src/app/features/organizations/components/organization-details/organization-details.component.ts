import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-4">
      <mat-card class="mb-4">
        <mat-card-header>
          <img mat-card-avatar [src]="organization.logo" alt="Logo">
          <mat-card-title>{{organization.name}}</mat-card-title>
          <mat-card-subtitle>{{organization.type}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="mt-4">{{organization.description}}</p>
        </mat-card-content>
      </mat-card>

      <mat-tab-group>
        <mat-tab label="Events">
          <div class="p-4">
            <h3 class="text-xl mb-4">Upcoming Events</h3>
            <div *ngFor="let event of organization.events" class="mb-3">
              <h4>{{event.title}}</h4>
              <p>{{event.date | date}}</p>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="About">
          <div class="p-4">
            <h3 class="text-xl mb-4">Contact Information</h3>
            <p><mat-icon>location_on</mat-icon> {{organization.address}}</p>
            <p><mat-icon>email</mat-icon> {{organization.email}}</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class OrganizationDetailsComponent {
  organization = {
    name: 'Green Earth Foundation',
    type: 'Environmental',
    logo: 'assets/logo.png',
    description: 'Dedicated to environmental conservation and sustainability.',
    address: '123 Green Street, Eco City',
    email: 'contact@greenearth.org',
    events: [
      { title: 'Beach Cleanup', date: '2024-03-15' },
      { title: 'Tree Planting', date: '2024-03-20' }
    ]
  };
} 