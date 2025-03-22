import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  // Auth routes are defined elsewhere but keeping this file for structure
  {
    path: 'login',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/register',
    pathMatch: 'full'
  }
]; 