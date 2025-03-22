import { Routes } from '@angular/router';
import { OrganizationProfileComponent } from './organization-profile/organization-profile.component';
import { EventResolver } from './organization-events/resolvers/event.resolver';
import { OrganizationReportComponent } from './organization-reports/organization-report.component';

export const organizationRoutes: Routes = [
  {
    path: 'profile',
    component: OrganizationProfileComponent,
  },
  {
    path: 'events',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './organization-events/organization-events/organization-events.component'
          ).then((m) => m.OrganizationEventsComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './organization-events/create-event/create-event.component'
          ).then((m) => m.CreateEventComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './organization-events/event-details/event-details.component'
          ).then((m) => m.EventDetailsComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./organization-events/edit-event/edit-event.component').then(
            (m) => m.EditEventComponent
          ),
        resolve: {
          event: EventResolver,
        },
      },
    ],
  },
  {
    path: 'volunteers',
    loadComponent: () =>
      import(
        './organization-volunteers/organization-volunteers.component'
      ).then((m) => m.OrganizationVolunteersComponent),
  },
  {
    path: 'reports',
    component: OrganizationReportComponent,
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
];
