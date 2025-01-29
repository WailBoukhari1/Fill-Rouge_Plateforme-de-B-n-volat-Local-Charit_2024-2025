import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./feature/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'events',
    loadChildren: () => import('./feature/event/event.routes').then(m => m.eventRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'organizations',
    loadChildren: () => import('./feature/organization/organization.routes').then(m => m.organizationRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'volunteer',
    loadChildren: () => import('./feature/volunteer/volunteer.routes').then(m => m.volunteerRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/events',
    pathMatch: 'full'
  }
];
