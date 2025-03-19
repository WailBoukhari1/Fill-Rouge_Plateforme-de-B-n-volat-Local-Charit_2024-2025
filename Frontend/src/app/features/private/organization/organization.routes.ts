import { Routes } from '@angular/router';
import { OrganizationProfileComponent } from './organization-profile/organization-profile.component';

export const organizationRoutes: Routes = [
  {
    path: 'profile',
    component: OrganizationProfileComponent
  },
  {
    path: 'events',
    children: [
      {
        path: '',
        loadComponent: () => import('./organization-events/organization-events/organization-events.component')
          .then(m => m.OrganizationEventsComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./organization-events/create-event/create-event.component')
          .then(m => m.CreateEventComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./organization-events/edit-event/edit-event.component')
          .then(m => m.EditEventComponent)
      }
    ]
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
]; 