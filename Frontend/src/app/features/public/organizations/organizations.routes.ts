import { Routes } from '@angular/router';

export const ORGANIZATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./organization-list/organization-list.component').then(m => m.OrganizationListComponent),
    data: { title: 'Organizations - Local Charity', animation: 'organizationListPage' }
  },
  {
    path: ':id',
    loadComponent: () => import('./organization-detail/organization-detail.component').then(m => m.OrganizationDetailComponent),
    data: { title: 'Organization Details - Local Charity', animation: 'organizationDetailPage' }
  }
  // Temporarily commented out due to missing component
  /* {
    path: 'verification/:token',
    loadComponent: () => import('./organization-verification/organization-verification.component').then(m => m.OrganizationVerificationComponent),
    data: { title: 'Organization Verification - Local Charity', animation: 'verificationPage' }
  } */
]; 