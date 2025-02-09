import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, tap, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { BackendAuthResponse } from '../../core/models/dto/auth.dto';
import { Store } from '@ngrx/store';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationService,
        private store: Store
    ) {}

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            exhaustMap(action =>
                this.authService.login(action.credentials).pipe(
                    map(response => {
                        if (!response.user.emailVerified) {
                            // Store the user state first
                            this.store.dispatch(AuthActions.loginSuccess({
                                user: {
                                    email: response.user.email,
                                    role: response.user.role,
                                    emailVerified: false
                                },
                                token: null,
                                refreshToken: null
                            }));
                            
                            // Then navigate and show warning
                            this.router.navigate(['/auth/verify-email']);
                            this.notificationService.warning('Please verify your email before logging in');
                            
                            // Finally, throw the error
                            throw new Error('Please verify your email before logging in');
                        }
                        return AuthActions.loginSuccess(response);
                    }),
                    catchError(error => {
                        if (error.message === 'Please verify your email before logging in') {
                            return of(AuthActions.loginFailure({ error: error.message }));
                        }
                        this.notificationService.error(error.message);
                        return of(AuthActions.loginFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap(response => {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('refresh_token', response.refreshToken!);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.router.navigate(['/']);
                    this.notificationService.success('Logged in successfully');
                }
            })
        ),
        { dispatch: false }
    );

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            exhaustMap(action =>
                this.authService.register(action.userData).pipe(
                    map(response => AuthActions.registerSuccess(response)),
                    catchError(error => of(AuthActions.registerFailure({ error: error.message })))
                )
            )
        )
    );

    registerSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.registerSuccess),
            tap(() => {
                this.notificationService.success('Registration successful! Please check your email to verify your account.');
            })
        ),
        { dispatch: false }
    );

    verifyEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.verifyEmail),
            exhaustMap(action =>
                this.authService.verifyEmail(action.email, action.code).pipe(
                    map(() => AuthActions.verifyEmailSuccess()),
                    catchError(error => of(AuthActions.verifyEmailFailure({ error: error.message })))
                )
            )
        )
    );

    verifyEmailSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.verifyEmailSuccess),
            tap(() => {
                this.router.navigate(['/auth/login']);
                this.notificationService.success('Email verified successfully! You can now login.');
            })
        ),
        { dispatch: false }
    );

    resendVerificationEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resendVerificationEmail),
            exhaustMap(action =>
                this.authService.resendVerificationEmail(action.email).pipe(
                    map(() => AuthActions.resendVerificationEmailSuccess()),
                    catchError(error => of(AuthActions.resendVerificationEmailFailure({ error: error.message })))
                )
            )
        )
    );

    resendVerificationEmailSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resendVerificationEmailSuccess),
            tap(() => {
                this.notificationService.success('Verification email sent! Please check your inbox.');
            })
        ),
        { dispatch: false }
    );

    forgotPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.forgotPassword),
            exhaustMap(action =>
                this.authService.forgotPassword(action.email).pipe(
                    map(() => AuthActions.forgotPasswordSuccess()),
                    catchError(error => of(AuthActions.forgotPasswordFailure({ error: error.message })))
                )
            )
        )
    );

    forgotPasswordSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.forgotPasswordSuccess),
            tap(() => {
                this.notificationService.success('Password reset instructions sent to your email.');
            })
        ),
        { dispatch: false }
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPassword),
            exhaustMap(action =>
                this.authService.resetPassword(action.token, action.password).pipe(
                    map(() => AuthActions.resetPasswordSuccess()),
                    catchError(error => of(AuthActions.resetPasswordFailure({ error: error.message })))
                )
            )
        )
    );

    resetPasswordSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordSuccess),
            tap(() => {
                this.router.navigate(['/auth/login']);
                this.notificationService.success('Password reset successfully! You can now login with your new password.');
            })
        ),
        { dispatch: false }
    );

    oAuthLogin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.oAuthLogin),
            tap(action => {
                this.authService.initiateOAuthLogin(action.provider);
            })
        ),
        { dispatch: false }
    );

    oAuthCallback$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.oAuthCallback),
            exhaustMap(action =>
                this.authService.handleOAuthCallback(action.code, action.provider).pipe(
                    map(response => AuthActions.oAuthSuccess(response)),
                    catchError(error => of(AuthActions.oAuthFailure({ error: error.message })))
                )
            )
        )
    );

    oAuthSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.oAuthSuccess),
            tap(() => {
                this.router.navigate(['/']);
                this.notificationService.success('Logged in successfully with OAuth');
            })
        ),
        { dispatch: false }
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            tap(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                this.router.navigate(['/auth/login']);
                this.notificationService.success('Logged out successfully');
            }),
            map(() => AuthActions.logoutSuccess())
        )
    );
} 