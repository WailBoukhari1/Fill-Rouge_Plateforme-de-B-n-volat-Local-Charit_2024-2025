import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [
    RouterLink, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="bg-white border-b px-4">
      <div class="flex items-center justify-between w-full">
        <button mat-icon-button (click)="onToggleSidebar()">
          <mat-icon>menu</mat-icon>
        </button>

        <div class="flex-1 px-4">
          <h1 class="text-xl font-semibold">Dashboard</h1>
        </div>

        <div class="flex items-center space-x-4">
          <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
            <mat-icon>notifications</mat-icon>
          </button>
          
          <button mat-icon-button [matMenuTriggerFor]="profileMenu" class="ml-2">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #notificationMenu="matMenu">
            <div class="p-4 w-80">
              <h3 class="text-lg font-semibold mb-2">Notifications</h3>
              <div class="text-gray-500">No new notifications</div>
            </div>
          </mat-menu>

          <mat-menu #profileMenu="matMenu">
            <a mat-menu-item routerLink="/dashboard/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </a>
            <a mat-menu-item routerLink="/dashboard/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `
})
export class DashboardNavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    // Implement logout logic
  }
} 