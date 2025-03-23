import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private timeoutDuration = 30000; // 30 seconds timeout

  constructor(private http: HttpClient) {
    console.log('AdminService initialized with API URL:', this.apiUrl);
    console.log('Environment API URL:', environment.apiUrl);
  }

  getAdminStatistics(): Observable<any> {
    console.log(`[AdminService] Requesting statistics from: ${this.apiUrl}/statistics`);
    return this.http.get<any>(`${this.apiUrl}/statistics`)
      .pipe(
        tap(response => console.log('[AdminService] Statistics response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  getUsers(page: number, size: number): Observable<any> {
    console.log(`[AdminService] Requesting users from: ${this.apiUrl}/users with params:`, { page, size });
    return this.http.get<any>(`${this.apiUrl}/users`, {
      params: { page: page.toString(), size: size.toString() }
    }).pipe(
      tap(response => console.log('[AdminService] Users response:', response)),
      timeout(this.timeoutDuration),
      retry(2),
      catchError(this.handleError)
    );
  }

  lockUserAccount(userId: string): Observable<any> {
    console.log(`[AdminService] Locking user account: ${userId}`);
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/lock`, {})
      .pipe(
        tap(response => console.log('[AdminService] Lock user response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  unlockUserAccount(userId: string): Observable<any> {
    console.log(`[AdminService] Unlocking user account: ${userId}`);
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/unlock`, {})
      .pipe(
        tap(response => console.log('[AdminService] Unlock user response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    console.log(`[AdminService] Updating user role: ${userId} to ${role}`);
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/role`, { role })
      .pipe(
        tap(response => console.log('[AdminService] Update role response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  deleteUser(userId: string): Observable<any> {
    console.log(`[AdminService] Deleting user: ${userId}`);
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        tap(response => console.log('[AdminService] Delete user response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  getOrganizations(page: number, size: number): Observable<any> {
    console.log(`[AdminService] Requesting organizations from: ${this.apiUrl}/organizations with params:`, { page, size });
    return this.http.get<any>(`${this.apiUrl}/organizations`, {
      params: { page: page.toString(), size: size.toString() }
    }).pipe(
      tap(response => console.log('[AdminService] Organizations response:', response)),
      timeout(this.timeoutDuration),
      catchError(this.handleError)
    );
  }

  verifyOrganization(organizationId: string): Observable<any> {
    console.log(`[AdminService] Verifying organization: ${organizationId}`);
    return this.http.put<any>(`${this.apiUrl}/organizations/${organizationId}/verify`, {})
      .pipe(
        tap(response => console.log('[AdminService] Verify organization response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  suspendOrganization(organizationId: string): Observable<any> {
    console.log(`[AdminService] Suspending organization: ${organizationId}`);
    return this.http.put<any>(`${this.apiUrl}/organizations/${organizationId}/suspend`, {})
      .pipe(
        tap(response => console.log('[AdminService] Suspend organization response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  reactivateOrganization(organizationId: string): Observable<any> {
    console.log(`[AdminService] Reactivating organization: ${organizationId}`);
    return this.http.put<any>(`${this.apiUrl}/organizations/${organizationId}/reactivate`, {})
      .pipe(
        tap(response => console.log('[AdminService] Reactivate organization response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  deleteOrganization(organizationId: string): Observable<any> {
    console.log(`[AdminService] Deleting organization: ${organizationId}`);
    return this.http.delete<any>(`${this.apiUrl}/organizations/${organizationId}`)
      .pipe(
        tap(response => console.log('[AdminService] Delete organization response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  getEvents(page: number, size: number, includeAll: boolean = true): Observable<any> {
    console.log(`[AdminService] Requesting events from: ${this.apiUrl}/events with params:`, { page, size, includeAll });
    return this.http.get<any>(`${this.apiUrl}/events`, {
      params: { 
        page: page.toString(), 
        size: size.toString(),
        includeAll: includeAll.toString()
      }
    }).pipe(
      tap(response => console.log('[AdminService] Events response:', response)),
      timeout(this.timeoutDuration),
      catchError(this.handleError)
    );
  }

  updateEventStatus(eventId: string, status: string): Observable<any> {
    console.log(`[AdminService] Updating event status: ${eventId} to ${status}`);
    return this.http.patch<any>(`${this.apiUrl}/events/${eventId}/status`, { status })
      .pipe(
        tap(response => console.log('[AdminService] Update event status response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  approveEvent(eventId: string): Observable<any> {
    console.log(`[AdminService] Approving event: ${eventId}`);
    return this.http.put<any>(`${this.apiUrl}/events/${eventId}/approve`, {})
      .pipe(
        tap(response => console.log('[AdminService] Approve event response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  rejectEvent(eventId: string, reason: string): Observable<any> {
    console.log(`[AdminService] Rejecting event: ${eventId} with reason: ${reason}`);
    return this.http.put<any>(`${this.apiUrl}/events/${eventId}/reject`, { reason })
      .pipe(
        tap(response => console.log('[AdminService] Reject event response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  deleteEvent(eventId: string): Observable<any> {
    console.log(`[AdminService] Deleting event: ${eventId}`);
    return this.http.delete<any>(`${this.apiUrl}/events/${eventId}`)
      .pipe(
        tap(response => console.log('[AdminService] Delete event response:', response)),
        timeout(this.timeoutDuration),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('[AdminService] API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error instanceof TimeoutError) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error instanceof HttpErrorResponse) {
      console.error('[AdminService] HTTP Error Status:', error.status);
      console.error('[AdminService] HTTP Error Message:', error.message);
      console.error('[AdminService] HTTP Error URL:', error.url);
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}