import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, BackendAuthResponse } from '../models/dto/auth.dto';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private currentUserEmail: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.store.dispatch(AuthActions.loginSuccess({
          token,
          refreshToken,
          user
        }));
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserEmail = null;
    this.isAuthenticatedSubject.next(false);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        // Always store the email, regardless of verification status
        this.currentUserEmail = response.data.email;
        console.log('Setting current user email in login:', this.currentUserEmail);
        
        const authResponse = {
          token: response.data.emailVerified ? response.data.accessToken : null,
          refreshToken: response.data.emailVerified ? response.data.refreshToken : null,
          user: {
            email: response.data.email,
            role: response.data.role,
            emailVerified: response.data.emailVerified
          }
        };

        if (response.data.emailVerified) {
          this.storeAuthData(authResponse);
        }

        return authResponse;
      })
    );
  }

  private storeAuthData(response: AuthResponse) {
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    this.isAuthenticatedSubject.next(true);
  }

  resendVerificationEmail(email?: string): Observable<void> {
    const targetEmail = email || this.currentUserEmail;
    console.log('Attempting to resend verification email to:', targetEmail);
    
    if (!targetEmail) {
      console.error('No email address available');
      return throwError(() => new Error('No email address available'));
    }

    return this.http.post<void>(`${this.apiUrl}/resend-verification-email`, null, {
      params: { email: targetEmail }
    }).pipe(
      tap(() => console.log('Verification email sent successfully')),
      catchError(error => {
        console.error('Error sending verification email:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      map(response => {
        this.currentUserEmail = userData.email;
        console.log('Setting current user email after registration:', this.currentUserEmail);
        
        const authResponse = {
          token: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: {
            email: response.data.email,
            role: response.data.role,
            emailVerified: response.data.emailVerified
          }
        };

        // Don't store auth data yet since email needs verification
        return authResponse;
      }),
      tap(() => {
        this.router.navigate(['/auth/verify-email']);
      })
    );
  }

  verifyEmail(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/verify-email`, null, {
      params: { email, code }
    });
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { token, password });
  }

  initiateOAuthLogin(provider: string): void {
    window.location.href = `${this.apiUrl}/oauth2/authorize/${provider}`;
  }

  handleOAuthCallback(code: string, provider: string): Observable<AuthResponse> {
    return this.http.get<BackendAuthResponse>(
      `${this.apiUrl}/oauth2/callback/${provider}?code=${code}`
    ).pipe(
      map(response => ({
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: {
          email: response.data.email,
          role: response.data.role,
          emailVerified: response.data.emailVerified
        }
      })),
      tap(response => this.storeAuthData(response))
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get('/auth/oauth2/current-user');
  }

  refreshToken(refreshToken: string): Observable<{ token: string; refreshToken: string }> {
    return this.http.post<BackendAuthResponse>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      map(response => ({
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken
      }))
    );
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
} 