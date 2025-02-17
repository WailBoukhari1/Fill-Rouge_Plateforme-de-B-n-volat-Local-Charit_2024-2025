import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { UnverifiedEmailGuard } from '../../core/guards/unverified-email.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
        title: 'Login',
        data: { layout: 'auth' }
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
        title: 'Register',
        data: { layout: 'auth' }
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        title: 'Verify Email',
        canActivate: [UnverifiedEmailGuard],
        data: { layout: 'auth' }
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password',
        data: { layout: 'auth' }
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password',
        data: { layout: 'auth' }
      },
      {
        path: '2fa',
        children: [
          {
            path: 'setup',
            loadComponent: () => import('./two-factor/two-factor.component').then(m => m.TwoFactorComponent),
            canActivate: [AuthGuard],
            title: 'Setup Two-Factor Authentication',
            data: { layout: 'auth', setup: true }
          },
          {
            path: 'verify',
            loadComponent: () => import('./two-factor/two-factor.component').then(m => m.TwoFactorComponent),
            title: 'Verify Two-Factor Authentication',
            data: { layout: 'auth', setup: false }
          }
        ]
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
        title: 'Unauthorized Access',
        data: { layout: 'auth' }
      }
    ]
  }
]; 