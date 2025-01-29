import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/dto/auth.dto';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Check if user is authenticated on service initialization
    const token = localStorage.getItem('token');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.post('/auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  register(userData: any): Observable<any> {
    return this.apiService.post('/auth/register', userData);
  }

  verifyEmail(token: string): Observable<any> {
    return this.apiService.post('/auth/verify-email', { token });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.apiService.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.apiService.post('/auth/reset-password', { token, newPassword });
  }
} 