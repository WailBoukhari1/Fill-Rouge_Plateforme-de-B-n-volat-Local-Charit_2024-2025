import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'auth',
        loadChildren: () => import('./feature/auth/auth.routes').then(m => m.AUTH_ROUTES)
      },
      {
        path: 'events',
        loadChildren: () => import('./feature/event/event.routes').then(m => m.PUBLIC_EVENT_ROUTES)
      },
      {
        path: 'organizations',
        loadChildren: () => import('./feature/organization/organization.routes').then(m => m.PUBLIC_ORGANIZATION_ROUTES)
      },
      {
        path: 'volunteer',
        loadChildren: () => import('./feature/volunteer/volunteer.routes').then(m => m.PUBLIC_VOLUNTEER_ROUTES)
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
        loadChildren: () => import('./feature/event/event.routes').then(m => m.DASHBOARD_EVENT_ROUTES),
      },
      {
        path: 'organizations',
        canActivate: [() => roleGuard(['ADMIN', 'ORGANIZATION'])],
        loadChildren: () => import('./feature/organization/organization.routes').then(m => m.DASHBOARD_ORGANIZATION_ROUTES),
      },
      {
        path: 'volunteer',
        canActivate: [() => roleGuard(['VOLUNTEER'])],
        loadChildren: () => import('./feature/volunteer/volunteer.routes').then(m => m.DASHBOARD_VOLUNTEER_ROUTES),
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
