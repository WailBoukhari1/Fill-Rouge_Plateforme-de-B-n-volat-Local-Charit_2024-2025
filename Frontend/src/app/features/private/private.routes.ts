import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { QuestionnaireCompletedGuard } from '../auth/guards/questionnaire-completed.guard';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, QuestionnaireCompletedGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            redirectTo: 'volunteer',
            pathMatch: 'full',
          },
          {
            path: 'volunteer',
            loadComponent: () =>
              import('./volunteer/profile/volunteer-profile.component').then(
                (m) => m.VolunteerProfileComponent
              ),
            canActivate: [RoleGuard],
            data: { roles: ['VOLUNTEER'] },
          },
          {
            path: 'organization',
            loadComponent: () =>
              import(
                './organization/profile/organization-profile.component'
              ).then((m) => m.OrganizationProfileComponent),
            canActivate: [RoleGuard],
            data: { roles: ['ORGANIZATION'] },
          },
        ],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import(
            './admin/organization-management/organization-management.component'
          ).then((m) => m.OrganizationManagementComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./admin/event-management/event-management.component').then(
            (m) => m.EventManagementComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ORGANIZATION'] },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./admin/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ORGANIZATION'] },
      },
      // Volunteer Routes
      {
        path: 'volunteer',
        canActivate: [RoleGuard],
        data: { roles: ['VOLUNTEER'] },
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import('./volunteer/profile/volunteer-profile.component').then(
                (m) => m.VolunteerProfileComponent
              ),
          },
          {
            path: 'events',
            loadComponent: () =>
              import('./volunteer/events/volunteer-events.component').then(
                (m) => m.VolunteerEventsComponent
              ),
          },
          {
            path: 'hours',
            loadComponent: () =>
              import('./volunteer/hours/volunteer-hours.component').then(
                (m) => m.VolunteerHoursComponent
              ),
          },
          {
            path: 'achievements',
            loadComponent: () =>
              import(
                './volunteer/achievements/volunteer-achievements.component'
              ).then((m) => m.VolunteerAchievementsComponent),
          },
          {
            path: 'waitlist',
            loadComponent: () =>
              import('./volunteer/waitlist/volunteer-waitlist.component').then(
                (m) => m.VolunteerWaitlistComponent
              ),
          },
          {
            path: 'feedback/:eventId',
            loadComponent: () =>
              import('./volunteer/feedback/volunteer-feedback.component').then(
                (m) => m.VolunteerFeedbackComponent
              ),
          },
        ],
      },
    ],
  },
];
