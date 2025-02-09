import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable, map } from 'rxjs';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  children?: NavItem[];
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

  ngOnInit() {
    this.navigationItems$ = this.authService.getCurrentUser().pipe(
      map(user => {
        switch (user?.roles?.[0]) {
          case 'ADMIN':
            return [
              { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
              { 
                icon: 'event', 
                label: 'Events', 
                route: '/dashboard/events',
                children: [
                  { icon: 'list', label: 'All Events', route: '/dashboard/events/list' },
                  { icon: 'pending_actions', label: 'Pending Events', route: '/dashboard/events/pending' },
                  { icon: 'history', label: 'Past Events', route: '/dashboard/events/past' }
                ]
              },
              { 
                icon: 'business', 
                label: 'Organizations', 
                route: '/dashboard/organizations',
                children: [
                  { icon: 'list', label: 'All Organizations', route: '/dashboard/organizations/list' },
                  { icon: 'verified', label: 'Pending Verification', route: '/dashboard/organizations/verification' }
                ]
              },
              { 
                icon: 'people', 
                label: 'Volunteers', 
                route: '/dashboard/volunteers',
                children: [
                  { icon: 'list', label: 'All Volunteers', route: '/dashboard/volunteers/list' },
                  { icon: 'analytics', label: 'Statistics', route: '/dashboard/volunteers/stats' }
                ]
              },
              { icon: 'admin_panel_settings', label: 'Moderation', route: '/dashboard/moderation' }
            ];
          case 'ORGANIZATION':
            return [
              { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
              { 
                icon: 'event', 
                label: 'Events', 
                route: '/dashboard/events',
                children: [
                  { icon: 'list', label: 'My Events', route: '/dashboard/events/list' },
                  { icon: 'edit', label: 'Draft Events', route: '/dashboard/events/drafts' },
                  { icon: 'history', label: 'Past Events', route: '/dashboard/events/past' }
                ]
              },
              { 
                icon: 'group', 
                label: 'Volunteers', 
                route: '/dashboard/volunteers',
                children: [
                  { icon: 'how_to_reg', label: 'Registrations', route: '/dashboard/volunteers/registrations' },
                  { icon: 'history', label: 'Past Participants', route: '/dashboard/volunteers/history' }
                ]
              }
            ];
          case 'VOLUNTEER':
            return [
              { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
              { 
                icon: 'event', 
                label: 'Events', 
                route: '/dashboard/events',
                children: [
                  { icon: 'search', label: 'Find Events', route: '/dashboard/events/search' },
                  { icon: 'event_available', label: 'Registered Events', route: '/dashboard/events/registered' },
                  { icon: 'history', label: 'Past Events', route: '/dashboard/events/history' }
                ]
              },
              { 
                icon: 'person', 
                label: 'My Profile', 
                route: '/dashboard/profile',
                children: [
                  { icon: 'badge', label: 'Skills & Availability', route: '/dashboard/profile/skills' },
                  { icon: 'history', label: 'Participation History', route: '/dashboard/profile/history' }
                ]
              },
              { icon: 'stars', label: 'Achievements', route: '/dashboard/achievements' },
            ];
          default:
            return [];
        }
      })
    );
  }
} 