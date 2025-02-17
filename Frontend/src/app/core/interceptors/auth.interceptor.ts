import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAccessToken } from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const store = inject(Store);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap(token => {
      if (token) {
        request = addToken(request, token);
      }
      return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return handle401Error(request, next, store);
          }
          return throwError(() => error);
        })
      );
    })
  );
};

const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

const handle401Error = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  store: Store
): Observable<HttpEvent<unknown>> => {
  store.dispatch(AuthActions.refreshToken());
  
  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap(newToken => {
      if (newToken) {
        return next(addToken(request, newToken));
      }
      store.dispatch(AuthActions.logout());
      return throwError(() => new Error('Session expired'));
    })
  );
}; 