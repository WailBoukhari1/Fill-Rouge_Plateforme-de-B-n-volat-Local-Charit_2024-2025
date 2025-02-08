import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./feature/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'events',
    loadChildren: () => import('./feature/event/event.routes').then(m => m.EVENT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'organizations',
    loadChildren: () => import('./feature/organization/organization.routes').then(m => m.ORGANIZATION_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'volunteer',
    loadChildren: () => import('./feature/volunteer/volunteer.routes').then(m => m.VOLUNTEER_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'events'
  }
];
