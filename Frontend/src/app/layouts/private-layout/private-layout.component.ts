import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.models';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" opened class="w-64 p-4">
        <div class="flex items-center mb-8">
          <mat-icon class="text-primary-600 mr-2">volunteer_activism</mat-icon>
          <span class="text-xl font-bold">Volunteer Hub</span>
        </div>

        <!-- Navigation Menu -->
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          @if (userRole === UserRole.ADMIN) {
            <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
              <mat-icon matListItemIcon>manage_accounts</mat-icon>
              <span matListItemTitle>Users</span>
            </a>
            <a mat-list-item routerLink="/admin/organizations" routerLinkActive="active">
              <mat-icon matListItemIcon>business_center</mat-icon>
              <span matListItemTitle>Organizations</span>
            </a>
            <a mat-list-item routerLink="/admin/events" routerLinkActive="active">
              <mat-icon matListItemIcon>event_available</mat-icon>
              <span matListItemTitle>Events</span>
            </a>
          }

          <!-- Volunteer Menu Items -->
          <ng-container *ngIf="userRole === UserRole.VOLUNTEER">
            <a mat-list-item routerLink="/volunteer/profile" routerLinkActive="active">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>My Profile</span>
            </a>
            <a mat-list-item routerLink="/volunteer/events" routerLinkActive="active">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>My Events</span>
            </a>
            <!-- <a mat-list-item routerLink="/volunteer/hours" routerLinkActive="active">
              <mat-icon matListItemIcon>schedule</mat-icon>
              <span matListItemTitle>My Hours</span>
            </a>
            <a mat-list-item routerLink="/volunteer/achievements" routerLinkActive="active">
              <mat-icon matListItemIcon>emoji_events</mat-icon>
              <span matListItemTitle>Achievements</span>
            </a>
              <a mat-list-item routerLink="/volunteer/waitlist" routerLinkActive="active">
              <mat-icon matListItemIcon>hourglass_empty</mat-icon>
              <span matListItemTitle>Waitlist</span>
            </a> -->
          </ng-container>

          @if (userRole === UserRole.ORGANIZATION) {
  
              <a mat-list-item routerLink="/organization/profile" routerLinkActive="active">
              <mat-icon matListItemIcon>business</mat-icon>
              <span matListItemTitle>Profile</span>
            </a>
            <a mat-list-item routerLink="/organization/events" routerLinkActive="active">
              <mat-icon matListItemIcon>event_note</mat-icon>
              <span matListItemTitle>Event Management</span>
            </a>
            <a mat-list-item routerLink="/organization/volunteers" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Volunteers</span>
            </a>
            <a mat-list-item routerLink="/organization/reports" routerLinkActive="active">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Reports</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <!-- Toolbar -->
        <mat-toolbar class="bg-white border-b">
          <div class="flex items-center justify-between w-full px-4">
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>

            <!-- User Menu -->
            <div>
              <button
                mat-button
                [matMenuTriggerFor]="userMenu"
                class="flex items-center"
              >
                <mat-icon class="mr-2">account_circle</mat-icon>
                <span>{{ userName }}</span>
                <mat-icon>arrow_drop_down</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu">
                @if (userRole === UserRole.VOLUNTEER) {
                  <a mat-menu-item routerLink="/volunteer/profile">
                    <mat-icon>person</mat-icon>
                    <span>Profile</span>
                  </a>
                } @else if (userRole === UserRole.ORGANIZATION) {
                  <a mat-menu-item routerLink="/organization/profile">
                    <mat-icon>business</mat-icon>
                    <span>Profile</span>
                  </a>
                }
                <button mat-menu-item (click)="onLogout()">
                  <mat-icon>exit_to_app</mat-icon>
                  <span>Logout</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .mat-sidenav-container {
        height: 100%;
      }

      .active {
        background-color: rgba(var(--primary-color), 0.1);
        color: rgb(var(--primary-color));
      }

      mat-sidenav {
        background-color: #f8f9fa;
        border-right: 1px solid rgba(0, 0, 0, 0.12);
      }

      mat-toolbar {
        background-color: #ffffff;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }

      .text-primary-600 {
        color: rgb(var(--primary-color));
      }
    `,
  ],
})
export class PrivateLayoutComponent implements OnInit {
  userRole: UserRole | null = null;
  userName: string = '';
  protected readonly UserRole = UserRole;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole() as UserRole;
    this.userName = this.authService.getUserName();
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        // Still navigate to login page even if logout fails
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
