import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    RouterLinkActive, 
    MatButtonModule, 
    MatToolbarModule, 
    MatIconModule, 
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="bg-white border-b">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center space-x-2">
          <mat-icon class="text-primary-600">volunteer_activism</mat-icon>
          <span class="font-bold text-xl">VolunteerHub</span>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-6">
          <a routerLink="/events" 
             routerLinkActive="text-primary-600"
             class="text-gray-700 hover:text-primary-600 transition-colors">
            Events
          </a>
          <a routerLink="/organizations" 
             routerLinkActive="text-primary-600"
             class="text-gray-700 hover:text-primary-600 transition-colors">
            Organizations
          </a>
          <a routerLink="/volunteer" 
             routerLinkActive="text-primary-600"
             class="text-gray-700 hover:text-primary-600 transition-colors">
            Volunteer
          </a>
        </nav>

        <!-- Desktop Auth Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Show when user is NOT authenticated -->
          <ng-container *ngIf="!(authService.isAuthenticated$ | async); else authenticatedUser">
            <a mat-stroked-button routerLink="/auth/login">Login</a>
            <a mat-raised-button color="primary" routerLink="/auth/register">Sign Up</a>
          </ng-container>

          <!-- Show when user is authenticated -->
          <ng-template #authenticatedUser>
            <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
              <mat-icon>notifications</mat-icon>
            </button>
            
            <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center space-x-1">
              <mat-icon>account_circle</mat-icon>
              <span>{{ (authService.getCurrentUser() | async)?.email || 'User' }}</span>
            </button>

            <mat-menu #notificationMenu="matMenu">
              <div class="p-4 w-80">
                <h3 class="text-lg font-semibold mb-2">Notifications</h3>
                <div class="text-gray-500">No new notifications</div>
              </div>
            </mat-menu>

            <mat-menu #userMenu="matMenu">
              <a mat-menu-item routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
              <a mat-menu-item routerLink="/dashboard/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>exit_to_app</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </ng-template>
        </div>

        <!-- Mobile Menu Button and Navigation -->
        <div class="md:hidden">
          <button mat-icon-button [matMenuTriggerFor]="mobileMenu">
            <mat-icon>menu</mat-icon>
          </button>

          <mat-menu #mobileMenu="matMenu">
            
            <!-- Mobile auth menu items -->
            <ng-container *ngIf="!(authService.isAuthenticated$ | async); else authenticatedMobileMenu">
              <a mat-menu-item routerLink="/auth/login">Login</a>
              <a mat-menu-item routerLink="/auth/register">Sign Up</a>
            </ng-container>

            <ng-template #authenticatedMobileMenu>
              <a mat-menu-item routerLink="/dashboard">Dashboard</a>
              <a mat-menu-item routerLink="/dashboard/profile">Profile</a>
              <button mat-menu-item (click)="logout()">Logout</button>
            </ng-template>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();

    window.location.href = '/';

  }
} 