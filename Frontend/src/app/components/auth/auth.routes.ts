import { Routes } from '@angular/router';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'register',
    redirectTo: 'signup'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent
  }
]; 