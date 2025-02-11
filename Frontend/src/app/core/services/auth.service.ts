import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { tap, catchError, map, filter, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  AuthUser,
  JwtToken,
  PasswordResetRequest,
  EmailVerificationRequest,
  UserRole
} from '../models/auth.model';
import * as AuthActions from '../../store/auth/auth.actions';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthServerResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles: string[];
      emailVerified: boolean;
      profilePicture?: string;
    };
  };
  timestamp: string;
}

interface UserResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    emailVerified: boolean;
    profilePicture?: string;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'auth_token_expiry';
  private readonly REFRESH_THRESHOLD = 60000; // 1 minute
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  user$ = this.userSubject.asObservable();

  private tokenExpirySubject = new BehaviorSubject<number>(0);
  tokenExpiry$ = this.tokenExpirySubject.asObservable();

  private tokenRefreshNeeded = new BehaviorSubject<boolean>(false);
  tokenRefreshNeeded$ = this.tokenRefreshNeeded.asObservable();

  private userLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store
  ) {
    this.initializeAuthState();
    this.initializeTokenMonitoring();
  }

  // Initialize auth state from local storage
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser;
        const authResponse: AuthResponse = {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          user
        };
        this.store.dispatch(AuthActions.loginSuccess(authResponse));
        this.isAuthenticatedSubject.next(true);
        this.userSubject.next(user);
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  // Token monitoring and auto-refresh
  private initializeTokenMonitoring(): void {
    timer(0, 60000).subscribe(() => {
      const remainingTime = this.getRemainingTime();
      this.tokenExpirySubject.next(remainingTime);

      if (remainingTime > 0 && remainingTime <= this.REFRESH_THRESHOLD) {
        this.tokenRefreshNeeded.next(true);
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          this.refreshToken(refreshToken).subscribe();
        }
      }
    });
  }

  // Token Management Methods
  getStoredToken(): JwtToken | null {
    try {
      const accessToken = localStorage.getItem(this.TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

      if (!accessToken || !refreshToken || !expiryStr) {
        return null;
      }

      const expiresIn = parseInt(expiryStr, 10) - Date.now();
      if (expiresIn <= 0) {
        this.clearAuthData();
        return null;
      }

      return { accessToken, refreshToken, expiresIn };
    } catch (error) {
      console.error('Error retrieving token:', error);
      this.clearAuthData();
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setToken(token: JwtToken): void {
    try {
      if (!token.accessToken || !token.refreshToken) {
        throw new Error('Invalid token data');
      }

      localStorage.setItem(this.TOKEN_KEY, token.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token.refreshToken);
      localStorage.setItem(
        this.TOKEN_EXPIRY_KEY,
        (Date.now() + token.expiresIn * 1000).toString()
      );

      this.tokenRefreshNeeded.next(false);
      this.tokenExpirySubject.next(token.expiresIn * 1000);
    } catch (error) {
      console.error('Error setting token:', error);
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem('user');
    this.tokenExpirySubject.next(0);
    this.tokenRefreshNeeded.next(false);
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
  }

  isTokenExpired(): boolean {
    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiry) return true;
      return Date.now() > parseInt(expiry, 10);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  private getRemainingTime(): number {
    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiry) return 0;
      return Math.max(0, parseInt(expiry, 10) - Date.now());
    } catch (error) {
      console.error('Error getting remaining time:', error);
      return 0;
    }
  }

  getTokenExpiryTime(): Observable<string> {
    return this.tokenExpiry$.pipe(
      map(remainingMs => {
        if (remainingMs <= 0) return 'Expired';
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
      })
    );
  }

  // Auth API Methods
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthServerResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => console.log('Raw server response:', response)),
      map(response => this.mapServerResponse(response)),
      tap(response => {
        this.setToken({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: 3600
        });
        this.userSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthServerResponse>(`${this.apiUrl}/register`, credentials).pipe(
      map(response => this.mapServerResponse(response)),
      tap(response => {
        this.setToken({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: 3600
        });
        this.userSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/auth/login']);
  }

  refreshToken(refreshToken: string): Observable<JwtToken> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      map(response => ({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn || 3600
      })),
      tap(token => {
        this.setToken(token);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  verifyEmail(request: EmailVerificationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/verify-email`, request).pipe(
      catchError(error => {
        console.error('Email verification error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(error => {
        console.error('Forgot password error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  resetPassword(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError(error => {
        console.error('Password reset error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  handleOAuthCallback(code: string, provider: string): Observable<AuthResponse> {
    return this.http.get<AuthServerResponse>(
      `${this.apiUrl}/oauth2/callback/${provider}?code=${code}`
    ).pipe(
      map(response => this.mapServerResponse(response)),
      tap(response => {
        this.setToken({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: 3600
        });
        this.userSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('OAuth callback error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  getCurrentUser(): Observable<AuthUser> {
    const currentUser = this.userSubject.getValue();
    if (currentUser) {
      return of(currentUser);
    }

    if (this.userLoading) {
      return this.userSubject.pipe(
        filter((user): user is AuthUser => user !== null),
        take(1)
      );
    }

    this.userLoading = true;

    return this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Invalid user response');
        }

        const user: AuthUser = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          roles: response.data.roles?.map(role => role as UserRole) || [],
          emailVerified: response.data.emailVerified,
          profilePicture: response.data.profilePicture
        };
        return user;
      }),
      tap(user => {
        this.userSubject.next(user);
        this.userLoading = false;
      }),
      catchError(error => {
        this.userLoading = false;
        console.error('Get current user error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  hasRole(role: UserRole): Observable<boolean> {
    return this.user$.pipe(
      map(user => {
        if (!user || !Array.isArray(user.roles)) {
          return false;
        }
        return user.roles.includes(role);
      })
    );
  }

  // Navigation Methods
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  private handleError(error: any): string {
    if (error.error instanceof ErrorEvent) {
      return error.error.message;
    }
    return error.error?.message || 'An unexpected error occurred';
  }

  private mapServerResponse(response: AuthServerResponse): AuthResponse {
    if (!response || !response.data || !response.data.user) {
      console.error('Invalid server response:', response);
      throw new Error('Invalid server response');
    }

    const user: AuthUser = {
      id: response.data.user.id,
      email: response.data.user.email,
      firstName: response.data.user.firstName,
      lastName: response.data.user.lastName,
      roles: response.data.user.roles?.map(role => role as UserRole) || [],
      emailVerified: response.data.user.emailVerified,
      profilePicture: response.data.user.profilePicture
    };
    
    return { 
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user 
    };
  }
} 