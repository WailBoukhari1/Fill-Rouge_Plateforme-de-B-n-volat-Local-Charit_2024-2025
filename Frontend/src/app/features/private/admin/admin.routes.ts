import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AdminGuard } from '../../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('../dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./user-management/user-management.component')
          .then(m => m.UserManagementComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'organizations',
        loadComponent: () => import('./organization-management/organization-management.component')
          .then(m => m.OrganizationManagementComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'events',
        loadComponent: () => import('./event-management/event-management.component')
          .then(m => m.EventManagementComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component')
          .then(m => m.ReportsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'volunteer-approval',
        loadComponent: () => 
          import('./volunteer-management/volunteer-approval.component').then(c => c.VolunteerApprovalComponent),
        title: 'Volunteer Approval'
      }

    ]
  }
]; 