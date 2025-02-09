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
              { icon: 'event', label: 'Events', route: '/dashboard/events' },
              { icon: 'business', label: 'Organizations', route: '/dashboard/organizations' },
              { icon: 'people', label: 'Volunteers', route: '/dashboard/volunteers' },
              { icon: 'analytics', label: 'Analytics', route: '/dashboard/analytics' }
            ];
          case 'ORGANIZATION':
            return [
              { icon: 'event', label: 'My Events', route: '/dashboard/events' },
              { icon: 'group', label: 'Applications', route: '/dashboard/applications' },
              { icon: 'analytics', label: 'Analytics', route: '/dashboard/analytics' }
            ];
          case 'VOLUNTEER':
            return [
              { icon: 'event_available', label: 'My Events', route: '/dashboard/my-events' },
              { icon: 'history', label: 'History', route: '/dashboard/history' },
              { icon: 'stars', label: 'Achievements', route: '/dashboard/achievements' }
            ];
          default:
            return [];
        }
      })
    );
  }
} 