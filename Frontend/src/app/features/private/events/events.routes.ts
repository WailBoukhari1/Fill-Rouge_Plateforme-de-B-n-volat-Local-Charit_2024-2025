import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id/participants',
        loadComponent: () =>
          import('./event-participants/event-participants.component').then(
            (m) => m.EventParticipantsComponent
          ),
      },
      {
        path: ':id/feedback',
        loadComponent: () =>
          import('./event-feedback/event-feedback.component').then(
            (m) => m.EventFeedbackComponent
          ),
      },
    ],
  },
];
