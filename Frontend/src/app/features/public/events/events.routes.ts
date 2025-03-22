import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./event-list/event-list.component').then(m => m.EventListComponent),
    data: { title: 'Events - Local Charity', animation: 'eventListPage' }
  },
  {
    path: ':id',
    loadComponent: () => import('./event-detail/event-detail.component').then(m => m.EventDetailComponent),
    data: { title: 'Event Details - Local Charity', animation: 'eventDetailPage' }
  },
  {
    path: ':id/register',
    loadComponent: () => import('./event-registration/event-registration.component').then(m => m.EventRegistrationComponent),
    data: { title: 'Register for Event - Local Charity', animation: 'eventRegistrationPage' }
  }
]; 