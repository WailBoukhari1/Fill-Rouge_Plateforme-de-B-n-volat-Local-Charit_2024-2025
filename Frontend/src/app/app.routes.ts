import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { HomeComponent } from './pages/home/home.component';
import { OAuthCallbackComponent } from './features/auth/components/oauth-callback/oauth-callback.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/event.routes').then(m => m.PUBLIC_EVENT_ROUTES)
      },

      {
        path: 'organizations',
        loadChildren: () => import('./features/organizations/organization.routes').then(m => m.PUBLIC_ORGANIZATION_ROUTES)
      },

      {
        path: 'volunteer',
        loadChildren: () => import('./features/volunteers/volunteer.routes').then(m => m.PUBLIC_VOLUNTEER_ROUTES)
      },

      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'events',
        canActivate: [() => roleGuard(['ADMIN', 'ORGANIZATION'])],
        loadChildren: () => import('./features/events/event.routes').then(m => m.DASHBOARD_EVENT_ROUTES),
      },
      {
        path: 'organizations',
        canActivate: [() => roleGuard(['ADMIN', 'ORGANIZATION'])],
        loadChildren: () => import('./features/organizations/organization.routes').then(m => m.DASHBOARD_ORGANIZATION_ROUTES),
      },

      {
        path: 'volunteer',
        canActivate: [() => roleGuard(['VOLUNTEER'])],
        loadChildren: () => import('./features/volunteers/volunteer.routes').then(m => m.DASHBOARD_VOLUNTEER_ROUTES),
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'oauth2/callback/google',
    component: OAuthCallbackComponent
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
