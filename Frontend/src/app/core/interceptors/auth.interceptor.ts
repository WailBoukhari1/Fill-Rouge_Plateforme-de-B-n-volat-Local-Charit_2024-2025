import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Skip auth headers for public endpoints
  if (request.url.includes('/auth/login') || request.url.includes('/auth/register') || request.url.includes('/public/')) {
    return next(request);
  }

  const token = authService.getToken();
  const userId = authService.getCurrentUserId();
  const userRole = authService.getUserRole();

  if (!token || !userId || !userRole) {
    if (!request.url.includes('/auth/')) {
      router.navigate(['/auth/login']);
      snackBar.open('Please log in to continue', 'Close', { duration: 5000 });
    }
    return throwError(() => new Error('Authentication required'));
  }

  const headers: { [key: string]: string } = {
    'Authorization': `Bearer ${token}`,
    'X-User-ID': userId
  };

  if (userRole.includes('ORGANIZATION')) {
    const orgId = localStorage.getItem('organizationId');
    if (orgId) headers['X-Organization-ID'] = orgId;
  } else if (userRole.includes('VOLUNTEER')) {
    const volunteerId = localStorage.getItem('volunteerId');
    if (volunteerId) headers['X-Volunteer-ID'] = volunteerId;
  }

  const modifiedRequest = request.clone({
    setHeaders: headers
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        snackBar.open('Access denied', 'Close', { duration: 5000 });
      }
      return throwError(() => error);
    })
  );
};
