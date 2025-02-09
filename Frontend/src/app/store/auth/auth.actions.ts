import { createAction, props } from '@ngrx/store';
import { AuthUser, LoginCredentials, RegisterCredentials, JwtToken, AuthResponse } from '../../core/models/auth.model';

// Login actions
export const login = createAction(
    '[Auth] Login',
    props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<AuthResponse>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: string }>()
);

// Register actions
export const register = createAction(
    '[Auth] Register',
    props<{ credentials: RegisterCredentials }>()
);

export const registerSuccess = createAction(
    '[Auth] Register Success',
    props<AuthResponse>()
);

export const registerFailure = createAction(
    '[Auth] Register Failure',
    props<{ error: string }>()
);

// Token refresh actions
export const refreshToken = createAction(
    '[Auth] Refresh Token'
);

export const refreshTokenSuccess = createAction(
    '[Auth] Refresh Token Success',
    props<{ token: JwtToken }>()
);

export const refreshTokenFailure = createAction(
    '[Auth] Refresh Token Failure',
    props<{ error: string }>()
);

// OAuth actions
export const oAuthLogin = createAction(
    '[Auth] OAuth Login',
    props<{ provider: string; code: string }>()
);

export const oAuthSuccess = createAction(
    '[Auth] OAuth Success',
    props<AuthResponse>()
);

export const oAuthFailure = createAction(
    '[Auth] OAuth Failure',
    props<{ error: string }>()
);

// Email verification actions
export const verifyEmail = createAction(
    '[Auth] Verify Email',
    props<{ email: string; code: string }>()
);

export const verifyEmailSuccess = createAction(
    '[Auth] Verify Email Success'
);

export const verifyEmailFailure = createAction(
    '[Auth] Verify Email Failure',
    props<{ error: string }>()
);

export const resendVerificationEmail = createAction(
    '[Auth] Resend Verification Email',
    props<{ email: string }>()
);

export const resendVerificationEmailSuccess = createAction(
    '[Auth] Resend Verification Email Success'
);

export const resendVerificationEmailFailure = createAction(
    '[Auth] Resend Verification Email Failure',
    props<{ error: string }>()
);

// Password reset actions
export const forgotPassword = createAction(
    '[Auth] Forgot Password',
    props<{ email: string }>()
);

export const forgotPasswordSuccess = createAction(
    '[Auth] Forgot Password Success'
);

export const forgotPasswordFailure = createAction(
    '[Auth] Forgot Password Failure',
    props<{ error: string }>()
);

export const resetPassword = createAction(
    '[Auth] Reset Password',
    props<{ token: string; password: string }>()
);

export const resetPasswordSuccess = createAction(
    '[Auth] Reset Password Success'
);

export const resetPasswordFailure = createAction(
    '[Auth] Reset Password Failure',
    props<{ error: string }>()
);

// Session actions
export const logout = createAction('[Auth] Logout');
export const clearAuthError = createAction('[Auth] Clear Error');
export const initializeAuth = createAction('[Auth] Initialize'); 