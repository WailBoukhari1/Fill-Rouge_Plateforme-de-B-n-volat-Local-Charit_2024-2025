import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/auth.models';
import { ApiResponse } from '../models/api.response.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getUsers(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUserById(id: number | string): Observable<User> {
    console.log(`Fetching user with ID: ${id}`);
    
    // Handle empty or invalid IDs
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid user ID provided:', id);
      return throwError(() => new Error('Invalid user ID'));
    }
    
    // Try to get the current user profile instead of by ID to avoid MongoDB ID issues
    return this.getCurrentUserProfile().pipe(
      catchError((error) => {
        console.log('Failed to get current profile, falling back to user ID lookup');
        return this.fetchUserById(id);
      })
    );
  }
  
  private fetchUserById(id: number | string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('User API response:', response)),
      map(response => {
        // Check if the response is wrapped in a data property (ApiResponse format)
        if (response && response.data) {
          return response.data;
        }
        // If the response is the direct User object
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching user ${id}:`, error);
        
        if (error.status === 404) {
          return throwError(() => new Error('User not found'));
        } else if (error.status === 500) {
          // For server errors, try to get more context
          const errorMsg = error.error?.message || 'Server error occurred';
          return throwError(() => new Error(`Server error: ${errorMsg}`));
        }
        
        return throwError(() => new Error('Failed to load user information'));
      })
    );
  }
  
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`).pipe(
      tap(response => console.log('User profile API response:', response)),
      map(response => {
        if (response && response.data) {
          return response.data as User;
        }
        return response as unknown as User;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching current user profile:', error);
        return throwError(() => new Error('Failed to load user profile'));
      })
    );
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  lockUserAccount(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${userId}/lock`, {});
  }

  unlockUserAccount(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${userId}/unlock`, {});
  }

  resendVerificationEmail(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/resend-verification`, { email });
  }

  updateUserRole(userId: string, role: UserRole): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${userId}/role`, { role })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating user role:', error);
          return throwError(() => new Error('Failed to update user role'));
        })
      );
  }

  deleteUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${userId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error deleting user:', error);
          return throwError(() => new Error('Failed to delete user'));
        })
      );
  }
} 
 