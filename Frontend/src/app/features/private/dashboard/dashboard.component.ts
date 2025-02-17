import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  menuItems: MenuItem[] = [
    // Volunteer Menu Items
    {
      label: 'My Events',
      icon: 'event',
      route: '/dashboard/volunteer/events',
      roles: ['VOLUNTEER']
    },
    {
      label: 'My Profile',
      icon: 'person',
      route: '/dashboard/volunteer/profile',
      roles: ['VOLUNTEER']
    },
    {
      label: 'Achievements',
      icon: 'emoji_events',
      route: '/dashboard/volunteer/achievements',
      roles: ['VOLUNTEER']
    },
    {
      label: 'My Hours',
      icon: 'schedule',
      route: '/dashboard/volunteer/hours',
      roles: ['VOLUNTEER']
    },

    // Organization Menu Items
    {
      label: 'Event Management',
      icon: 'event_note',
      route: '/dashboard/organization/events',
      roles: ['ORGANIZATION']
    },
    {
      label: 'Organization Profile',
      icon: 'business',
      route: '/dashboard/organization/profile',
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
      label: 'Overview',
      icon: 'dashboard',
      route: '/dashboard/admin/overview',
      roles: ['ADMIN']
    },
    {
      label: 'User Management',
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
    },
    {
      label: 'Reports & Analytics',
      icon: 'analytics',
      route: '/dashboard/admin/analytics',
      roles: ['ADMIN']
    }
  ];

  userRole: string = '';
  userName: string = '';
  isMenuOpen = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Get user role and name from auth service
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