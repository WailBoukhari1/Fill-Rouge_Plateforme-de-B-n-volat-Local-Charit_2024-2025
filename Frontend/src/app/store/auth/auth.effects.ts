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

            // Check if email is not verified
            if (!response.data.emailVerified) {
              console.log('Email not verified, redirecting to verification page');
              this.router.navigate(['/auth/verify-email'], {
                queryParams: { email: response.data.email }
              });
              return AuthActions.loginFailure({ 
                error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
              });
            }

            // Check if two-factor authentication is required
            if (response.data.twoFactorEnabled && !action.twoFactorCode) {
              console.log('Two-factor authentication required but no code provided');
              return AuthActions.twoFactorRequired();
            }

            // If no tokens in response, treat as unverified user
            if (!response.data.token || !response.data.refreshToken) {
              console.log('No tokens in response, treating as unverified user');
              return AuthActions.loginFailure({ 
                error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
              });
            }

            const decodedToken = this.authService.getDecodedToken();
            if (!decodedToken) {
              throw new Error('Invalid or missing token');
            }

            const role = decodedToken.role?.replace('ROLE_', '') as UserRole || UserRole.UNASSIGNED;

            const userData: User = {
              id: response.data.userId || '',
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: role,
              roles: [role],
              emailVerified: response.data.emailVerified || false,
              twoFactorEnabled: response.data.twoFactorEnabled || false,
              accountLocked: response.data.accountLocked || false,
              accountExpired: response.data.accountExpired || false,
              credentialsExpired: response.data.credentialsExpired || false,
              profilePicture: response.data.profilePicture,
              lastLoginIp: response.data.lastLoginIp,
              lastLoginAt: response.data.lastLoginAt,
              questionnaireCompleted: response.data.questionnaireCompleted || false
            };

            return AuthActions.loginSuccess({
              user: userData,
              token: response.data.token,
              refreshToken: response.data.refreshToken
            });
          }),
          catchError(error => {
            console.error('Login error:', error);
            let errorMessage = 'Login failed';

            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            // Check for specific error types
            if (errorMessage.includes('Bad credentials')) {
              errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.includes('locked') && errorMessage.includes('verify your email')) {
              // Handle unverified email case
              this.router.navigate(['/auth/verify-email'], {
                queryParams: { email: action.email }
              });
              errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
            } else if (errorMessage.includes('locked')) {
              errorMessage = 'Your account is locked. Please contact support.';
            } else if (errorMessage.includes('disabled')) {
              errorMessage = 'Your account is disabled. Please verify your email.';
            } else if (errorMessage.includes('expired')) {
              errorMessage = 'Your session has expired. Please log in again.';
            } else if (errorMessage.includes('verify your email')) {
              // Keep the original message for email verification
              this.router.navigate(['/auth/verify-email'], {
                queryParams: { email: action.email }
              });
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
        const registerRequest = {
          email: action.email,
          password: action.password,
          confirmPassword: action.confirmPassword,
          firstName: action.firstName,
          lastName: action.lastName,
          role: UserRole.UNASSIGNED
        };

        return this.authService.register(registerRequest).pipe(
          map(response => {
            if (!response.data) {
              throw new Error('No data in response');
            }

            const userData: User = {
              id: response.data.userId || '',
              email: response.data.email || action.email,
              firstName: response.data.firstName || action.firstName,
              lastName: response.data.lastName || action.lastName,
              role: UserRole.UNASSIGNED,
              roles: [UserRole.UNASSIGNED],
              emailVerified: response.data.emailVerified || false,
              twoFactorEnabled: response.data.twoFactorEnabled || false,
              accountLocked: response.data.accountLocked || false,
              accountExpired: response.data.accountExpired || false,
              credentialsExpired: response.data.credentialsExpired || false,
              profilePicture: response.data.profilePicture,
              lastLoginIp: response.data.lastLoginIp,
              lastLoginAt: response.data.lastLoginAt,
              questionnaireCompleted: false,
              phoneNumber: ''
            };

            return AuthActions.registerSuccess({
              user: userData,
              token: response.data.token,
              refreshToken: response.data.refreshToken
            });
          }),
          catchError(error => {
            console.error('Registration error:', error);

            let errorMessage = 'Registration failed';

            if (error.error && error.error.details) {
              // Handle validation error details
              const details = error.error.details;
              const errorMessages = Object.entries(details)
                .map(([field, message]) => `${message}`)
                .join(', ');
              errorMessage = errorMessages;
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
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
          if (!user.questionnaireCompleted && user.role === UserRole.UNASSIGNED) {
            console.log('User has UNASSIGNED role, redirecting to questionnaire');
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
              this.router.navigate(['/dashboard']);
              break;
            case UserRole.ORGANIZATION:
              console.log('Navigating to organization dashboard');
              this.router.navigate(['/dashboard']);
              break;
            case UserRole.UNASSIGNED:
              console.log('Navigating to questionnaire for unassigned role');
              this.router.navigate(['/auth/questionnaire']);
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
              id: response.data.userId || '',
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: response.data.role as UserRole,
              roles: [response.data.role as UserRole],
              emailVerified: response.data.emailVerified || false,
              twoFactorEnabled: response.data.twoFactorEnabled || false,
              accountLocked: response.data.accountLocked || false,
              accountExpired: response.data.accountExpired || false,
              credentialsExpired: response.data.credentialsExpired || false,
              profilePicture: response.data.profilePicture,
              lastLoginIp: response.data.lastLoginIp,
              lastLoginAt: response.data.lastLoginAt,
              questionnaireCompleted: response.data.questionnaireCompleted || false
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

            const userRole = response.data.roles?.[0]?.replace('ROLE_', '');
            if (!userRole) {
              throw new Error('No role found in response');
            }

            const userData: User = {
              ...response.data,
              id: response.data.userId || '',
              role: userRole as UserRole,
              roles: [userRole as UserRole],
              emailVerified: response.data.emailVerified || false,
              twoFactorEnabled: response.data.twoFactorEnabled || false,
              accountLocked: response.data.accountLocked || false,
              accountExpired: response.data.accountExpired || false,
              credentialsExpired: response.data.credentialsExpired || false,
              questionnaireCompleted: true
            };

            return AuthActions.submitQuestionnaireSuccess({ user: userData });
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

          if (!user.role) {
            console.error('Invalid role after questionnaire:', user.role);
            return;
          }

          // Store the updated user data
          localStorage.setItem('user_data', JSON.stringify(user));

          // Navigate based on role
          switch (user.role) {
            case UserRole.VOLUNTEER:
              console.log('Navigating to volunteer dashboard');
              this.router.navigate(['/volunteer']);
              break;
            case UserRole.ORGANIZATION:
              console.log('Navigating to organization dashboard');
              this.router.navigate(['/organization']);
              break;
            default:
              console.error('Unknown role:', user.role);
              this.router.navigate(['/home']);
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
