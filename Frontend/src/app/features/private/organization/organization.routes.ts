import { Routes } from '@angular/router';
import { OrganizationProfileCompletedGuard } from '../../../core/guards/organization-profile-completed.guard';
import { OrganizationProfileResolver } from './organization-profile/resolvers/organization-profile.resolver';
import { EventResolver } from './organization-events/resolvers/event.resolver';

export const organizationRoutes: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./organization-profile/organization-profile.component')
      .then(m => m.OrganizationProfileComponent),
    resolve: {
      profileData: OrganizationProfileResolver
    }
  },
  {
    path: 'events',
    canActivate: [OrganizationProfileCompletedGuard],
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
    canActivate: [OrganizationProfileCompletedGuard],
    loadComponent: () =>
      import(
        './organization-volunteers/organization-volunteers.component'
      ).then((m) => m.OrganizationVolunteersComponent),
  },
  {
    path: 'reports',
    canActivate: [OrganizationProfileCompletedGuard],
    loadComponent: () =>
      import('./organization-reports/organization-report.component')
        .then((m) => m.OrganizationReportComponent),
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
];
