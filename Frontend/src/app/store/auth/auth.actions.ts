import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from './auth.state';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string | null;
    refreshToken: string | null;
}

export const AuthActions = createActionGroup({
    source: 'Auth',
    events: {
        // Login
        'Login': props<{ credentials: LoginRequest }>(),
        'Login Success': props<AuthResponse>(),
        'Login Failure': props<{ error: string }>(),

        // Register
        'Register': props<{ userData: RegisterRequest }>(),
        'Register Success': props<AuthResponse>(),
        'Register Failure': props<{ error: string }>(),

        // OAuth
        'OAuth Login': props<{ provider: string }>(),
        'OAuth Callback': props<{ code: string; provider: string }>(),
        'OAuth Success': props<AuthResponse>(),
        'OAuth Failure': props<{ error: string }>(),

        // Token Management
        'Refresh Token': props<{ refreshToken: string }>(),
        'Refresh Token Success': props<{ token: string | null; refreshToken: string | null }>(),
        'Refresh Token Failure': props<{ error: string }>(),

        // Email Verification
        'Verify Email': props<{ email: string; code: string }>(),
        'Verify Email Success': emptyProps(),
        'Verify Email Failure': props<{ error: string }>(),
        'Resend Verification Email': props<{ email: string }>(),
        'Resend Verification Email Success': emptyProps(),
        'Resend Verification Email Failure': props<{ error: string }>(),

        // Password Reset
        'Forgot Password': props<{ email: string }>(),
        'Forgot Password Success': emptyProps(),
        'Forgot Password Failure': props<{ error: string }>(),
        'Reset Password': props<{ token: string; password: string }>(),
        'Reset Password Success': emptyProps(),
        'Reset Password Failure': props<{ error: string }>(),

        // Logout
        'Logout': emptyProps(),
        'Logout Success': emptyProps(),

        // Clear Error
        'Clear Error': emptyProps(),
    }
}); 