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
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./components/event-management/event-management.component')
          .then(m => m.EventManagementComponent),
        title: 'All Events'
      },
      {
        path: 'pending',
        loadComponent: () => import('./components/pending-events/pending-events.component')
          .then(m => m.PendingEventsComponent),
        title: 'Pending Events'
      },
      {
        path: 'past',
        loadComponent: () => import('./components/past-events/past-events.component')
          .then(m => m.PastEventsComponent),
        title: 'Past Events'
      },
      {
        path: 'drafts',
        loadComponent: () => import('./components/draft-events/draft-events.component')
          .then(m => m.DraftEventsComponent),
        title: 'Draft Events'
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
      },
      {
        path: 'search',
        loadComponent: () => import('./components/event-search/event-search.component')
          .then(m => m.EventSearchComponent),
        title: 'Find Events'
      }
    ]
  }
]; 