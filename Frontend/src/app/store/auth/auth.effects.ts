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
        this.authService.login({
          email: action.email,
          password: action.password,
          twoFactorCode: action.twoFactorCode
        }).pipe(
          tap(response => {
            console.log('Login API response:', response);
            console.log('Email verification status from API:', response.data.emailVerified);
          }),
          map(response => {
            if (!response.data) {
              throw new Error('No data in response');
            }

            // Check if two-factor authentication is required
            if (response.data.twoFactorEnabled && !action.twoFactorCode) {
              console.log('Two-factor authentication required but no code provided');
              return AuthActions.twoFactorRequired();
            }

            const decodedToken = this.authService.getDecodedToken();
            const role = decodedToken?.role?.replace('ROLE_', '') as UserRole;

            if (!role) {
              throw new Error('No role found in token');
            }

            const userData: User = {
              id: parseInt(response.data.userId) || 0,
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
              lastLoginAt: response.data.lastLoginAt,
              questionnaireCompleted: response.data.questionnaireCompleted
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

            // Extract the error message from the response
            let errorMessage = 'Login failed';

            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }

            // Check for specific error types
            if (errorMessage.includes('Bad credentials')) {
              errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.includes('locked')) {
              errorMessage = 'Your account is locked. Please contact support.';
            } else if (errorMessage.includes('disabled')) {
              errorMessage = 'Your account is disabled. Please verify your email.';
            } else if (errorMessage.includes('expired')) {
              errorMessage = 'Your session has expired. Please log in again.';
            }

            return of(AuthActions.loginFailure({ error: errorMessage }));
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
              lastLoginAt: response.data.lastLoginAt,
              questionnaireCompleted: response.data.questionnaireCompleted
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

            // Extract the error message from the response
            let errorMessage = 'Registration failed';

            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }

            // Check for specific error types
            if (errorMessage.includes('Email already exists')) {
              errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            } else if (errorMessage.includes('validation')) {
              errorMessage = 'Please check your information and try again.';
            } else if (errorMessage.includes('server')) {
              errorMessage = 'Server error. Please try again later.';
            }

            return of(AuthActions.registerFailure({ error: errorMessage }));
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
          console.log('User role:', user.role);
          console.log('Questionnaire completed:', user.questionnaireCompleted);

          if (!user) {
            console.error('No user data in loginSuccess action');
            return;
          }

          if (!redirect) {
            console.log('Skipping redirect as this is a state restoration');
            return;
          }

          // Check if account is locked
          if (user.accountLocked) {
            console.log('Account is locked, redirecting to unauthorized page');
            this.router.navigate(['/auth/unauthorized'], {
              queryParams: { reason: 'account_locked' }
            });
            return;
          }

          // Check if email is verified
          if (!user.emailVerified) {
            console.log('Email not verified, redirecting to verification');
            this.router.navigate(['/auth/verify-email'], {
              queryParams: { email: user.email }
            });
            return;
          }

          // Check if two-factor authentication is required
          if (user.twoFactorEnabled) {
            console.log('Two-factor authentication required');
            this.router.navigate(['/auth/2fa/verify']);
            return;
          }

          // Check if questionnaire needs to be completed
          if (!user.questionnaireCompleted) {
            console.log('Questionnaire not completed, redirecting to questionnaire');
            this.router.navigate(['/auth/questionnaire']);
            return;
          }

          // Ensure we have a valid role before navigation
          if (!user.role) {
            console.error('User role is undefined');
            this.router.navigate(['/auth/login']);
            return;
          }

          console.log('All checks passed, navigating based on role:', user.role);
          
          // Navigate based on role
          switch (user.role) {
            case UserRole.ADMIN:
              console.log('Navigating to admin dashboard');
              this.router.navigate(['/dashboard']);
              break;
            case UserRole.VOLUNTEER:
              console.log('Navigating to volunteer profile');
              this.router.navigate(['/dashboard/volunteer/profile']);
              break;
            case UserRole.ORGANIZATION:
              console.log('Navigating to organization dashboard');
              this.router.navigate(['/dashboard']);
              break;
            default:
              console.error('Unknown role:', user.role);
              this.router.navigate(['/dashboard']);
          }
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
          console.log('Registration successful, redirecting to email verification');
          // Always redirect to verify-email page after successful registration
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
              lastLoginAt: response.data.lastLoginAt,
              questionnaireCompleted: response.data.questionnaireCompleted
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

  // Handle two-factor required
  twoFactorRequired$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.twoFactorRequired),
        tap(() => {
          console.log('Two-factor authentication required');
          // Show the two-factor form in the login component
          // This is handled by the login component subscribing to the auth state
        })
      ),
    { dispatch: false }
  );

  // Handle questionnaire submission
  submitQuestionnaire$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.submitQuestionnaire),
      mergeMap(action => {
        return this.authService.submitQuestionnaire(action.formData).pipe(
          map(response => {
            if (!response.data) {
              throw new Error('No data in response');
            }

            return AuthActions.submitQuestionnaireSuccess({
              user: response.data
            });
          }),
          catchError(error => {
            console.error('Questionnaire submission error:', error);
            return of(AuthActions.submitQuestionnaireFailure({
              error: error.message || 'Failed to submit questionnaire'
            }));
          })
        );
      })
    )
  );

  // Handle questionnaire success
  submitQuestionnaireSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.submitQuestionnaireSuccess),
        tap(({ user }) => {
          console.log('Questionnaire submitted successfully, user:', user);

          // Ensure the user data is properly stored
          const updatedUser = {
            ...user,
            questionnaireCompleted: true
          };

          // Store the updated user data
          localStorage.setItem('user_data', JSON.stringify(updatedUser));

          // Navigate based on role
          switch (user.role) {
            case UserRole.ADMIN:
              this.router.navigate(['/dashboard']);
              break;
            case UserRole.VOLUNTEER:
              this.router.navigate(['/dashboard/volunteer/profile']);
              break;
            case UserRole.ORGANIZATION:
              this.router.navigate(['/dashboard']);
              break;
            default:
              console.error('Unknown role:', user.role);
              this.router.navigate(['/dashboard']);
          }
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
