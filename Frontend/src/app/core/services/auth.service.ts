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
import { log } from 'console';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DecodedToken {
  sub: string;
  exp: number;
  authorities?: string[];
  role?: string;
  user_id?: string;
  organization_id?: string;
  email_verified?: boolean;
  questionnaire_completed?: boolean;
  first_name?: string;
  last_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  currentUser$ = this.store.select(selectUser);

  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    console.log('Login request:', request);

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (!response) {
          console.error('No response received from server');
          throw new Error('No response received from server');
        }
        if (!response.data) {
          console.error('No data in response:', response);
          throw new Error('Invalid response format: No data received');
        }
        if (!response.data.token) {
          console.error('No token in response data:', response.data);
          throw new Error('Invalid response format: No token received');
        }
        this.handleAuthResponse(response.data);
      }),
      catchError(error => {
        console.error('Login error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        this.clearStorage();
        
        let errorMessage: string;
        
        // Check if it's a backend validation error
        if (error.error?.violations) {
          errorMessage = error.error.violations.map((v: any) => v.message).join(', ');
        }
        // Check if it's a backend error message
        else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        // Handle specific HTTP status codes
        else if (error.status === 404) {
          errorMessage = 'Account not found. Please check your email or register if you don\'t have an account.';
        } else if (error.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 403) {
          errorMessage = 'Your account is locked. Please try again later or contact support.';
        } else if (error.status === 500) {
          errorMessage = 'A server error occurred. Please try again later.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else {
          errorMessage = 'An unexpected error occurred. Please try again later.';
        }

        // Log the final error message for debugging
        console.error('Final error message:', errorMessage);

        this.store.dispatch(AuthActions.loginFailure({ error: errorMessage }));
        return throwError(() => errorMessage);
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    // First validate that email is present and valid
    if (!request.email || !request.email.trim()) {
      return throwError(() => new Error('Email is required for registration'));
    }

    // Normalize email to prevent null values
    const normalizedRequest = {
      ...request,
      email: request.email.trim(),
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim()
    };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, normalizedRequest).pipe(
      tap(response => this.handleAuthResponse(response.data))
    );
  }

  logout(): Observable<void> {
    // Get the token before clearing storage
    const token = this.getToken();
    
    // Clear storage first to prevent any race conditions
    this.clearStorage();
    
    // If no token, just complete the logout process
    if (!token) {
      this.store.dispatch(AuthActions.logoutSuccess());
      this.router.navigate(['/auth/login']);
      return of(void 0);
    }

    // Make the API call with the token
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        this.store.dispatch(AuthActions.logoutSuccess());
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        console.error('Logout API call failed:', error);
        // Even if API call fails, ensure we're logged out locally
        this.store.dispatch(AuthActions.logoutSuccess());
        this.router.navigate(['/auth/login']);
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
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/verify-email`,
      null,
      { params: { email, code } }
    );
  }

  checkEmailVerificationStatus(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/verify-email/status`,
      { params: { email } }
    );
  }

  resendVerificationCode(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/resend-verification`,
      null,
      { params: { email } }
    );
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

  submitQuestionnaire(formData: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/questionnaire`, formData).pipe(
      tap(response => {
        if (!response.data) {
          throw new Error('No data in response');
        }

        // Get the role from the response
        const userRole = response.data.roles?.[0]?.replace('ROLE_', '');

        if (!userRole) {
          throw new Error('No role found in response');
        }

        // Update the stored user data
        const userData: User = {
          id: response.data.userId || '',
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: userRole as UserRole,
          roles: [userRole],
          emailVerified: response.data.emailVerified || false,
          twoFactorEnabled: response.data.twoFactorEnabled || false,
          accountLocked: response.data.accountLocked || false,
          accountExpired: response.data.accountExpired || false,
          credentialsExpired: response.data.credentialsExpired || false,
          profilePicture: response.data.profilePicture,
          lastLoginIp: response.data.lastLoginIp,
          lastLoginAt: response.data.lastLoginAt,
          questionnaireCompleted: true
        };

        // Store the new tokens and user data
        localStorage.setItem(this.tokenKey, response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem(this.userKey, JSON.stringify(userData));

        // Store organization ID if user is an organization
        if (userRole === 'ORGANIZATION' && response.data.userId) {
          // First try to get organization by user ID
          this.http.get<ApiResponse<any>>(`${environment.apiUrl}/organizations/search?userId=${response.data.userId}`)
            .subscribe({
              next: (searchResponse) => {
                if (searchResponse.data?.id) {
                  console.log('Found organization ID through search:', searchResponse.data.id);
                  localStorage.setItem('organizationId', searchResponse.data.id);
                } else if (searchResponse.data?._id) {
                  console.log('Found organization _id through search:', searchResponse.data._id);
                  localStorage.setItem('organizationId', searchResponse.data._id);
                } else {
                  // Fallback to direct user ID lookup
                  this.http.get<ApiResponse<any>>(`${environment.apiUrl}/organizations/user/${response.data.userId}`)
                    .subscribe({
                      next: (orgResponse) => {
                        if (orgResponse.data?.id) {
                          console.log('Found organization ID:', orgResponse.data.id);
                          localStorage.setItem('organizationId', orgResponse.data.id);
                        } else if (orgResponse.data?._id) {
                          console.log('Found organization _id:', orgResponse.data._id);
                          localStorage.setItem('organizationId', orgResponse.data._id);
                        } else {
                          console.error('No organization found for user:', response.data.userId);
                        }
                      },
                      error: (error) => {
                        console.error('Error fetching organization ID:', error);
                      }
                    });
                }
              },
              error: (error) => {
                console.error('Error searching for organization:', error);
              }
            });
        }

        // Update the auth state with new tokens
        this.store.dispatch(AuthActions.loginSuccess({
          user: userData,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          redirect: false
        }));

        console.log('Questionnaire completed - Updated auth state:', {
          user: userData,
          newRole: userRole,
          token: response.data.token?.substring(0, 20) + '...'
        });
      }),
      catchError(error => {
        console.error('Questionnaire submission error:', error);
        return throwError(() => error);
      })
    );
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
      console.error('handleAuthResponse: No response provided');
      throw new Error('No response provided');
    }

    if (!response.token) {
      console.error('handleAuthResponse: No token in response:', response);
      throw new Error('No token in response');
    }

    try {
      const decodedToken = this.decodeToken(response.token);
      const userRole = this.extractRoleFromToken(decodedToken);

      if (!userRole) {
        console.error('handleAuthResponse: No role found in token:', decodedToken);
        throw new Error('No role found in token');
      }

      // Store tokens
      localStorage.setItem(this.tokenKey, response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      // Store user ID
      if (response.userId) {
        localStorage.setItem('userId', response.userId);
      }

      // Store organization ID if available in token
      if (decodedToken.organization_id) {
        console.log('Storing organization ID from token:', decodedToken.organization_id);
        localStorage.setItem('organizationId', decodedToken.organization_id);
      } else {
        // Fallback to fetching organization ID if not in token
        console.log('Fetching organization ID for user:', response.userId);
        this.http.get<ApiResponse<any>>(`${environment.apiUrl}/organizations/user/${response.userId}`)
          .subscribe({
            next: (orgResponse) => {
              if (orgResponse.data?.id) {
                console.log('Storing organization ID:', orgResponse.data.id);
                localStorage.setItem('organizationId', orgResponse.data.id);
              } else if (orgResponse.data?._id) {
                console.log('Storing organization _id:', orgResponse.data._id);
                localStorage.setItem('organizationId', orgResponse.data._id);
              } else {
                // If no direct ID found, try to find the organization by userId
                this.http.get<ApiResponse<any>>(`${environment.apiUrl}/organizations/search?userId=${response.userId}`)
                  .subscribe({
                    next: (searchResponse) => {
                      if (searchResponse.data?.id) {
                        console.log('Found organization ID through search:', searchResponse.data.id);
                        localStorage.setItem('organizationId', searchResponse.data.id);
                      } else if (searchResponse.data?._id) {
                        console.log('Found organization _id through search:', searchResponse.data._id);
                        localStorage.setItem('organizationId', searchResponse.data._id);
                      } else {
                        console.error('No organization found for user:', response.userId);
                        this.snackBar.open('Error: Organization not found for user', 'Close', { duration: 5000 });
                      }
                    },
                    error: (searchError) => {
                      console.error('Error searching for organization:', searchError);
                      this.snackBar.open('Error finding organization details', 'Close', { duration: 5000 });
                    }
                  });
              }
            },
            error: (error) => {
              console.error('Error fetching organization ID:', error);
              this.snackBar.open('Error fetching organization details', 'Close', { duration: 5000 });
            }
          });
      }

      // Create user object
      const user: User = {
        id: response.userId || '',
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: userRole as UserRole,
        roles: [userRole],
        emailVerified: response.emailVerified || false,
        twoFactorEnabled: response.twoFactorEnabled || false,
        accountLocked: response.accountLocked || false,
        accountExpired: response.accountExpired || false,
        credentialsExpired: response.credentialsExpired || false,
        profilePicture: response.profilePicture,
        lastLoginIp: response.lastLoginIp,
        lastLoginAt: response.lastLoginAt,
        questionnaireCompleted: response.questionnaireCompleted || false
      };

      // Store user data
      localStorage.setItem(this.userKey, JSON.stringify(user));

      // Update auth state
      this.store.dispatch(AuthActions.loginSuccess({
        user,
        token: response.token,
        refreshToken: response.refreshToken || '',
        redirect: true
      }));

      console.log('Auth response handled successfully:', {
        userId: user.id,
        role: user.role,
        email: user.email
      });
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
    localStorage.removeItem('userId');
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
          this.store.dispatch(AuthActions.logoutSuccess());
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        this.clearStorage();
        this.store.dispatch(AuthActions.logoutSuccess());
      }
    } else {
      // Initialize with logged out state
      this.store.dispatch(AuthActions.logoutSuccess());
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

  getCurrentUserId(): string {
    // First try to get from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('Found user ID in localStorage:', userId);
      return userId;
    }

    // If not in localStorage, try to get from token
    const token = this.getToken();
    if (!token) {
      console.warn('No auth token available');
      return '';
    }

    try {
      const decoded = this.decodeToken(token);
      console.log('Decoded token:', decoded);
      
      // Try to get user_id from token claims
      if (decoded.user_id) {
        console.log('Found user_id in token:', decoded.user_id);
        localStorage.setItem('userId', decoded.user_id);
        return decoded.user_id;
      }

      // If no user_id in token, try to get from stored user data
      const userData = localStorage.getItem(this.userKey);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          console.log('Found user ID in stored user data:', user.id);
          localStorage.setItem('userId', user.id);
          return user.id;
        }
      }

      console.error('Could not find user ID in token or stored data');
      return '';
    } catch (error) {
      console.error('Error getting user ID:', error);
      return '';
    }
  }

  getCurrentOrganizationId(): string {
    // First try to get from token
    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.decodeToken(token);
        console.log('AuthService: Full decoded token:', decoded);
        if (decoded.organization_id) {
          console.log('Found organization ID in token:', decoded.organization_id);
          localStorage.setItem('organizationId', decoded.organization_id);
          return decoded.organization_id;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    // If not in token, try to get from localStorage
    const orgId = localStorage.getItem('organizationId');
    if (orgId) {
      console.log('Found organization ID in localStorage:', orgId);
      return orgId;
    }

    console.warn('No organization ID found');
    return '';
  }

  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  getCurrentUserRole(): string {
    return this.getUserRole();
  }
}
