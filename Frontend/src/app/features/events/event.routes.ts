import { Routes } from '@angular/router';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventListComponent } from './components/event-list/event-list.component';

// Public routes
export const PUBLIC_EVENT_ROUTES: Routes = [
  {
    path: 'list',
    component: EventListComponent
  },
  {
    path: ':id',
    component: EventDetailsComponent
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

// Dashboard routes
export const DASHBOARD_EVENT_ROUTES: Routes = [
  {
    path: 'create',
    component: EventFormComponent
  },
  {
    path: ':id/edit',
    component: EventFormComponent
  },
  {
    path: ':id',
    component: EventDetailsComponent
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
]; 