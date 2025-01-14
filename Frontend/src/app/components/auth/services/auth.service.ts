import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { EmailVerificationRequest, ApiResponse } from '../interfaces/auth.interface';
import { tap as rxjsTap } from 'rxjs/operators';

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

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
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
} 