import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EventCategory,
  EventStatus,
  IEventRegistration,
  IEventFeedback,
  IEvent,
  IEventFilters,
  IEventStats,
  IEventRegistrationRequest,
} from '../models/event.types';
import { ApiResponse } from '../models/api-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Page } from '../models/page.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const userId = this.authService.getCurrentUserId();
    const organizationId = this.authService.getCurrentOrganizationId();

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (userId) {
      headers = headers.set('X-User-ID', userId);
    }
    if (organizationId) {
      headers = headers.set('X-Organization-ID', organizationId);
    }

    return headers;
  }

  private getHttpOptions() {
    return {
      headers: this.getHeaders(),
      withCredentials: environment.cors.withCredentials,
    };
  }

  private formatDateForBackend(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString();
  }

  private validateOrganizationId(): string {
    // Get organization ID from auth service or local storage
    const orgId = localStorage.getItem('organizationId');
    if (!orgId) {
      throw new Error('Organization ID not found');
    }
    return orgId;
  }

  private validateEventData(event: Partial<IEvent>): boolean {
    if (!event) return false;

    // Required fields validation
    const requiredFields = [
      'title',
      'description',
      'startDate',
      'endDate',
      'location',
      'maxParticipants',
    ];
    for (const field of requiredFields) {
      if (!event[field as keyof IEvent]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Date validation
    const startDate = new Date(event.startDate!);
    const endDate = new Date(event.endDate!);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date format');
      return false;
    }

    if (endDate <= startDate) {
      console.error('End date must be after start date');
      return false;
    }

    // Numeric fields validation
    if (
      typeof event.maxParticipants !== 'number' ||
      event.maxParticipants < 1
    ) {
      console.error('Invalid maxParticipants');
      return false;
    }

    if (
      event.minimumAge &&
      (typeof event.minimumAge !== 'number' || event.minimumAge < 0)
    ) {
      console.error('Invalid minimumAge');
      return false;
    }

    return true;
  }

  getEvents(page: number = 0, size: number = 10): Observable<Page<IEvent>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    console.log(`Fetching events: ${this.apiUrl} with params:`, params.toString());
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}`, {
        params,
        headers: this.getHeaders(),
        withCredentials: environment.cors.withCredentials
      })
      .pipe(
        map((response) => {
          console.log('Raw API response:', response);
          
          if (!response.data || !Array.isArray(response.data)) {
            console.error('Invalid response structure:', response);
            return {
              content: [],
              totalElements: 0,
              totalPages: 0,
              size: size,
              number: page,
              first: true,
              last: true,
              empty: true,
            };
          }
          
          const mappedEvents = response.data.map((event) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          }));

          console.log('Mapped events:', mappedEvents.length);

          return {
            content: mappedEvents,
            totalElements: response.meta?.totalElements || mappedEvents.length,
            totalPages: response.meta?.totalPages || 1,
            size: response.meta?.size || size,
            number: response.meta?.page || page,
            first: page === 0,
            last: page === (response.meta?.totalPages || 1) - 1,
            empty: mappedEvents.length === 0,
          };
        }),
        catchError((error) => {
          console.error('Error fetching events:', error);
          return throwError(
            () => new Error('Failed to fetch events. Please try again later.')
          );
        })
      );
  }

  /**
   * Get an event by its ID with real-time status updates
   */
  getEventById(id: string): Observable<IEvent> {
    console.log(`[EventService] Getting event with ID: ${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => {
        if (response && response.success) {
          console.log(`[EventService] Event retrieved with real-time status: ${response.data.status}`);
          return response.data;
        } else if (response && !response.success) {
          throw new Error(response.message || 'Error retrieving event');
        } else {
          return response;
        }
      }),
      catchError(error => {
        console.error(`[EventService] Error getting event:`, error);
        return throwError(() => new Error(`Error getting event: ${error.message || 'Unknown error'}`));
      })
    );
  }

  createEvent(event: Partial<IEvent>): Observable<IEvent> {
    if (!this.validateEventData(event)) {
      return throwError(() => new Error('Invalid event data'));
    }

    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      return throwError(() => new Error('Organization ID not found'));
    }

    const eventData = this.toEventRequest(event);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Organization-ID': organizationId,
      'X-User-ID': this.authService.getCurrentUserId() || '',
    });

    return this.http
      .post<ApiResponse<IEvent>>(`${this.apiUrl}`, eventData, { headers })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error creating event:', error);
          let message = 'Error creating event. Please try again.';
          if (error.status === 400) {
            message = 'Invalid event data. Please check all required fields.';
          }
          this.snackBar.open(message, 'Close', { duration: 5000 });
          return throwError(() => error);
        })
      );
  }

  updateEvent(id: string, event: Partial<IEvent>): Observable<IEvent> {
    if (!this.validateEventData(event)) {
      return throwError(() => new Error('Invalid event data'));
    }

    const eventData = this.toEventRequest(event);
    console.log('Updating event with data:', eventData);

    return this.http
      .put<ApiResponse<IEvent>>(
        `${this.apiUrl}/${id}`,
        eventData,
        this.getHttpOptions()
      )
      .pipe(
        map((response) => {
          console.log('Update response:', response);
          if (!response.data) {
            throw new Error('No data received from server');
          }
          const mappedEvent = this.mapToEvent(response.data);
          console.log('Mapped event:', mappedEvent);
          return mappedEvent;
        }),
        catchError((error) => {
          console.error('Error updating event:', error);
          let message = 'Error updating event. Please try again.';

          if (error.status === 400) {
            message = 'Invalid event data. Please check all required fields.';
          } else if (error.status === 404) {
            message = 'Event not found.';
          } else if (error.status === 403) {
            message = 'You do not have permission to update this event.';
          } else if (error.status === 409) {
            message = 'Event dates conflict with existing events.';
          } else if (error.status === 422) {
            message = error.error?.message || 'Invalid event data format.';
          }

          this.snackBar.open(message, 'Close', { duration: 5000 });
          return throwError(() => error);
        })
      );
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update the status of an event
   * @param eventId Event ID
   * @param status New status
   * @returns Observable of the updated event
   */
  updateEventStatus(eventId: string, status: EventStatus): Observable<any> {
    console.log(`[EventService] Updating event status for event ${eventId} to ${status}`);
    return this.http.patch(`${this.apiUrl}/events/${eventId}/status`, { status })
      .pipe(
        tap((response: any) => console.log(`[EventService] Event status updated:`, response)),
        catchError(error => {
          console.error(`[EventService] Error updating event status:`, error);
          return throwError(() => new Error(`Error updating event status: ${error.message || 'Unknown error'}`));
        })
      );
  }

  /**
   * Cancel an event (organization only)
   * @param eventId Event ID 
   * @returns Observable of the updated event
   */
  cancelEvent(eventId: string): Observable<any> {
    console.log(`[EventService] Cancelling event ${eventId}`);
    return this.updateEventStatus(eventId, EventStatus.CANCELLED);
  }

  registerForEvent(eventId: string, registrationData?: IEventRegistrationRequest): Observable<any> {
    const url = `${this.apiUrl}/${eventId}/register`;
    const userId = this.authService.getCurrentUserId();
    
    // If no registration data is provided, create a minimal registration with just the user ID
    if (!registrationData) {
      const minimalRegistration: IEventRegistrationRequest = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        termsAccepted: true,
        userId: userId
      };
      return this.http.post<any>(url, minimalRegistration, this.getHttpOptions()).pipe(
        catchError((error) => {
          this.handleError(error);
          return throwError(() => error);
        })
      );
    }
    
    // Otherwise use the provided registration data, ensuring userId is set
    if (userId && (!registrationData.userId || registrationData.userId.trim() === '')) {
      registrationData.userId = userId;
    }
    
    return this.http.post<any>(url, registrationData, this.getHttpOptions()).pipe(
      catchError((error) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  registerWithDetails(eventId: string, registrationData: IEventRegistrationRequest): Observable<any> {
    const url = `${this.apiUrl}/${eventId}/register`;
    const userId = this.authService.getCurrentUserId();
    
    // Ensure user ID is set if authenticated
    if (userId && (!registrationData.userId || registrationData.userId.trim() === '')) {
      registrationData.userId = userId;
    }
    
    return this.http.post<any>(url, registrationData, this.getHttpOptions()).pipe(
      catchError((error) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  quickRegisterForEvent(eventId: string): Observable<any> {
    // Get current user's information
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.snackBar.open('You must be logged in to register for events', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return throwError(() => new Error('User not authenticated'));
    }
    
    const minimalRegistration: IEventRegistrationRequest = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      termsAccepted: true,
      userId: userId
    };
    
    return this.registerForEvent(eventId, minimalRegistration);
  }

  cancelRegistration(eventId: string): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('You must be logged in to cancel registration.'));
    }
    
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/register`, this.getHttpOptions())
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error('Cancellation error:', error);
          let errorMessage = 'Failed to cancel registration. Please try again.';
          
          if (error.status === 404) {
            errorMessage = 'Registration not found.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to cancel this registration.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  unregisterFromEvent(eventId: string): Observable<IEvent> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }

    // First, cancel the participation record
    return this.http
      .delete<ApiResponse<any>>(
        `${environment.apiUrl}/api/event-participations/events/${eventId}/volunteers/${userId}`,
        { headers: this.getHeaders() }
      )
      .pipe(
        // Then, unregister from the event
        switchMap(() => 
          this.http.post<ApiResponse<IEvent>>(
            `${this.apiUrl}/${eventId}/unregister`,
            {},
            { headers: this.getHeaders() }
          )
        ),
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to unregister from event');
          }
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getEventParticipants(eventId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${eventId}/participants`);
  }

  // Get events by organization
  getEventsByOrganization(
    organizationId: string,
    page = 0,
    size = 10
  ): Observable<Page<IEvent>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<ApiResponse<Page<IEvent>>>(
        `${this.apiUrl}/organization/${organizationId}`,
        { params }
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching organization events:', error);
          this.snackBar.open('Error fetching organization events', 'Close', {
            duration: 3000,
          });
          return throwError(() => error);
        })
      );
  }

  // Get upcoming events
  getUpcomingEvents(page = 0, size = 10): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/upcoming`, { params })
      .pipe(map((response) => this.mapToEvents(response.data)));
  }

  // Get all events for admin
  getAllEventsForAdmin(page = 0, size = 10): Observable<Page<IEvent>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/admin/all`, { 
        params,
        headers: this.getHeaders()
      })
      .pipe(
        map((response) => {
          const mappedEvents = this.mapToEvents(response.data);
          return {
            content: mappedEvents,
            totalElements: response.meta?.totalElements || mappedEvents.length,
            totalPages: response.meta?.totalPages || 1,
            size: response.meta?.size || size,
            number: response.meta?.page || page,
            first: response.meta?.page === 0,
            last: response.meta?.page === (response.meta?.totalPages || 1) - 1,
            empty: mappedEvents.length === 0
          };
        }),
        catchError((error) => {
          console.error('Error fetching admin events:', error);
          this.snackBar.open('Error fetching events', 'Close', {
            duration: 3000,
          });
          return throwError(() => error);
        })
      );
  }

  // Approve an event
  approveEvent(eventId: string): Observable<IEvent> {
    return this.http
      .patch<ApiResponse<IEvent>>(`${this.apiUrl}/${eventId}/approve`, {}, {
        headers: this.getHeaders()
      })
      .pipe(
        map((response) => this.mapToEvent(response.data)),
        catchError((error) => {
          console.error('Error approving event:', error);
          this.snackBar.open('Error approving event', 'Close', {
            duration: 3000,
          });
          return throwError(() => error);
        })
      );
  }

  // Reject an event
  rejectEvent(eventId: string, reason?: string): Observable<IEvent> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    
    return this.http
      .patch<ApiResponse<IEvent>>(`${this.apiUrl}/${eventId}/reject`, {}, {
        headers: this.getHeaders(),
        params
      })
      .pipe(
        map((response) => this.mapToEvent(response.data)),
        catchError((error) => {
          console.error('Error rejecting event:', error);
          this.snackBar.open('Error rejecting event', 'Close', {
            duration: 3000,
          });
          return throwError(() => error);
        })
      );
  }

  // Search events
  searchEvents(query: string, page = 0, size = 10): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/search`, { params })
      .pipe(map((response) => this.mapToEvents(response.data)));
  }

  // Get events by category
  getEventsByCategory(
    category: EventCategory,
    page = 0,
    size = 10
  ): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/category/${category}`, {
        params,
      })
      .pipe(map((response) => this.mapToEvents(response.data)));
  }

  // Join waitlist
  joinWaitlist(eventId: string): Observable<IEventRegistration> {
    return this.http
      .post<ApiResponse<IEventRegistration>>(
        `${this.apiUrl}/${eventId}/waitlist`,
        {}
      )
      .pipe(map((response) => response.data));
  }

  // Leave waitlist
  leaveWaitlist(eventId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/waitlist`)
      .pipe(map((response) => void 0));
  }

  // Submit event feedback
  submitEventFeedback(
    eventId: string,
    feedback: Partial<IEventFeedback>
  ): Observable<IEventFeedback> {
    return this.http
      .post<ApiResponse<IEventFeedback>>(
        `${this.apiUrl}/${eventId}/feedback`,
        feedback
      )
      .pipe(map((response) => response.data));
  }

  // Get event feedback
  getEventFeedback(
    eventId: string,
    page = 0,
    size = 10
  ): Observable<IEventFeedback[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<ApiResponse<IEventFeedback[]>>(
        `${this.apiUrl}/${eventId}/feedback`,
        { params }
      )
      .pipe(map((response) => response.data));
  }

  // Get nearby events
  getNearbyEvents(
    coordinates: [number, number],
    maxDistance: number,
    page = 0,
    size = 10
  ): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('lat', coordinates[0].toString())
      .set('lng', coordinates[1].toString())
      .set('distance', maxDistance.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/nearby`, { params })
      .pipe(map((response) => this.mapToEvents(response.data)));
  }

  // Get registered events
  getRegisteredEvents(): Observable<IEvent[]> {
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/registered`)
      .pipe(map((response) => this.mapToEvents(response.data)));
  }

  // Get waitlisted events
  getWaitlistedEvents(): Observable<IEvent[]> {
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/waitlist`)
      .pipe(map((response) => this.mapToEvents(response.data)));
  }

  // Get event statistics
  getEventStats(eventId: string): Observable<IEventStats> {
    return this.http
      .get<ApiResponse<IEventStats>>(`${this.apiUrl}/${eventId}/stats`)
      .pipe(map((response) => response.data));
  }

  // Helper method to map a single EventResponse to Event
  mapToEvent(event: any): IEvent {
    if (!event) return {} as IEvent;
    
    return {
      ...event,
      id: event.id || event._id,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      status: event.status || EventStatus.DRAFT,
      currentParticipants: event.currentParticipants || 0,
      maxParticipants: event.maxParticipants || 0,
      isRegistered: event.isRegistered || false
    };
  }

  // Helper method to map EventResponse[] to Event[]
  private mapToEvents(events: any[] | null): IEvent[] {
    if (!events) return [];
    return events.map(event => this.mapToEvent(event));
  }

  // Helper method to convert Partial<IEvent> to EventRequest
  private toEventRequest(event: Partial<IEvent>): any {
    // Start with the original event data if it exists
    const eventData = { ...event } as any;

    // Handle ID mapping
    if (eventData.id && !eventData._id) {
      eventData._id = eventData.id;
    }

    const request = {
      ...eventData, // Keep all original data
      // Override with new values or use defaults
      title: event.title || '',
      description: event.description || '',
      category: event.category || EventCategory.OTHER,
      location: event.location || '',
      coordinates: event.coordinates || [0, 0],
      startDate: event.startDate
        ? this.formatDateForBackend(event.startDate)
        : this.formatDateForBackend(new Date()),
      endDate: event.endDate
        ? this.formatDateForBackend(event.endDate)
        : this.formatDateForBackend(new Date()),
      maxParticipants: event.maxParticipants || 0,
      waitlistEnabled: event.waitlistEnabled ?? false,
      maxWaitlistSize: event.maxWaitlistSize || 0,
      requiredSkills: event.requiredSkills || [],
      isVirtual: event.isVirtual ?? false,
      requiresApproval: event.requiresApproval ?? false,
      difficulty: event.difficulty || 'BEGINNER',
      tags: Array.isArray(event.tags) ? event.tags : [],
      isRecurring: event.isRecurring ?? false,
      minimumAge: event.minimumAge || 0,
      requiresBackground: event.requiresBackground ?? false,
      isSpecialEvent: event.isSpecialEvent ?? false,
      pointsAwarded: event.pointsAwarded || 0,
      durationHours: event.durationHours || 0,
      contactPerson: event.contactPerson || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      organizationId: event.organizationId || this.validateOrganizationId(),
      status: event.status || EventStatus.PENDING,
      // Preserve these fields if they exist
      registeredParticipants: event.registeredParticipants || [],
      waitlistedParticipants: event.waitlistedParticipants || [],
      averageRating: event.averageRating || 0,
      numberOfRatings: event.numberOfRatings || 0,
      createdAt: event.createdAt || new Date(),
      updatedAt: new Date(),
    };

    console.log('Converted event request:', request);
    return request;
  }

  uploadEventBanner(
    eventId: string,
    file: File
  ): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('bannerImage', file);

    return this.http
      .post<{ imageUrl: string }>(
        `${this.apiUrl}/${eventId}/banner`,
        formData,
        {
          headers: this.getHeaders().delete('Content-Type'),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error uploading banner image:', error);
          this.snackBar.open('Error uploading banner image', 'Close', {
            duration: 3000,
          });
          return throwError(() => error);
        })
      );
  }

  updateEventBanner(eventId: string, imageUrl: string): Observable<IEvent> {
    return this.http
      .patch<IEvent>(
        `${this.apiUrl}/${eventId}/banner`,
        { bannerImage: imageUrl },
        this.getHttpOptions()
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating banner image:', error);
          this.snackBar.open('Error updating banner image', 'Close', {
            duration: 3000,
          });
          return throwError(() => error);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);

    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 500) {
        errorMessage =
          'An unexpected server error occurred. Please try again later or contact support.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage =
          'Event not found. The requested resource does not exist.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 401) {
        errorMessage = 'Please log in to continue.';
        this.authService.logout(); // Redirect to login on unauthorized
      } else if (error.status === 400) {
        errorMessage =
          error.error?.message || 'Invalid request. Please check your input.';
      }
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  // Check if a user is registered for an event and retrieve their registration status
  checkRegistrationStatus(eventId: string, userId: string): Observable<{ isRegistered: boolean; status: string }> {
    return this.http
      .get<ApiResponse<{ isRegistered: boolean; status: string }>>(
        `${this.apiUrl}/${eventId}/registrations/status/${userId}`,
        this.getHttpOptions()
      )
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error checking registration status:', error);
          // Return a default value to avoid breaking the UI
          return of({ isRegistered: false, status: 'NOT_REGISTERED' });
        })
      );
  }

  // Check if a user is registered for an event (simplified boolean version)
  isUserRegisteredForEvent(eventId: string, userId: string): Observable<boolean> {
    return this.checkRegistrationStatus(eventId, userId).pipe(
      map(response => response.isRegistered)
    );
  }

  // Get public events (no authentication required)
  getPublicEvents(page: number = 0, size: number = 10): Observable<Page<IEvent>> {
    console.log(`Fetching public events: ${this.apiUrl}/public?page=${page}&size=${size}`);
    
    // Don't include authentication headers for public access
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}/public?page=${page}&size=${size}`, { headers })
      .pipe(
        map((response) => {
          console.log('Raw public events API response:', response);
          
          if (!response.data || !Array.isArray(response.data)) {
            console.error('Invalid public events response structure:', response);
            return {
              content: [],
              totalElements: 0,
              totalPages: 0,
              size: size,
              number: page,
              first: true,
              last: true,
              empty: true,
            };
          }
          
          const mappedEvents = response.data.map((event) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          }));

          console.log('Mapped public events:', mappedEvents.length);

          return {
            content: mappedEvents,
            totalElements: response.meta?.totalElements || mappedEvents.length,
            totalPages: response.meta?.totalPages || 1,
            size: response.meta?.size || size,
            number: response.meta?.page || page,
            first: page === 0,
            last: page === (response.meta?.totalPages || 1) - 1,
            empty: mappedEvents.length === 0,
          };
        }),
        catchError((error) => {
          console.error('Error fetching public events:', error);
          return throwError(
            () => new Error('Failed to fetch events. Please try again later.')
          );
        })
      );
  }

  // Get event status display name and color
  getEventStatusInfo(status: EventStatus | string): { displayName: string; color: string; icon: string } {
    // Ensure the status is a string value
    const statusStr = typeof status === 'string' ? status : (status as EventStatus);
    
    const statusMap: Record<string, { displayName: string; color: string; icon: string }> = {
      [EventStatus.DRAFT]: { displayName: 'Draft', color: 'gray', icon: 'edit' },
      [EventStatus.PENDING]: { displayName: 'Pending Approval', color: 'yellow', icon: 'hourglass_empty' },
      [EventStatus.APPROVED]: { displayName: 'Approved', color: 'teal', icon: 'check_circle' },
      [EventStatus.ACTIVE]: { displayName: 'Active', color: 'blue', icon: 'event_available' },
      [EventStatus.ONGOING]: { displayName: 'In Progress', color: 'green', icon: 'directions_run' },
      [EventStatus.COMPLETED]: { displayName: 'Completed', color: 'purple', icon: 'done_all' },
      [EventStatus.CANCELLED]: { displayName: 'Cancelled', color: 'red', icon: 'cancel' },
      [EventStatus.REJECTED]: { displayName: 'Rejected', color: 'red', icon: 'block' },
      [EventStatus.PUBLISHED]: { displayName: 'Published', color: 'blue', icon: 'publish' },
      [EventStatus.FULL]: { displayName: 'Full', color: 'orange', icon: 'people_alt' },
      [EventStatus.UPCOMING]: { displayName: 'Upcoming', color: 'teal', icon: 'event' },
    };

    return statusMap[statusStr] || { displayName: 'Unknown', color: 'gray', icon: 'help' };
  }

  // Helper method to determine if event registration is open
  canRegisterForEvent(event: IEvent): boolean {
    if (!event) return false;
    
    const now = new Date();
    const eventStartDate = new Date(event.startDate);
    
    // Can register if:
    // 1. Event is active
    // 2. Event hasn't started yet
    // 3. Event is not full
    return (
      event.status === EventStatus.ACTIVE &&
      eventStartDate > now &&
      event.currentParticipants < event.maxParticipants
    );
  }

  // Helper method to determine if the event is currently happening
  isEventOngoing(event: IEvent): boolean {
    if (!event) return false;
    
    const now = new Date();
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);
    
    return (
      now >= eventStartDate &&
      now <= eventEndDate &&
      event.status !== EventStatus.CANCELLED
    );
  }

  // Helper method to determine if the event has ended
  isEventCompleted(event: IEvent): boolean {
    if (!event) return false;
    
    const now = new Date();
    const eventEndDate = new Date(event.endDate);
    
    return now > eventEndDate;
  }

  /**
   * Refresh event status in real-time
   * Use this to manually refresh an event's status
   */
  refreshEventStatus(eventId: string): Observable<IEvent> {
    return this.getEventById(eventId);
  }
}
