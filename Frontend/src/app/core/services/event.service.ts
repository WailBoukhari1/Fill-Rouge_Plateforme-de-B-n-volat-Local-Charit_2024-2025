import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
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
  private readonly apiUrl = `${environment.apiUrl}/events`;

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
    return this.http
      .get<ApiResponse<IEvent[]>>(`${this.apiUrl}?page=${page}&size=${size}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          const mappedEvents = response.data.map((event) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          }));

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

  getEventById(id: string): Observable<IEvent> {
    console.log('Getting event with ID:', id);
    console.log('Headers:', this.getHeaders().keys());

    return this.http
      .get<ApiResponse<IEvent>>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          console.log('Raw response:', response);
          if (!response.success) {
            throw new Error(
              response.message || 'Failed to fetch event details'
            );
          }
          return response.data;
        }),
        catchError(this.handleError.bind(this))
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

  updateEventStatus(eventId: string, status: EventStatus): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${eventId}/status`, {
      status,
    });
  }

  registerForEvent(eventId: string): Observable<IEvent> {
    console.log(`Registering for event with ID: ${eventId}`);
    return this.http
      .post<ApiResponse<IEvent>>(
        `${this.apiUrl}/${eventId}/register`,
        {},
        this.getHttpOptions()
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(
              response.message || 'Failed to register for event'
            );
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Error registering for event:', error);
          return throwError(
            () => new Error('Failed to register for event. Please try again.')
          );
        })
      );
  }

  registerWithDetails(
    eventId: string,
    registrationData: IEventRegistrationRequest
  ): Observable<IEvent> {
    console.log(`Registering for event with ID: ${eventId} with details:`, registrationData);
    
    if (!registrationData.termsAccepted) {
      return throwError(() => new Error('You must accept the terms and conditions'));
    }
    
    return this.http
      .post<ApiResponse<IEvent>>(
        `${this.apiUrl}/${eventId}/register`,
        registrationData,
        this.getHttpOptions()
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(
              response.message || 'Failed to register for event'
            );
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Error registering for event with details:', error);
          const errorMessage = error.error?.message || 'Failed to register for event. Please try again.';
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

  cancelEvent(id: string, reason: string): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${id}/cancel`, { reason });
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

  // Cancel registration
  cancelRegistration(eventId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/register`)
      .pipe(map((response) => void 0));
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
  private mapToEvent(event: any): IEvent {
    if (!event) {
      throw new Error('Event data is null');
    }

    return {
      ...event,
      id: event._id || event.id,
      organizationName: event.organizationName || 'Organization', // Default value if not provided
      currentParticipants: event.registeredParticipants?.length || 0,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
      schedule: event.schedule || [],
      isRegistered: event.isRegistered || false,
    };
  }

  // Helper method to map EventResponse[] to Event[]
  private mapToEvents(events: any[] | null): IEvent[] {
    if (!events) {
      return [];
    }
    return events.map((event) => this.mapToEvent(event));
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
}
