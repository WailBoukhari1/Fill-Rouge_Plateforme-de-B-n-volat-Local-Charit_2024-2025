import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, switchMap, take, throwError, Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import * as AuthActions from '../../store/auth/auth.actions';
import { JwtToken } from '../models/auth.model';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<JwtToken | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const store = inject(Store);

  // Skip if it's a refresh token request or non-auth endpoint
  if (req.url.includes('refresh-token') || !req.url.includes(environment.apiUrl)) {
    return next(req);
  }

  const token = authService.getStoredToken();
  if (token) {
    req = addTokenHeaders(req, token);
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handleUnauthorizedError(req, next, authService, store);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeaders(request: any, token: JwtToken) {
  return request.clone({
    headers: request.headers
      .set('Authorization', `Bearer ${token.accessToken}`)
      .set('Refresh-Token', token.refreshToken)
  });
}

function handleUnauthorizedError(
  request: any,
  next: any,
  authService: AuthService,
  store: Store
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const token = authService.getStoredToken();
    if (token?.refreshToken) {
      return authService.refreshToken(token.refreshToken).pipe(
        switchMap((newToken) => {
          isRefreshing = false;
          refreshTokenSubject.next(newToken);
          return next(addTokenHeaders(request, newToken));
        }),
        catchError((error) => {
          isRefreshing = false;
          store.dispatch(AuthActions.logout());
          return throwError(() => error);
        })
      );
    }
  }

  return refreshTokenSubject.pipe(
    take(1),
    switchMap(token => {
      if (token) {
        return next(addTokenHeaders(request, token));
      }
      return throwError(() => new Error('No refresh token available'));
    })
  );
} 