import { Routes } from '@angular/router';
import { PUBLIC_ROUTES } from './features/public/public.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { PRIVATE_ROUTES } from './features/private/private.routes';

export const routes: Routes = [
  ...PUBLIC_ROUTES,
  {
    path: 'auth',
    children: AUTH_ROUTES
  },
  {
    path: 'dashboard',
    children: PRIVATE_ROUTES
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
