import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule],
  template: `
    <div class="p-4">
      <mat-card class="mb-4">
        <mat-card-header>
          <img mat-card-avatar [src]="profile.logo" alt="Logo">
          <mat-card-title>{{profile.name}}</mat-card-title>
          <mat-card-subtitle>{{profile.type}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="mt-4">{{profile.description}}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary">Edit Profile</button>
        </mat-card-actions>
      </mat-card>

      <mat-tab-group>
        <mat-tab label="Events">
          <div class="p-4">
            <h3>Upcoming Events</h3>
            <div *ngFor="let event of profile.events">
              <h4>{{event.title}}</h4>
              <p>{{event.date | date}}</p>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Contact">
          <div class="p-4">
            <p><mat-icon>location_on</mat-icon> {{profile.address}}</p>
            <p><mat-icon>email</mat-icon> {{profile.email}}</p>
            <p><mat-icon>phone</mat-icon> {{profile.phone}}</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class OrganizationProfileComponent {
  profile = {
    name: 'Green Earth Foundation',
    type: 'Environmental',
    logo: 'assets/logo.png',
    description: 'Dedicated to environmental conservation and sustainability.',
    address: '123 Green Street',
    email: 'contact@greenearth.org',
    phone: '(555) 123-4567',
    events: [
      { title: 'Beach Cleanup', date: '2024-03-15' },
      { title: 'Tree Planting', date: '2024-03-20' }
    ]
  };
} 