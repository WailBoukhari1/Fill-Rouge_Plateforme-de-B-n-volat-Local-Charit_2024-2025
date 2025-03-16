import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./organization-profile/organization-profile.component').then(m => m.OrganizationProfileComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./organization-events/organization-events.component').then(m => m.OrganizationEventsComponent)
      },
      {
        path: 'volunteers',
        loadComponent: () => import('./organization-volunteers/organization-volunteers.component').then(m => m.OrganizationVolunteersComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./organization-reports/organization-reports.component').then(m => m.OrganizationReportsComponent)
      },
      
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
]; 