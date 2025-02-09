import { Routes } from '@angular/router';

export const PUBLIC_ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/organization-list/organization-list.component')
          .then(m => m.OrganizationListComponent),
        title: 'Organizations'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/organization-details/organization-details.component')
          .then(m => m.OrganizationDetailsComponent),
        title: 'Organization Details'
      }
    ]
  }
];

export const DASHBOARD_ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./components/organization-management/organization-list.component')
          .then(m => m.OrganizationListComponent),
        title: 'All Organizations'
      },
      {
        path: 'verification',
        loadComponent: () => import('./components/organization-management/verification-requests.component')
          .then(m => m.VerificationRequestsComponent),
        title: 'Pending Verification'
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/organization-profile/organization-profile.component')
          .then(m => m.OrganizationProfileComponent),
        title: 'Organization Profile'
      }
    ]
  }
]; 