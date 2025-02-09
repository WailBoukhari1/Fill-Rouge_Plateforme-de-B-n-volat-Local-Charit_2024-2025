import { Routes } from '@angular/router';

export const PUBLIC_EVENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',

        loadComponent: () => import('./components/event-list/event-list.component')
          .then(m => m.EventListComponent),
        title: 'Events'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/event-details/event-details.component')
          .then(m => m.EventDetailsComponent),
        title: 'Event Details'
      }
    ]
  }
];

export const DASHBOARD_EVENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/event-management/event-management.component')
          .then(m => m.EventManagementComponent),
        title: 'Manage Events'
      },
      {
        path: 'create',
        loadComponent: () => import('./components/event-form/event-form.component')
          .then(m => m.EventFormComponent),
        title: 'Create Event'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/event-form/event-form.component')
          .then(m => m.EventFormComponent),
        title: 'Edit Event'
      }
    ]
  }
]; 