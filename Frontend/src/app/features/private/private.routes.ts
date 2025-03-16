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
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      // Admin Routes
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('./admin/user-management/user-management.component').then(
                (m) => m.UserManagementComponent
              ),
          },
          {
            path: 'organizations',
            loadComponent: () =>
              import('./admin/organization-management/organization-management.component').then(
                (m) => m.OrganizationManagementComponent
              ),
          },
          {
            path: 'events',
            loadComponent: () =>
              import('./admin/event-management/event-management.component').then(
                (m) => m.EventManagementComponent
              ),
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./admin/reports/reports.component').then(
                (m) => m.ReportsComponent
              ),
          }
        ]
      },
      // Organization Routes
      {
        path: 'organization',
        canActivate: [RoleGuard],
        data: { roles: ['ORGANIZATION'] },
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./organization/dashboard/organization-dashboard.component').then(
                (m) => m.OrganizationDashboardComponent
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./organization/profile/organization-profile.component').then(
                (m) => m.OrganizationProfileComponent
              ),
          },
          {
            path: 'events',
            loadChildren: () => import('./events/events.routes').then(m => m.EVENTS_ROUTES)
          },
          {
            path: 'volunteers',
            loadComponent: () =>
              import('./organization/volunteers/volunteer-management.component').then(
                (m) => m.VolunteerManagementComponent
              ),
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./organization/reports/organization-reports.component').then(
                (m) => m.OrganizationReportsComponent
              ),
          }
        ]
      },
      // Volunteer Routes
      {
        path: 'volunteer',
        canActivate: [RoleGuard],
        data: { roles: ['VOLUNTEER'] },
        loadChildren: () => import('./volunteer/volunteer.routes').then(m => m.VOLUNTEER_ROUTES)
      }
    ]
  }
];
