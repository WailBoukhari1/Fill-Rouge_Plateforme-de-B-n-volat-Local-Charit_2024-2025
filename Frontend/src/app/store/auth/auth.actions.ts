import { createAction, props } from '@ngrx/store';
import { User } from '../../core/models/auth.models';
import { UserRole } from '../../core/models/auth.models';

// Login
export const login = createAction(
  '[Auth] Login',
  props<{
    email: string;
    password: string;
    twoFactorCode?: string;
  }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{
    user: User;
    token: string;
    refreshToken: string;
    redirect?: boolean;
  }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Two Factor
export const twoFactorRequired = createAction('[Auth] Two Factor Required');

// Register
export const register = createAction(
  '[Auth] Register',
  props<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationName?: string;
    organizationWebsite?: string;
    organizationDescription?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    country?: string;
  }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string; refreshToken: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

// Refresh Token
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ user: User; token: string; refreshToken: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

// Load Stored User
export const loadStoredUser = createAction('[Auth] Load Stored User');

export const loadStoredUserSuccess = createAction(
  '[Auth] Load Stored User Success',
  props<{ user: User | null }>()
);

export const loadStoredUserFailure = createAction(
  '[Auth] Load Stored User Failure',
  props<{ error: string }>()
);
