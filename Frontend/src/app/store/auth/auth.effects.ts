import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, tap, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthResponse, UserRole } from '../../core/models/auth.model';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationService
    ) {}

    initializeAuth$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.initializeAuth),
            map(() => {
                const token = this.authService.getStoredToken();
                if (token) {
                    return AuthActions.refreshToken();
                }
                return AuthActions.logout();
            })
        )
    );

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            exhaustMap(action =>
                this.authService.login(action.credentials).pipe(
                    map(response => AuthActions.loginSuccess(this.mapAuthResponse(response))),
                    catchError(error => of(AuthActions.loginFailure({ error })))
                )
            )
        )
    );

    loginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loginSuccess),
                tap(() => {
                    this.router.navigate(['/']);
                    this.notificationService.success('Logged in successfully');
                })
            ),
        { dispatch: false }
    );

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            exhaustMap(action =>
                this.authService.register(action.credentials).pipe(
                    map(response => AuthActions.registerSuccess(this.mapAuthResponse(response))),
                    catchError(error => of(AuthActions.registerFailure({ error })))
                )
            )
        )
    );

    registerSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.registerSuccess),
                tap(() => {
                    this.router.navigate(['/auth/verify-email']);
                    this.notificationService.success('Registration successful! Please check your email to verify your account.');
                })
            ),
        { dispatch: false }
    );

    verifyEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.verifyEmail),
            exhaustMap(action =>
                this.authService.verifyEmail({ email: action.email, code: action.code }).pipe(
                    map(() => AuthActions.verifyEmailSuccess()),
                    catchError(error => of(AuthActions.verifyEmailFailure({ error })))
                )
            )
        )
    );

    verifyEmailSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.verifyEmailSuccess),
                tap(() => {
                    this.router.navigate(['/auth/login']);
                    this.notificationService.success('Email verified successfully! You can now login.');
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
                    catchError(error => of(AuthActions.forgotPasswordFailure({ error })))
                )
            )
        )
    );

    forgotPasswordSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.forgotPasswordSuccess),
                tap(() => {
                    this.notificationService.success('Password reset instructions have been sent to your email.');
                })
            ),
        { dispatch: false }
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPassword),
            exhaustMap(action =>
                this.authService.resetPassword({
                    email: '',
                    code: action.token,
                    newPassword: action.password
                }).pipe(
                    map(() => AuthActions.resetPasswordSuccess()),
                    catchError(error => of(AuthActions.resetPasswordFailure({ error })))
                )
            )
        )
    );

    resetPasswordSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.resetPasswordSuccess),
                tap(() => {
                    this.router.navigate(['/auth/login']);
                    this.notificationService.success('Password reset successfully! You can now login with your new password.');
                })
            ),
        { dispatch: false }
    );

    oAuth$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.oAuthLogin),
            exhaustMap(action =>
                this.authService.handleOAuthCallback(action.code, action.provider).pipe(
                    map(response => AuthActions.oAuthSuccess(this.mapAuthResponse(response))),
                    catchError(error => of(AuthActions.oAuthFailure({ error })))
                )
            )
        )
    );

    oAuthSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.oAuthSuccess),
                tap(() => {
                    this.router.navigate(['/']);
                    this.notificationService.success('Logged in successfully with OAuth');
                })
            ),
        { dispatch: false }
    );

    refreshToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.refreshToken),
            exhaustMap(() => {
                const token = this.authService.getStoredToken();
                if (!token) {
                    return of(AuthActions.logout());
                }
                return this.authService.refreshToken(token.refreshToken).pipe(
                    map(newToken => AuthActions.refreshTokenSuccess({ token: newToken })),
                    catchError(() => of(AuthActions.logout()))
                );
            })
        )
    );

    logout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logout),
                tap(() => {
                    this.router.navigate(['/auth/login']);
                })
            ),
        { dispatch: false }
    );

    private mapAuthResponse(response: AuthResponse): AuthResponse {
        return {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: {
                ...response.user,
                roles: response.user.roles.map(role => role as UserRole)
            }
        };
    }
} 