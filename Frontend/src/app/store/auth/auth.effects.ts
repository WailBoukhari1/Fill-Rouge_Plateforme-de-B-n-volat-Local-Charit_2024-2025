import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';
import { selectAccessToken } from './auth.selectors';
import { User } from '../../core/models/auth.models';
import { UserRole } from '../../core/models/auth.models';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      tap(() => console.log('Login action dispatched')),
      mergeMap(action =>
        this.authService.login({ email: action.email, password: action.password }).pipe(
          tap(response => {
            console.log('Login API response:', response);
            console.log('Email verification status from API:', response.data.emailVerified);
          }),
          map(response => {
            if (!response.data) {
              throw new Error('No data in response');
            }
            const decodedToken = this.authService.getDecodedToken();
            const role = decodedToken?.role?.replace('ROLE_', '') as UserRole;

            if (!role) {
              throw new Error('No role found in token');
            }

            const userData: User = {
              id: 0,
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: role,
              emailVerified: response.data.emailVerified,
              twoFactorEnabled: response.data.twoFactorEnabled,
              accountLocked: response.data.accountLocked,
              accountExpired: response.data.accountExpired,
              credentialsExpired: response.data.credentialsExpired,
              profilePicture: response.data.profilePicture,
              lastLoginIp: response.data.lastLoginIp,
              lastLoginAt: response.data.lastLoginAt
            };
            console.log('Constructed user data:', userData);
            console.log('Email verification status in constructed data:', userData.emailVerified);
            return AuthActions.loginSuccess({
              user: userData,
              token: response.data.token,
              refreshToken: response.data.refreshToken
            });
          }),
          catchError(error => {
            console.error('Login error:', error);
            return of(AuthActions.loginFailure({ error: error.message || 'Login failed' }));
          })
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(action => {
        // Create the register request object with all possible fields
        const registerRequest: any = {
          email: action.email,
          password: action.password,
          firstName: action.firstName,
          lastName: action.lastName,
          role: action.role
        };

        // Add organization fields if provided
        if (action.organizationName) {
          registerRequest.organizationName = action.organizationName;
          registerRequest.organizationWebsite = action.organizationWebsite;
          registerRequest.organizationDescription = action.organizationDescription;
        }

        // Add optional fields if provided
        if (action.phoneNumber) registerRequest.phoneNumber = action.phoneNumber;
        if (action.address) registerRequest.address = action.address;
        if (action.city) registerRequest.city = action.city;
        if (action.country) registerRequest.country = action.country;

        return this.authService.register(registerRequest).pipe(
          map(response => {
            if (!response.data) {
              throw new Error('No data in response');
            }
            const userData: User = {
              id: 0,
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: response.data.role as UserRole,
              emailVerified: response.data.emailVerified,
              twoFactorEnabled: response.data.twoFactorEnabled,
              accountLocked: response.data.accountLocked,
              accountExpired: response.data.accountExpired,
              credentialsExpired: response.data.credentialsExpired,
              profilePicture: response.data.profilePicture,
              lastLoginIp: response.data.lastLoginIp,
              lastLoginAt: response.data.lastLoginAt
            };
            // Immediately redirect to verify-email page after successful registration
            this.router.navigate(['/auth/verify-email'], {
              queryParams: { email: action.email }
            });
            return AuthActions.registerSuccess({
              user: userData,
              token: response.data.token,
              refreshToken: response.data.refreshToken
            });
          }),
          catchError(error => {
            console.error('Registration error:', error);
            return of(AuthActions.registerFailure({
              error: error.error?.message || error.message || 'Registration failed'
            }));
          })
        );
      })
    )
  );

  // Handle login success navigation
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, redirect = true }) => {
          console.log('Login success effect triggered, user:', user);
          console.log('Email verification status in success effect:', user.emailVerified);

          if (!user) {
            console.error('No user data in loginSuccess action');
            return;
          }

          if (!redirect) {
            console.log('Skipping redirect as this is a state restoration');
            return;
          }

          if (!user.emailVerified) {
            console.log('Email not verified, redirecting to verification');
            this.router.navigate(['/auth/verify-email'], {
              queryParams: { email: user.email }
            });
            return;
          }

          // Ensure we have a valid role before navigation
          if (!user.role) {
            console.error('User role is undefined');
            this.router.navigate(['/auth/login']);
            return;
          }

          console.log('Email verified, user role:', user.role);
          // Simplified navigation - all roles go to /dashboard
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  // Handle register success navigation
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user }) => {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: { email: user.email }
          });
        })
      ),
    { dispatch: false }
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      withLatestFrom(this.store.select(selectAccessToken)),
      mergeMap(([_, token]) => {
        if (!token) {
          return of(AuthActions.logout());
        }
        return this.authService.refreshToken(token).pipe(
          map(response => {
            if (!response.data) {
              throw new Error('No data in response');
            }
            const userData: User = {
              id: 0,
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: response.data.role as UserRole,
              emailVerified: response.data.emailVerified,
              twoFactorEnabled: response.data.twoFactorEnabled,
              accountLocked: response.data.accountLocked,
              accountExpired: response.data.accountExpired,
              credentialsExpired: response.data.credentialsExpired,
              profilePicture: response.data.profilePicture,
              lastLoginIp: response.data.lastLoginIp,
              lastLoginAt: response.data.lastLoginAt
            };
            return AuthActions.refreshTokenSuccess({
              user: userData,
              token: response.data.token,
              refreshToken: response.data.refreshToken
            });
          }),
          catchError(error => of(AuthActions.refreshTokenFailure({ error: error.error.message })))
        );
      })
    )
  );

  loadStoredUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadStoredUser),
      withLatestFrom(this.store.select(selectAccessToken)),
      mergeMap(([_, token]) => {
        const storedUser = localStorage.getItem('user');
        if (!token || !storedUser) {
          return of(AuthActions.loadStoredUserFailure({ error: 'No stored user found' }));
        }
        return of(AuthActions.loadStoredUserSuccess({ user: JSON.parse(storedUser) }));
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => of(AuthActions.logoutFailure({ error: error.error.message })))
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private store: Store,
    private router: Router
  ) {}
}
