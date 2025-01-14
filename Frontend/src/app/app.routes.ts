import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { TestComponent } from './components/test/test.component';

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
  }
];
