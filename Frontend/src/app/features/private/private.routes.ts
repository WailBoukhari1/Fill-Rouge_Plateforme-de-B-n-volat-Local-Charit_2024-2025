import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { QuestionnaireCompletedGuard } from '../auth/guards/questionnaire-completed.guard';
import { ProfileCompletedGuard } from '../auth/guards/profile-completed.guard';
import { PrivateLayoutComponent } from '../../layouts/private-layout/private-layout.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { EmailVerificationGuard } from '../../core/guards/email-verification.guard';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [AuthGuard, EmailVerificationGuard, QuestionnaireCompletedGuard, ProfileCompletedGuard],
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
        loadChildren: () =>
          import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      // Organization Routes
      {
        path: 'organization',
        canActivate: [RoleGuard],
        data: { roles: ['ORGANIZATION'] },
        loadChildren: () =>
          import('./organization/organization.routes').then(
            (m) => m.organizationRoutes
          ),
      },
      // Volunteer Routes
      {
        path: 'volunteer',
        canActivate: [RoleGuard],
        data: { roles: ['VOLUNTEER'] },
        loadChildren: () =>
          import('./volunteer/volunteer.routes').then(
            (m) => m.VOLUNTEER_ROUTES
          ),
      },
    ],
  },
];
