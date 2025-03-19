import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  EventResponse, 
  EventRequest, 
  EventCategory, 
  EventStatus, 
  Event, 
  EventStats,
  EventRegistration,
  EventFeedback
} from '../models/event.model';
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

  private validateOrganizationId(): string {
    const organizationId = localStorage.getItem('organizationId');
    console.log('Retrieved organization ID from localStorage:', organizationId);
    
    if (!organizationId) {
      console.error('Organization ID not found in localStorage');
      this.snackBar.open('Please log in as an organization first', 'Close', { duration: 5000 });
      this.router.navigate(['/auth/login']);
      throw new Error('Organization ID not found');
    }

    // Validate that it's a valid MongoDB ObjectId (24 characters, hexadecimal)
    if (!/^[0-9a-fA-F]{24}$/.test(organizationId)) {
      console.error('Invalid organization ID format:', organizationId);
      this.snackBar.open('Invalid organization ID format', 'Close', { duration: 5000 });
      this.router.navigate(['/auth/login']);
      throw new Error('Invalid organization ID format');
    }

    return organizationId;
  }

  private formatDateForBackend(date: Date | string): string {
    return date instanceof Date ? date.toISOString() : date;
  }

  private validateEventData(eventData: Partial<Event>): boolean {
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

  getEvents(filters: any = {}, page: number = 0, size: number = 10): Observable<Page<Event>> {
    const organizationId = localStorage.getItem('organizationId');
    if (!organizationId) {
      return throwError(() => new Error('Organization ID not found'));
    }

    return this.http.get<ApiResponse<Page<Event>>>(`${this.apiUrl}/organization/${organizationId}`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        ...filters
      }
    }).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No data in response');
        }
        return {
          ...response.data,
          content: response.data.content.map(event => ({
            ...event,
            id: event.id || '',
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            currentParticipants: event.registeredParticipants?.size || 0
          }))
        };
      }),
      catchError(error => {
        this.snackBar.open('Error fetching events', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    // Validate event data
    if (!this.validateEventData(event)) {
      return throwError(() => new Error('Invalid event data'));
    }

    // Convert the event data to the correct format
    const eventData = this.toEventRequest(event);

    return this.http.post<ApiResponse<Event>>(`${this.apiUrl}`, eventData)
      .pipe(
        map(response => {
          console.log('Created event:', response);
          return response.data;
        }),
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

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateEventStatus(eventId: string, status: EventStatus): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${eventId}/status`, { status });
  }

  registerForEvent(eventId: string): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.apiUrl}/${eventId}/register`, {});
  }

  unregisterFromEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
  }

  cancelEvent(id: string, reason: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  getEventParticipants(eventId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${eventId}/participants`);
  }

  // Get events by organization
  getEventsByOrganization(organizationId: string, page = 0, size = 10): Observable<Page<Event>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<Event>>>(`${this.apiUrl}/organization/${organizationId}`, { params })
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
  getUpcomingEvents(page = 0, size = 10): Observable<Event[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.apiUrl}/upcoming`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Search events
  searchEvents(query: string, page = 0, size = 10): Observable<Event[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.apiUrl}/search`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get events by category
  getEventsByCategory(category: EventCategory, page = 0, size = 10): Observable<Event[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.apiUrl}/category/${category}`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Cancel registration
  cancelRegistration(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/register`)
      .pipe(map(response => void 0));
  }

  // Join waitlist
  joinWaitlist(eventId: string): Observable<EventRegistration> {
    return this.http.post<ApiResponse<EventRegistration>>(`${this.apiUrl}/${eventId}/waitlist`, {})
      .pipe(map(response => response.data));
  }

  // Leave waitlist
  leaveWaitlist(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/waitlist`)
      .pipe(map(response => void 0));
  }

  // Submit event feedback
  submitEventFeedback(eventId: string, feedback: Partial<EventFeedback>): Observable<EventFeedback> {
    return this.http.post<ApiResponse<EventFeedback>>(`${this.apiUrl}/${eventId}/feedback`, feedback)
      .pipe(map(response => response.data));
  }

  // Get event feedback
  getEventFeedback(eventId: string, page = 0, size = 10): Observable<EventFeedback[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<EventFeedback[]>>(`${this.apiUrl}/${eventId}/feedback`, { params })
      .pipe(map(response => response.data));
  }

  // Get nearby events
  getNearbyEvents(coordinates: [number, number], maxDistance: number, page = 0, size = 10): Observable<Event[]> {
    const params = new HttpParams()
      .set('lat', coordinates[0].toString())
      .set('lng', coordinates[1].toString())
      .set('distance', maxDistance.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.apiUrl}/nearby`, { params })
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get registered events
  getRegisteredEvents(): Observable<Event[]> {
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.apiUrl}/registered`)
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get waitlisted events
  getWaitlistedEvents(): Observable<Event[]> {
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.apiUrl}/waitlist`)
      .pipe(map(response => this.mapToEvents(response.data)));
  }

  // Get event statistics
  getEventStats(eventId: string): Observable<EventStats> {
    return this.http.get<ApiResponse<EventStats>>(`${this.apiUrl}/${eventId}/stats`)
      .pipe(map(response => response.data));
  }

  // Helper method to map a single EventResponse to Event
  private mapToEvent(event: EventResponse | null): Event {
    if (!event) throw new Error('Event not found');
    return {
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      registeredParticipants: new Set<string>(),
      waitlistedParticipants: new Set<string>(),
      approvedParticipants: new Set<string>(),
      rejectedParticipants: new Set<string>(),
      pendingParticipants: new Set<string>(),
      tags: new Set<string>(),
      resources: new Set<string>(),
      sponsors: new Set<string>(),
      requiredSkills: [],
      waitlistEnabled: false,
      maxWaitlistSize: 0,
      totalVolunteerHours: 0,
      isCancelled: false,
      isRecurring: false,
      requiresApproval: false,
      minimumAge: 0,
      requiresBackground: false,
      isVirtual: false,
      difficulty: 'BEGINNER',
      durationHours: 0,
      isSpecialEvent: false,
      pointsAwarded: 0,
      isPublished: true
    } as Event;
  }

  // Helper method to map EventResponse[] to Event[]
  private mapToEvents(events: EventResponse[] | null): Event[] {
    if (!events) return [];
    return events.map(event => this.mapToEvent(event));
  }

  // Helper method to convert Partial<IEvent> to EventRequest
  private toEventRequest(event: Partial<Event>): EventRequest {
    const request = {
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      coordinates: event.coordinates || [0, 0],
      startDate: (event.startDate instanceof Date ? event.startDate.toISOString() : event.startDate) || new Date().toISOString(),
      endDate: (event.endDate instanceof Date ? event.endDate.toISOString() : event.endDate) || new Date().toISOString(),
      maxParticipants: event.maxParticipants || 0,
      category: event.category || EventCategory.OTHER,
      contactPerson: event.contactPerson || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || ''
    };
    
    console.log('Converted event request:', request);
    return request;
  }
} 