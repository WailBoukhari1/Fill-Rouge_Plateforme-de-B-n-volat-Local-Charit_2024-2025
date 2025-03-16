import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { selectUser } from '../store/auth/auth.selectors';
import { UserRole } from '../core/models/auth.models';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
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
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }
    .sidenav-content {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .logo-container {
      text-align: center;
      padding: 16px 0;
      margin-bottom: 16px;
    }
    .logo {
      max-width: 150px;
      height: auto;
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
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .active-link {
      background: rgba(0, 0, 0, 0.04);
      color: #1976d2;
    }
    mat-icon {
      margin-right: 8px;
      color: #666;
    }
    .active-link mat-icon {
      color: #1976d2;
    }
    mat-sidenav-content {
      background-color: #ffffff;
      padding: 24px;
    }
    @media (max-width: 600px) {
      .sidenav {
        width: 100%;
        max-width: 280px;
      }
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
        { label: 'Users', icon: 'people', route: '/users' },
        { label: 'Organizations', icon: 'business', route: '/organizations' },
        { label: 'Events', icon: 'event', route: '/events' },
        { label: 'Reports', icon: 'assessment', route: '/reports' }
      ]
    },
    {
      name: 'Organization Dashboard',
      roles: [UserRole.ORGANIZATION],
      items: [
        { label: 'Profile', icon: 'business', route: '/profile/organization' },
        { label: 'Events', icon: 'event', route: '/events' },
        { label: 'Reports', icon: 'assessment', route: '/reports' }
      ]
    },
    {
      name: 'Volunteer Dashboard',
      roles: [UserRole.VOLUNTEER],
      items: [
        { label: 'Profile', icon: 'person', route: '/volunteer/profile' },
        { label: 'Events', icon: 'event', route: '/volunteer/events' },
        { label: 'Hours', icon: 'schedule', route: '/volunteer/hours' },
        { label: 'Achievements', icon: 'emoji_events', route: '/volunteer/achievements' },
        { label: 'Waitlist', icon: 'hourglass_empty', route: '/volunteer/waitlist' }
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