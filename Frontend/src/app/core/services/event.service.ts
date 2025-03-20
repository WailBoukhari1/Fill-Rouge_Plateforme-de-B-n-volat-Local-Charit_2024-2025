import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  EventCategory, 
  EventStatus,
  IEventRegistration,
  IEventFeedback,
  IEvent,
  IEventFilters,
  IEventStats
} from '../models/event.types';
import { ApiResponse } from '../models/api-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Page } from '../models/page.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
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
    const organizationId = this.authService.getCurrentOrganizationId();
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (organizationId) {
      headers = headers.set('X-Organization-ID', organizationId);
    }
    return headers;
  }

  private getHttpOptions() {
    return {
      headers: this.getHeaders(),
      withCredentials: environment.cors.withCredentials
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

  private validateEventData(eventData: Partial<IEvent>): boolean {
    if (!eventData.startDate || !eventData.endDate) {
      this.snackBar.open('Invalid date range', 'Close', { duration: 3000 });
      return false;
    }
    
    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
      this.snackBar.open('End date must be after start date', 'Close', { duration: 3000 });
      return false;
    }
    
    return true;
  }

  getEvents(filters?: IEventFilters, page: number = 0, size: number = 10): Observable<Page<IEvent>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    console.log('Making API call to get events with params:', params.toString());
    console.log('Headers:', this.getHeaders().keys());

    return this.http.get<ApiResponse<IEvent[]>>(this.apiUrl, { 
      ...this.getHttpOptions(),
      params
    }).pipe(
      map(response => {
        console.log('API Response:', response);
        // Convert array response to Page object
        const mappedEvents = this.mapToEvents(response.data);
        return {
          content: mappedEvents,
          totalElements: response.meta.totalElements,
          totalPages: response.meta.totalPages,
          size: response.meta.size,
          number: response.meta.page,
          first: response.meta.page === 0,
          last: response.meta.page === response.meta.totalPages - 1,
          empty: mappedEvents.length === 0
        };
      }),
      catchError(error => {
        console.error('Error fetching events:', error);
        this.snackBar.open('Error fetching events', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  getEventById(id: string): Observable<IEvent> {
    return this.http.get<IEvent>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  createEvent(event: Partial<IEvent>): Observable<IEvent> {
    if (!this.validateEventData(event)) {
      return throwError(() => new Error('Invalid event data'));
    }

    const eventData = this.toEventRequest(event);
    return this.http.post<ApiResponse<IEvent>>(`${this.apiUrl}`, eventData, this.getHttpOptions())
      .pipe(
        map(response => response.data),
        catchError(error => {
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

    return this.http.put<ApiResponse<IEvent>>(`${this.apiUrl}/${id}`, eventData, this.getHttpOptions())
      .pipe(
        map(response => {
          console.log('Update response:', response);
          if (!response.data) {
            throw new Error('No data received from server');
          }
          const mappedEvent = this.mapToEvent(response.data);
          console.log('Mapped event:', mappedEvent);
          return mappedEvent;
        }),
        catchError(error => {
          console.error('Error updating event:', error);
          let message = 'Error updating event. Please try again.';
          if (error.status === 400) {
            message = 'Invalid event data. Please check all required fields.';
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
    return this.http.patch<IEvent>(`${this.apiUrl}/${eventId}/status`, { status });
  }

  registerForEvent(eventId: string): Observable<IEventRegistration> {
    return this.http.post<IEventRegistration>(`${this.apiUrl}/${eventId}/register`, {});
  }

  unregisterFromEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
  }

  cancelEvent(id: string, reason: string): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  getEventParticipants(eventId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${eventId}/participants`);
  }

  // Get events by organization
  getEventsByOrganization(organizationId: string, page = 0, size = 10): Observable<Page<IEvent>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<IEvent>>>(`${this.apiUrl}/organization/${organizationId}`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching organization events:', error);
          this.snackBar.open('Error fetching organization events', 'Close', { duration: 3000 });
          return throwError(() => error);
        })
      );
  }

  // Get upcoming events
  getUpcomingEvents(page = 0, size = 10): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<IEvent[]>>(`${this.apiUrl}/upcoming`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Search events
  searchEvents(query: string, page = 0, size = 10): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<IEvent[]>>(`${this.apiUrl}/search`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get events by category
  getEventsByCategory(category: EventCategory, page = 0, size = 10): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<IEvent[]>>(`${this.apiUrl}/category/${category}`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Cancel registration
  cancelRegistration(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/register`)
      .pipe(map(response => void 0));
  }

  // Join waitlist
  joinWaitlist(eventId: string): Observable<IEventRegistration> {
    return this.http.post<ApiResponse<IEventRegistration>>(`${this.apiUrl}/${eventId}/waitlist`, {})
      .pipe(map(response => response.data));
  }

  // Leave waitlist
  leaveWaitlist(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/waitlist`)
      .pipe(map(response => void 0));
  }

  // Submit event feedback
  submitEventFeedback(eventId: string, feedback: Partial<IEventFeedback>): Observable<IEventFeedback> {
    return this.http.post<ApiResponse<IEventFeedback>>(`${this.apiUrl}/${eventId}/feedback`, feedback)
      .pipe(map(response => response.data));
  }

  // Get event feedback
  getEventFeedback(eventId: string, page = 0, size = 10): Observable<IEventFeedback[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<IEventFeedback[]>>(`${this.apiUrl}/${eventId}/feedback`, { params })
      .pipe(map(response => response.data));
  }

  // Get nearby events
  getNearbyEvents(coordinates: [number, number], maxDistance: number, page = 0, size = 10): Observable<IEvent[]> {
    const params = new HttpParams()
      .set('lat', coordinates[0].toString())
      .set('lng', coordinates[1].toString())
      .set('distance', maxDistance.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<IEvent[]>>(`${this.apiUrl}/nearby`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get registered events
  getRegisteredEvents(): Observable<IEvent[]> {
    return this.http.get<ApiResponse<IEvent[]>>(`${this.apiUrl}/registered`)
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get waitlisted events
  getWaitlistedEvents(): Observable<IEvent[]> {
    return this.http.get<ApiResponse<IEvent[]>>(`${this.apiUrl}/waitlist`)
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get event statistics
  getEventStats(eventId: string): Observable<IEventStats> {
    return this.http.get<ApiResponse<IEventStats>>(`${this.apiUrl}/${eventId}/stats`)
      .pipe(map(response => response.data));
  }

  // Helper method to map a single EventResponse to Event
  private mapToEvent(event: IEvent | null): IEvent {
    if (!event) throw new Error('Event not found');
    
    // Convert Sets to arrays if they exist
    const registeredParticipants = event.registeredParticipants instanceof Set 
      ? Array.from(event.registeredParticipants) 
      : [];
    const waitlistedParticipants = event.waitlistedParticipants instanceof Set 
      ? Array.from(event.waitlistedParticipants) 
      : [];
    const tags = event.tags instanceof Set 
      ? Array.from(event.tags) 
      : event.tags || [];

    // Handle ID mapping
    const eventData = { ...event } as any;
    if (eventData.id && !eventData._id) {
      eventData._id = eventData.id;
    }

    return {
      ...eventData,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      registeredParticipants: registeredParticipants,
      waitlistedParticipants: waitlistedParticipants,
      tags: Array.from(tags),
      requiredSkills: event.requiredSkills || [],
      waitlistEnabled: event.waitlistEnabled || false,
      maxWaitlistSize: event.maxWaitlistSize || 0,
      isRecurring: event.isRecurring || false,
      requiresApproval: event.requiresApproval || false,
      minimumAge: event.minimumAge || 0,
      requiresBackground: event.requiresBackground || false,
      isVirtual: event.isVirtual || false,
      difficulty: event.difficulty || 'BEGINNER',
      durationHours: event.durationHours || 0,
      isSpecialEvent: event.isSpecialEvent || false,
      pointsAwarded: event.pointsAwarded || 0
    } as IEvent;
  }

  // Helper method to map EventResponse[] to Event[]
  private mapToEvents(events: IEvent[] | null): IEvent[] {
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
      startDate: event.startDate ? this.formatDateForBackend(event.startDate) : this.formatDateForBackend(new Date()),
      endDate: event.endDate ? this.formatDateForBackend(event.endDate) : this.formatDateForBackend(new Date()),
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
      participations: event.participations || [],
      averageRating: event.averageRating || 0,
      numberOfRatings: event.numberOfRatings || 0,
      createdAt: event.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    console.log('Converted event request:', request);
    return request;
  }

  uploadEventBanner(eventId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('bannerImage', file);

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/${eventId}/banner`, formData, {
      headers: this.getHeaders().delete('Content-Type')
    }).pipe(
      catchError(error => {
        console.error('Error uploading banner image:', error);
        this.snackBar.open('Error uploading banner image', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  updateEventBanner(eventId: string, imageUrl: string): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${eventId}/banner`, { bannerImage: imageUrl }, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error updating banner image:', error);
          this.snackBar.open('Error updating banner image', 'Close', { duration: 3000 });
          return throwError(() => error);
        })
      );
  }
} 