import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { jwtDecode } from 'jwt-decode';
import { 
  AuthResponse, 
  ApiResponse,
  LoginRequest, 
  RegisterRequest,
  EmailVerificationRequest,
  PasswordResetRequest,
  NewPasswordRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  User,
  UserRole
} from '../models/auth.models';
import { environment } from '../../../environments/environment';
import { selectIsAuthenticated, selectUser } from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';

interface DecodedToken {
  sub: string;
  exp: number;
  authorities?: string[];
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  currentUser$ = this.store.select(selectUser);

  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    console.log('Login request:', request);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (!response.data) {
          throw new Error('No data in response');
        }
        this.handleAuthResponse(response.data);
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.clearStorage();
        this.store.dispatch(AuthActions.loginFailure({ 
          error: error.message || 'Authentication failed' 
        }));
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response.data))
    );
  }

  logout(): Observable<void> {
    // First, clear local storage and state
    this.clearStorage();
    this.store.dispatch(AuthActions.logout());

    // Then make the API call
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(error => {
        console.error('Logout API call failed:', error);
        // We've already cleared the state, so just propagate the error
        return throwError(() => error);
      })
    );
  }

  refreshToken(token: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh-token`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(response => this.handleAuthResponse(response.data))
    );
  }

  verifyEmail(email: string, code: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verify-email`, { email, code });
  }

  resendVerificationCode(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, null, {
      params: { email }
    });
  }

  resetPassword(code: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, null, {
      params: { code, newPassword }
    });
  }

  setupTwoFactor(): Observable<ApiResponse<TwoFactorSetupResponse>> {
    return this.http.post<ApiResponse<TwoFactorSetupResponse>>(`${this.apiUrl}/2fa/setup`, {});
  }

  enableTwoFactor(request: TwoFactorVerifyRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/2fa/enable`, request);
  }

  disableTwoFactor(request: TwoFactorVerifyRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/2fa/disable`, request);
  }

  verifyTwoFactorCode(request: TwoFactorVerifyRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/2fa/verify`, request);
  }

  private decodeToken(token: string): DecodedToken {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Decoded token:', decoded);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw error;
    }
  }

  private extractRoleFromToken(decodedToken: DecodedToken): string | undefined {
    // Try to get role from authorities array
    if (decodedToken.authorities && Array.isArray(decodedToken.authorities)) {
      console.log('Found authorities in token:', decodedToken.authorities);
      const roleAuthority = decodedToken.authorities.find(auth => auth.startsWith('ROLE_'));
      if (roleAuthority) {
        const role = roleAuthority.replace('ROLE_', '');
        console.log('Extracted role from token authorities:', role);
        return role;
      }
    }

    // Try to get role from role field
    if (decodedToken.role) {
      const role = decodedToken.role.replace('ROLE_', '');
      console.log('Extracted role from token role field:', role);
      return role;
    }

    return undefined;
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (!response) {
      console.error('Invalid auth response:', response);
      return;
    }

    try {
      // Decode and validate token
      const decodedToken = this.decodeToken(response.token);
      if (this.isTokenExpired(decodedToken)) {
        throw new Error('Token is expired');
      }

      // Extract role from various sources
      let userRole: string | undefined;

      // First try to get role from token
      userRole = this.extractRoleFromToken(decodedToken);

      // Then try to get role from response data
      if (!userRole && response.role) {
        userRole = response.role.replace('ROLE_', '');
        console.log('Using role from response data:', userRole);
      }

      // Finally try to get role from response authorities
      if (!userRole && response.authorities && Array.isArray(response.authorities)) {
        console.log('Found authorities in response:', response.authorities);
        const roleAuthority = response.authorities.find(auth => auth.startsWith('ROLE_'));
        if (roleAuthority) {
          userRole = roleAuthority.replace('ROLE_', '');
          console.log('Extracted role from response authorities:', userRole);
        }
      }

      // Validate role
      if (!userRole) {
        console.error('No role found in token or response');
        throw new Error('No role found in authentication data');
      }

      // Validate role is a valid UserRole enum value
      if (!Object.values(UserRole).includes(userRole as UserRole)) {
        console.error('Invalid role:', userRole);
        throw new Error(`Invalid role in authentication data: ${userRole}`);
      }

      // Create user data object
      const userData: User = {
        id: 0,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: userRole as UserRole,
        emailVerified: response.emailVerified,
        twoFactorEnabled: response.twoFactorEnabled,
        accountLocked: response.accountLocked,
        accountExpired: response.accountExpired,
        credentialsExpired: response.credentialsExpired,
        profilePicture: response.profilePicture,
        lastLoginIp: response.lastLoginIp,
        lastLoginAt: response.lastLoginAt
      };

      console.log('Created user data:', userData);

      // Store auth data in localStorage
      localStorage.setItem(this.userKey, JSON.stringify(userData));
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Update store with user data
      this.store.dispatch(AuthActions.loginSuccess({
        user: userData,
        token: response.token,
        refreshToken: response.refreshToken
      }));
    } catch (error) {
      console.error('Error handling auth response:', error);
      this.clearStorage();
      throw error;
    }
  }

  private isTokenExpired(decodedToken: DecodedToken): boolean {
    if (!decodedToken.exp) return true;
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  }

  getDecodedToken(): DecodedToken | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;
    
    try {
      const decoded = this.decodeToken(token);
      if (this.isTokenExpired(decoded)) {
        this.clearStorage();
        return null;
      }
      return decoded;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('refreshToken');
    // Clear any other auth-related items you might have
    localStorage.removeItem('lastLoginTime');
    sessionStorage.clear(); // Clear any session storage as well
  }

  checkAuthState(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userData = localStorage.getItem(this.userKey);

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const decodedToken = this.decodeToken(token);

        if (!this.isTokenExpired(decodedToken)) {
          // Restore auth state without redirecting
          this.store.dispatch(AuthActions.loginSuccess({
            user,
            token,
            refreshToken: localStorage.getItem('refreshToken') || '',
            redirect: false
          }));
        } else {
          this.clearStorage();
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        this.clearStorage();
      }
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken = this.decodeToken(token);
      return !this.isTokenExpired(decodedToken);
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string {
    const userData = localStorage.getItem(this.userKey);
    if (!userData) return '';
    
    try {
      const user = JSON.parse(userData);
      return user.role || '';
    } catch {
      return '';
    }
  }

  getUserName(): string {
    const userData = localStorage.getItem(this.userKey);
    if (!userData) return '';
    
    try {
      const user = JSON.parse(userData);
      return `${user.firstName} ${user.lastName}`.trim() || user.email || '';
    } catch {
      return '';
    }
  }
} 