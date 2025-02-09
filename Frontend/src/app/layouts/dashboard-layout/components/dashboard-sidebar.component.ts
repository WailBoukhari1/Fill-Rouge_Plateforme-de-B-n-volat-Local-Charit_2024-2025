import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    MatListModule, 
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="w-64 bg-gray-800 text-white h-full">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-700">
        <a routerLink="/" class="flex items-center space-x-2">
          <mat-icon class="text-primary-400">volunteer_activism</mat-icon>
          <span class="font-bold text-xl">VolunteerHub</span>
        </a>
      </div>

      <!-- Navigation -->
      <mat-nav-list class="py-2">
        <a mat-list-item routerLink="/dashboard" 
           routerLinkActive="bg-gray-700"
           [routerLinkActiveOptions]="{exact: true}"
           class="text-gray-300 hover:bg-gray-700">
          <mat-icon matListItemIcon class="text-gray-400">dashboard</mat-icon>
          <span matListItemTitle>Overview</span>
        </a>

        <a mat-list-item routerLink="/dashboard/events" 
           routerLinkActive="bg-gray-700"
           class="text-gray-300 hover:bg-gray-700">
          <mat-icon matListItemIcon class="text-gray-400">event</mat-icon>
          <span matListItemTitle>Events</span>
        </a>

        <a mat-list-item routerLink="/dashboard/organizations" 
           routerLinkActive="bg-gray-700"
           class="text-gray-300 hover:bg-gray-700">
          <mat-icon matListItemIcon class="text-gray-400">business</mat-icon>
          <span matListItemTitle>Organizations</span>
        </a>

        <a mat-list-item routerLink="/dashboard/volunteer" 
           routerLinkActive="bg-gray-700"
           class="text-gray-300 hover:bg-gray-700">
          <mat-icon matListItemIcon class="text-gray-400">people</mat-icon>
          <span matListItemTitle>Volunteers</span>
        </a>

        <mat-divider class="border-gray-700 my-2"></mat-divider>

        <a mat-list-item routerLink="/dashboard/profile" 
           routerLinkActive="bg-gray-700"
           class="text-gray-300 hover:bg-gray-700">
          <mat-icon matListItemIcon class="text-gray-400">person</mat-icon>
          <span matListItemTitle>Profile</span>
        </a>

        <a mat-list-item routerLink="/dashboard/settings" 
           routerLinkActive="bg-gray-700"
           class="text-gray-300 hover:bg-gray-700">
          <mat-icon matListItemIcon class="text-gray-400">settings</mat-icon>
          <span matListItemTitle>Settings</span>
        </a>
      </mat-nav-list>
    </div>
  `
})
export class DashboardSidebarComponent {} 