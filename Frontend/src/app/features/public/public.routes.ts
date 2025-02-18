import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../../layouts/public-layout/public-layout.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./events/event-list/event-list.component').then(m => m.EventListComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./events/event-detail/event-detail.component').then(m => m.EventDetailComponent)
      },
      {
        path: 'organizations',
        loadComponent: () => import('./organizations/organization-list/organization-list.component').then(m => m.OrganizationListComponent)
      },
      {
        path: 'organizations/:id',
        loadComponent: () => import('./organizations/organization-detail/organization-detail.component').then(m => m.OrganizationDetailComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  }
]; 