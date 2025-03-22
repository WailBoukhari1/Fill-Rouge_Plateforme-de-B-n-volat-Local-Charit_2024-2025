import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../../layouts/public-layout/public-layout.component';
import { AuthGuard } from '../../core/guards/auth.guard';

import { EVENTS_ROUTES } from './events/events.routes';
import { ORGANIZATIONS_ROUTES } from './organizations/organizations.routes';
import { AUTH_ROUTES } from './auth/auth.routes';
import { VOLUNTEER_ROUTES } from './volunteer/volunteer.routes';
import { LEGAL_ROUTES } from './legal/legal.routes';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
        data: { title: 'Home - Local Charity', animation: 'homePage' }
      },
      {
        path: 'events',
        children: EVENTS_ROUTES
      },
      {
        path: 'organizations',
        children: ORGANIZATIONS_ROUTES
      },
      {
        path: 'auth',
        children: AUTH_ROUTES
      },
      {
        path: 'volunteer',
        children: VOLUNTEER_ROUTES
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about.component').then(m => m.AboutComponent),
        data: { title: 'About Us - Local Charity', animation: 'aboutPage' }
      },
      {
        path: 'contact',
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
        data: { title: 'Contact Us - Local Charity', animation: 'contactPage' }
      },
      ...LEGAL_ROUTES
    ]
  }
]; 