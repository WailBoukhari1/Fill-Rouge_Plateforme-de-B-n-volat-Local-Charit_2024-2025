import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../store/auth/auth.selectors';
import { UserRole } from '../core/models/auth.models';

@Component({
  selector: 'app-dashboard-layout',
  template: `
    <div class="dashboard-container">
      <mat-sidenav-container>
        <mat-sidenav mode="side" opened class="sidenav">
          <div class="sidenav-content">
            <div class="logo-container">
              <img src="assets/images/logo.png" alt="Logo" class="logo">
            </div>
            <mat-nav-list>
              <div *ngFor="let section of navigationSections">
                <div *ngIf="shouldShowSection(section.roles)" class="nav-section">
                  <h3 class="section-header">{{ section.name }}</h3>
                  <a mat-list-item *ngFor="let item of section.items"
                     [routerLink]="item.route"
                     routerLinkActive="active-link">
                    <mat-icon>{{ item.icon }}</mat-icon>
                    <span>{{ item.label }}</span>
                  </a>
                  <mat-divider></mat-divider>
                </div>
              </div>
            </mat-nav-list>
          </div>
        </mat-sidenav>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
    }
    .sidenav {
      width: 280px;
      background: #f5f5f5;
    }
    .sidenav-content {
      padding: 16px;
    }
    .logo-container {
      text-align: center;
      padding: 16px 0;
    }
    .logo {
      max-width: 150px;
    }
    .nav-section {
      margin-bottom: 16px;
    }
    .section-header {
      padding: 8px 16px;
      margin: 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
    .active-link {
      background: rgba(0, 0, 0, 0.04);
    }
    mat-icon {
      margin-right: 8px;
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  user$ = this.store.select(selectUser);
  userRole: UserRole | null = null;

  navigationSections = [
    {
      name: 'Admin Dashboard',
      roles: [UserRole.ADMIN],
      items: [
        { label: 'Skills Management', icon: 'psychology', route: '/dashboard/admin/skills' },
        { label: 'Organizations', icon: 'business', route: '/dashboard/admin/organizations' },
        { label: 'Reports', icon: 'assessment', route: '/dashboard/admin/reports' }
      ]
    },
    {
      name: 'Organization Dashboard',
      roles: [UserRole.ORGANIZATION],
      items: [
        { label: 'Events', icon: 'event', route: '/dashboard/organization/events' },
        { label: 'Resources', icon: 'folder', route: '/dashboard/organization/resources' },
        { label: 'Reports', icon: 'assessment', route: '/dashboard/organization/reports' },
        { label: 'Messages', icon: 'message', route: '/dashboard/messages' },
        { label: 'Notifications', icon: 'notifications', route: '/dashboard/notifications' }
      ]
    },
    {
      name: 'Volunteer Dashboard',
      roles: [UserRole.VOLUNTEER],
      items: [
        { label: 'Profile', icon: 'person', route: '/dashboard/volunteer/profile' },
        { label: 'Events', icon: 'event', route: '/dashboard/volunteer/events' },
        { label: 'Achievements', icon: 'emoji_events', route: '/dashboard/volunteer/achievements' },
        { label: 'Messages', icon: 'message', route: '/dashboard/messages' },
        { label: 'Notifications', icon: 'notifications', route: '/dashboard/notifications' }
      ]
    }
  ];

  constructor(private store: Store) {}

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
      }
    });
  }

  shouldShowSection(roles: UserRole[]): boolean {
    return this.userRole !== null && roles.includes(this.userRole);
  }
} 