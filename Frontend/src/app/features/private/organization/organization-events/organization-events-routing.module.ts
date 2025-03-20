import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventResolver } from './resolvers/event.resolver';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./organization-events/organization-events.component').then(m => m.OrganizationEventsComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./create-event/create-event.component').then(m => m.CreateEventComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit-event/edit-event.component').then(m => m.EditEventComponent),
    resolve: {
      event: EventResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationEventsRoutingModule { } 