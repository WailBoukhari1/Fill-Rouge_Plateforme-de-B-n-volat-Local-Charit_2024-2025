import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { EmailVerificationRequest, ApiResponse, LoginResponse } from '../interfaces/auth.interface';
import { tap as rxjsTap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  register(userData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/signup`, userData).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('pendingVerificationEmail', userData.email);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      loginId: credentials.email,
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('token', response.data.accessToken);
          const decodedToken = this.decodeToken(response.data.accessToken);
          this.currentUserSubject.next(decodedToken);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-email`, {
      params: { token }
    });
  }

  resendVerificationCode(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/resend-verification`, null, {
      params: { email }
    });
  }

  private decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  loadStoredUser(): void {
    const token = this.getAuthToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      if (decodedToken) {
        this.currentUserSubject.next(decodedToken);
      }
    }
  }
} 