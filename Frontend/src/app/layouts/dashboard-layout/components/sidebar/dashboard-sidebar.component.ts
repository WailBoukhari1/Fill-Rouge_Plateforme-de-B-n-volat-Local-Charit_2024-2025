import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { Observable, map } from 'rxjs';
import { UserRole } from '@core/models/user.model';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  children?: NavItem[];
  roles?: UserRole[];
}

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './dashboard-sidebar.component.html',
})
export class DashboardSidebarComponent implements OnInit {
  protected authService = inject(AuthService);
  protected navigationItems$!: Observable<NavItem[]>;

  private readonly adminNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
    { 
      icon: 'event', 
      label: 'Events', 
      route: '/dashboard/events',
      children: [
        { icon: 'list', label: 'All Events', route: '/dashboard/events/list' },
        { icon: 'pending_actions', label: 'Pending Events', route: '/dashboard/events/pending' },
        { icon: 'analytics', label: 'Event Analytics', route: '/dashboard/events/analytics' }
      ]
    },
    { 
      icon: 'business', 
      label: 'Organizations', 
      route: '/dashboard/organizations',
      children: [
        { icon: 'list', label: 'All Organizations', route: '/dashboard/organizations' },
        { icon: 'verified', label: 'Pending Verification', route: '/dashboard/organizations/verification' }
      ]
    },
    { 
      icon: 'people', 
      label: 'Volunteers', 
      route: '/dashboard/volunteers',
      children: [
        { icon: 'list', label: 'All Volunteers', route: '/dashboard/volunteers' },
        { icon: 'analytics', label: 'Statistics', route: '/dashboard/volunteers/stats' }
      ]
    },
    { icon: 'admin_panel_settings', label: 'Moderation', route: '/dashboard/moderation' },
    { icon: 'settings', label: 'Settings', route: '/dashboard/settings' }
  ];

  private readonly organizationNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
    { 
      icon: 'event', 
      label: 'Events', 
      route: '/dashboard/events',
      children: [
        { icon: 'list', label: 'My Events', route: '/dashboard/events/list' },
        { icon: 'add_circle', label: 'Create Event', route: '/dashboard/events/create' },
        { icon: 'analytics', label: 'Event Analytics', route: '/dashboard/events/analytics' }
      ]
    },
    { 
      icon: 'group', 
      label: 'Volunteers', 
      route: '/dashboard/volunteers',
      children: [
        { icon: 'how_to_reg', label: 'Registrations', route: '/dashboard/volunteers/registrations' },
        { icon: 'history', label: 'Past Participants', route: '/dashboard/volunteers/history' },
        { icon: 'search', label: 'Find Volunteers', route: '/dashboard/volunteers/search' }
      ]
    },
    { 
      icon: 'business', 
      label: 'Organization', 
      route: '/dashboard/organization',
      children: [
        { icon: 'edit', label: 'Profile', route: '/dashboard/organization/profile' },
        { icon: 'analytics', label: 'Analytics', route: '/dashboard/organization/analytics' },
        { icon: 'settings', label: 'Settings', route: '/dashboard/organization/settings' }
      ]
    }
  ];

  private readonly volunteerNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
    { 
      icon: 'event', 
      label: 'Events', 
      route: '/dashboard/events',
      children: [
        { icon: 'event_available', label: 'My Registrations', route: '/dashboard/events/registered' },
        { icon: 'history', label: 'Past Events', route: '/dashboard/events/history' }
      ]
    },
    { 
      icon: 'person', 
      label: 'My Profile', 
      route: '/dashboard/profile',
      children: [
        { icon: 'badge', label: 'Skills & Availability', route: '/dashboard/profile/skills' },
        { icon: 'history', label: 'Participation History', route: '/dashboard/profile/history' },
        { icon: 'settings', label: 'Settings', route: '/dashboard/profile/settings' }
      ]
    },
    { 
      icon: 'stars', 
      label: 'Achievements', 
      route: '/dashboard/achievements',
      children: [
        { icon: 'emoji_events', label: 'My Badges', route: '/dashboard/achievements/badges' },
        { icon: 'leaderboard', label: 'Leaderboard', route: '/dashboard/achievements/leaderboard' }
      ]
    }
  ];

  ngOnInit() {
    this.navigationItems$ = this.authService.getCurrentUser().pipe(
      map(user => {
        const primaryRole = user?.roles?.[0];
        switch (primaryRole) {
          case UserRole.ADMIN:
            return this.adminNavItems;
          case UserRole.ORGANIZATION:
            return this.organizationNavItems;
          case UserRole.VOLUNTEER:
            return this.volunteerNavItems;
          default:
            return [];
        }
      })
    );
  }
} 