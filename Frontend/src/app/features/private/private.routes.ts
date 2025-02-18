import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'organizations',
        loadComponent: () => import('./admin/organization-management/organization-management.component').then(m => m.OrganizationManagementComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./admin/event-management/event-management.component').then(m => m.EventManagementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./admin/reports/reports.component').then(m => m.ReportsComponent)
      },
      // Volunteer Routes
      {
        path: 'volunteer',
        children: [
          {
            path: 'profile',
            loadComponent: () => import('./volunteer/profile/volunteer-profile.component').then(m => m.VolunteerProfileComponent)
          },
          {
            path: 'events',
            loadComponent: () => import('./volunteer/events/volunteer-events.component').then(m => m.VolunteerEventsComponent)
          },
          {
            path: 'hours',
            loadComponent: () => import('./volunteer/hours/volunteer-hours.component').then(m => m.VolunteerHoursComponent)
          },
          {
            path: 'achievements',
            loadComponent: () => import('./volunteer/achievements/volunteer-achievements.component').then(m => m.VolunteerAchievementsComponent)
          },
          {
            path: 'waitlist',
            loadComponent: () => import('./volunteer/waitlist/volunteer-waitlist.component').then(m => m.VolunteerWaitlistComponent)
          },
          {
            path: 'feedback/:eventId',
            loadComponent: () => import('./volunteer/feedback/volunteer-feedback.component').then(m => m.VolunteerFeedbackComponent)
          }
        ]
      }
    ]
  }
]; 