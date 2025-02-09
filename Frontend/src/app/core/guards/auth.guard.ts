import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, switchMap, catchError } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import * as AuthActions from '../../store/auth/auth.actions';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        return of(router.createUrlTree(['/auth/login']));
      }

      const token = authService.getStoredToken();
      
      // If no token, redirect to login
      if (!token) {
        store.dispatch(AuthActions.logout());
        return of(router.createUrlTree(['/auth/login']));
      }

      // If token is expired but refresh token exists, try to refresh
      if (authService.isTokenExpired() && token.refreshToken) {
        return authService.refreshToken(token.refreshToken).pipe(
          map(() => true),
          catchError(() => {
            store.dispatch(AuthActions.logout());
            return of(router.createUrlTree(['/auth/login']));
          })
        );
      }

      // If token is valid, allow access
      if (!authService.isTokenExpired()) {
        return of(true);
      }

      // If token is expired and no refresh token, redirect to login
      store.dispatch(AuthActions.logout());
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated && !authService.isTokenExpired()) {
        return router.createUrlTree(['/']);
      }
      return true;
    })
  );
}; 