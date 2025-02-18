import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./event-management/event-management.component').then(m => m.EventManagementComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: ':id/participants',
        loadComponent: () => import('./event-participants/event-participants.component').then(m => m.EventParticipantsComponent)
      },
      {
        path: ':id/feedback',
        loadComponent: () => import('./event-feedback/event-feedback.component').then(m => m.EventFeedbackComponent)
      }
    ]
  }
]; 