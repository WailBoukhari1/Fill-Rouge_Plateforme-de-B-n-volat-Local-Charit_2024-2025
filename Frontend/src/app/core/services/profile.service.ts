import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../store/auth/auth.selectors';
import {
  UserRole,
  ProfileType,
  StatsType,
  ApiResponse,
} from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;
  private readonly endpoints = {
    volunteer: {
      profile: `${this.apiUrl}/volunteers/profile`,
      stats: `${this.apiUrl}/volunteers/statistics`,
    },
    organization: {
      profile: `${this.apiUrl}/organizations/profile`,
      stats: `${this.apiUrl}/organizations/statistics`,
    },
  };

  constructor(private http: HttpClient, private store: Store) {}

  /**
   * Get the current user's profile based on their role
   */
  getCurrentUserProfile(): Observable<ProfileType> {
    return this.store.select(selectUserRole).pipe(
      switchMap((role) =>
        this.handleRoleBasedRequest<ProfileType>(role, 'profile')
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Update the current user's profile
   */
  updateCurrentUserProfile(
    profile: Partial<ProfileType>
  ): Observable<ProfileType> {
    return this.store.select(selectUserRole).pipe(
      switchMap((role) =>
        this.handleRoleBasedRequest<ProfileType>(
          role,
          'profile',
          'PUT',
          profile
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get profile statistics based on user role
   */
  getProfileStats(): Observable<StatsType> {
    return this.store.select(selectUserRole).pipe(
      switchMap((role) =>
        this.handleRoleBasedRequest<ApiResponse<StatsType>>(role, 'stats')
      ),
      map((response) => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Handle role-based API requests
   */
  private handleRoleBasedRequest<T>(
    role: string | null,
    endpointType: 'profile' | 'stats',
    method: 'GET' | 'PUT' = 'GET',
    body?: any
  ): Observable<T> {
    if (!role) {
      return throwError(() => new Error('No user role found'));
    }

    const normalizedRole = role.toUpperCase() as UserRole;
    if (!this.isValidRole(normalizedRole)) {
      return throwError(() => new Error(`Unsupported role: ${role}`));
    }

    const endpoint = this.getEndpoint(normalizedRole, endpointType);

    switch (method) {
      case 'GET':
        return this.http.get<T>(endpoint);
      case 'PUT':
        return this.http.put<T>(endpoint, body);
      default:
        return throwError(
          () => new Error(`Unsupported HTTP method: ${method}`)
        );
    }
  }

  /**
   * Get the appropriate endpoint based on role and type
   */
  private getEndpoint(role: UserRole, type: 'profile' | 'stats'): string {
    const roleEndpoints =
      role === 'VOLUNTEER'
        ? this.endpoints.volunteer
        : this.endpoints.organization;
    return roleEndpoints[type];
  }

  /**
   * Type guard for role validation
   */
  private isValidRole(role: string): role is UserRole {
    return ['VOLUNTEER', 'ORGANIZATION'].includes(role);
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('ProfileService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
