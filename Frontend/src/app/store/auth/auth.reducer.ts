import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialState } from './auth.state';

export const authReducer = createReducer(
    initialState,

    // Login
    on(AuthActions.login, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.loginSuccess, (state, { user, token, refreshToken }): AuthState => ({
        ...state,
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
    })),
    on(AuthActions.loginFailure, (state, { error }): AuthState => {
        // Special handling for unverified email case
        if (error === 'Please verify your email before logging in') {
            return {
                ...state,
                loading: false,
                error,
                isAuthenticated: false,
                token: null,
                refreshToken: null,
                // Keep the existing user state
                user: state.user
            };
        }
        return {
            ...state,
            loading: false,
            error,
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false
        };
    }),

    // Register
    on(AuthActions.register, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.registerSuccess, (state, { user, token, refreshToken }): AuthState => ({
        ...state,
        user,
        token,
        refreshToken,
        isAuthenticated: false, // Don't authenticate until email is verified
        loading: false,
        error: null
    })),
    on(AuthActions.registerFailure, (state, { error }): AuthState => ({
        ...state,
        loading: false,
        error,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false
    })),

    // OAuth
    on(AuthActions.oAuthLogin, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.oAuthSuccess, (state, { user, token, refreshToken }): AuthState => ({
        ...state,
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
    })),
    on(AuthActions.oAuthFailure, (state, { error }): AuthState => ({
        ...state,
        loading: false,
        error
    })),

    // Token Refresh
    on(AuthActions.refreshToken, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.refreshTokenSuccess, (state, { token, refreshToken }): AuthState => ({
        ...state,
        token,
        refreshToken,
        loading: false,
        error: null
    })),
    on(AuthActions.refreshTokenFailure, (state, { error }): AuthState => ({
        ...state,
        loading: false,
        error
    })),

    // Email Verification
    on(AuthActions.verifyEmail, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.verifyEmailSuccess, (state): AuthState => ({
        ...state,
        user: state.user ? { ...state.user, emailVerified: true } : null,
        loading: false,
        error: null
    })),
    on(AuthActions.verifyEmailFailure, (state, { error }): AuthState => ({
        ...state,
        loading: false,
        error
    })),

    // Resend Verification Email
    on(AuthActions.resendVerificationEmail, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.resendVerificationEmailSuccess, (state): AuthState => ({
        ...state,
        loading: false,
        error: null
    })),
    on(AuthActions.resendVerificationEmailFailure, (state, { error }): AuthState => ({
        ...state,
        loading: false,
        error
    })),

    // Logout
    on(AuthActions.logout, (state): AuthState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.logoutSuccess, (): AuthState => ({
        ...initialState
    })),

    // Clear Error
    on(AuthActions.clearError, (state): AuthState => ({
        ...state,
        error: null
    }))
); 