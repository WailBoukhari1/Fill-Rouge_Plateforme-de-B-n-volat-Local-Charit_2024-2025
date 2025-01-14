import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { TestComponent } from './components/test/test.component';
import { OAuth2RedirectComponent } from './components/auth/oauth2/oauth2-redirect.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      // ... other auth routes
    ]
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'oauth2/redirect',
    component: OAuth2RedirectComponent
  }
];
