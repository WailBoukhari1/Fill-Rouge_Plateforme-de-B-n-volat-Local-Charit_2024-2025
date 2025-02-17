import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

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
    MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Sidebar -->
      <mat-sidenav [opened]="isMenuOpen" mode="side" class="w-64 bg-white border-r">
        <!-- Logo and Brand -->
        <div class="p-4 border-b">
          <h1 class="text-xl font-bold text-primary-600">Volunteer Hub</h1>
        </div>

        <!-- Navigation Menu -->
        <mat-nav-list>
          @for(item of getFilteredMenuItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="bg-primary-50">
              <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
              <span matListItemTitle>{{item.label}}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content class="bg-gray-50">
        <!-- Top Toolbar -->
        <mat-toolbar class="bg-white border-b">
          <button mat-icon-button (click)="toggleMenu()">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="flex-1"></span>

          <!-- User Menu -->
          <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center">
            <mat-icon class="mr-2">account_circle</mat-icon>
            <span>{{userName}}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            @if(userRole === 'VOLUNTEER') {
              <a mat-menu-item routerLink="/dashboard/volunteer/profile">
                <mat-icon>person</mat-icon>
                <span>My Profile</span>
              </a>
            } @else if(userRole === 'ORGANIZATION') {
              <a mat-menu-item routerLink="/dashboard/organization/profile">
                <mat-icon>business</mat-icon>
                <span>Organization Profile</span>
              </a>
            }
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .mat-sidenav-container {
      height: 100vh;
    }

    .mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .mat-list-item.active {
      background-color: rgba(var(--primary-color), 0.1);
      color: rgb(var(--primary-color));
    }

    .mat-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class PrivateLayoutComponent {
  menuItems: MenuItem[] = [
    // Volunteer Menu Items
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard/volunteer',
      roles: ['VOLUNTEER']
    },
    {
      label: 'My Events',
      icon: 'event',
      route: '/dashboard/volunteer/events',
      roles: ['VOLUNTEER']
    },
    {
      label: 'My Hours',
      icon: 'schedule',
      route: '/dashboard/volunteer/hours',
      roles: ['VOLUNTEER']
    },
    {
      label: 'Achievements',
      icon: 'emoji_events',
      route: '/dashboard/volunteer/achievements',
      roles: ['VOLUNTEER']
    },

    // Organization Menu Items
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard/organization',
      roles: ['ORGANIZATION']
    },
    {
      label: 'Event Management',
      icon: 'event_note',
      route: '/dashboard/organization/events',
      roles: ['ORGANIZATION']
    },
    {
      label: 'Volunteers',
      icon: 'people',
      route: '/dashboard/organization/volunteers',
      roles: ['ORGANIZATION']
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/dashboard/organization/reports',
      roles: ['ORGANIZATION']
    },

    // Admin Menu Items
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard/admin',
      roles: ['ADMIN']
    },
    {
      label: 'Users',
      icon: 'manage_accounts',
      route: '/dashboard/admin/users',
      roles: ['ADMIN']
    },
    {
      label: 'Organizations',
      icon: 'business_center',
      route: '/dashboard/admin/organizations',
      roles: ['ADMIN']
    },
    {
      label: 'Events',
      icon: 'event_available',
      route: '/dashboard/admin/events',
      roles: ['ADMIN']
    }
  ];

  isMenuOpen = true;
  userRole: string;
  userName: string;

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
  }

  getFilteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.roles.includes(this.userRole));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
} 