import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  IEvent, 
  IEventStats, 
  IEventFeedback, 
  IEventRegistration,
  IEventFilters,
  EventStatus
} from '../models/event.types';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  // Public Event Endpoints
  getEvents(filters: IEventFilters, page: number = 0, size: number = 10): Observable<{ content: IEvent[]; totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString());
    if (filters.location) params = params.set('location', filters.location);
    if (filters.radius) params = params.set('radius', filters.radius.toString());
    if (filters.skills?.length) params = params.set('skills', filters.skills.join(','));
    if (filters.status) params = params.set('status', filters.status);
    if (filters.organizationId) params = params.set('organizationId', filters.organizationId);
    if (filters.tags?.length) params = params.set('tags', filters.tags.join(','));
    if (filters.requiresBackground !== undefined) params = params.set('requiresBackground', filters.requiresBackground.toString());
    if (filters.isRecurring !== undefined) params = params.set('isRecurring', filters.isRecurring.toString());
    if (filters.minimumAge !== undefined) params = params.set('minimumAge', filters.minimumAge.toString());

    return this.http.get<{ content: IEvent[]; totalElements: number }>(this.apiUrl, { params }).pipe(
      map(response => ({
        content: response.content.map(event => ({
          ...event,
          registeredParticipants: new Set(event.registeredParticipants),
          waitlistedParticipants: new Set(event.waitlistedParticipants),
          approvedParticipants: new Set(event.approvedParticipants),
          rejectedParticipants: new Set(event.rejectedParticipants),
          pendingParticipants: new Set(event.pendingParticipants),
          tags: new Set(event.tags),
          resources: new Set(event.resources),
          sponsors: new Set(event.sponsors)
        })),
        totalElements: response.totalElements
      }))
    );
  }

  getEventById(id: string): Observable<IEvent> {
    return this.http.get<IEvent>(`${this.apiUrl}/${id}`).pipe(
      map(event => ({
        ...event,
        registeredParticipants: new Set(event.registeredParticipants),
        waitlistedParticipants: new Set(event.waitlistedParticipants),
        approvedParticipants: new Set(event.approvedParticipants),
        rejectedParticipants: new Set(event.rejectedParticipants),
        pendingParticipants: new Set(event.pendingParticipants),
        tags: new Set(event.tags),
        resources: new Set(event.resources),
        sponsors: new Set(event.sponsors)
      }))
    );
  }

  getUpcomingEvents(): Observable<IEvent[]> {
    const headers = new HttpHeaders().set('X-User-ID', localStorage.getItem('userId') || '');
    return this.http.get<{ content: IEvent[] }>(`${this.apiUrl}/upcoming`, { headers }).pipe(
      map(response => response.content || []),
      map(events => events.map(event => ({
        ...event,
        registeredParticipants: new Set(event.registeredParticipants),
        waitlistedParticipants: new Set(event.waitlistedParticipants),
        approvedParticipants: new Set(event.approvedParticipants),
        rejectedParticipants: new Set(event.rejectedParticipants),
        pendingParticipants: new Set(event.pendingParticipants),
        tags: new Set(event.tags),
        resources: new Set(event.resources),
        sponsors: new Set(event.sponsors)
      }))),
      catchError(error => {
        console.error('Error loading upcoming events:', error);
        return of([]);
      })
    );
  }

  // Event Registration
  registerForEvent(eventId: string): Observable<IEventRegistration> {
    return this.http.post<IEventRegistration>(`${this.apiUrl}/${eventId}/register`, {});
  }

  cancelRegistration(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
  }

  // Event Waitlist
  joinWaitlist(eventId: string): Observable<IEventRegistration> {
    return this.http.post<IEventRegistration>(`${this.apiUrl}/${eventId}/waitlist`, {});
  }

  leaveWaitlist(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/waitlist`);
  }

  getEventWaitlist(eventId: string): Observable<IEventRegistration[]> {
    return this.http.get<IEventRegistration[]>(`${this.apiUrl}/${eventId}/waitlist`);
  }

  // Event Feedback
  submitEventFeedback(eventId: string, feedback: Partial<IEventFeedback>): Observable<IEventFeedback> {
    return this.http.post<IEventFeedback>(`${this.apiUrl}/${eventId}/feedback`, feedback);
  }

  // Event Statistics
  getEventStatistics(eventId: string): Observable<IEventStats> {
    return this.http.get<IEventStats>(`${this.apiUrl}/${eventId}/statistics`);
  }

  getEventParticipants(eventId: string, page: number = 0, size: number = 10): Observable<{ content: IEventRegistration[]; totalElements: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<{ content: IEventRegistration[]; totalElements: number }>(`${this.apiUrl}/${eventId}/participants`, { params });
  }

  // Organization Event Management
  createEvent(event: Partial<IEvent>): Observable<IEvent> {
    return this.http.post<IEvent>(this.apiUrl, event).pipe(
      map(event => ({
        ...event,
        registeredParticipants: new Set(event.registeredParticipants),
        waitlistedParticipants: new Set(event.waitlistedParticipants),
        approvedParticipants: new Set(event.approvedParticipants),
        rejectedParticipants: new Set(event.rejectedParticipants),
        pendingParticipants: new Set(event.pendingParticipants),
        tags: new Set(event.tags),
        resources: new Set(event.resources),
        sponsors: new Set(event.sponsors)
      }))
    );
  }

  updateEvent(id: string, event: Partial<IEvent>): Observable<IEvent> {
    return this.http.put<IEvent>(`${this.apiUrl}/${id}`, event).pipe(
      map(event => ({
        ...event,
        registeredParticipants: new Set(event.registeredParticipants),
        waitlistedParticipants: new Set(event.waitlistedParticipants),
        approvedParticipants: new Set(event.approvedParticipants),
        rejectedParticipants: new Set(event.rejectedParticipants),
        pendingParticipants: new Set(event.pendingParticipants),
        tags: new Set(event.tags),
        resources: new Set(event.resources),
        sponsors: new Set(event.sponsors)
      }))
    );
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Event Status Management
  updateEventStatus(id: string, status: EventStatus): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelEvent(id: string, reason: string): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  // Participant Management
  approveParticipant(eventId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventId}/participants/${userId}/approve`, {});
  }

  rejectParticipant(eventId: string, userId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventId}/participants/${userId}/reject`, { reason });
  }

  // Check-in Management
  checkInParticipant(eventId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventId}/participants/${userId}/check-in`, {});
  }

  checkOutParticipant(eventId: string, userId: string, hoursContributed: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventId}/participants/${userId}/check-out`, { hoursContributed });
  }

  // Statistics and Metrics
  getEventStats(eventId: string): Observable<IEventStats> {
    return this.http.get<IEventStats>(`${this.apiUrl}/${eventId}/stats`);
  }

  getOrganizationEventStats(organizationId: string): Observable<IEventStats> {
    return this.http.get<IEventStats>(`${this.apiUrl}/organization/${organizationId}/stats`);
  }

  // Recurring Events
  createRecurringEvent(event: Partial<IEvent>, pattern: string, endDate: Date): Observable<IEvent[]> {
    return this.http.post<IEvent[]>(`${this.apiUrl}/recurring`, { event, pattern, endDate });
  }

  updateRecurringSeries(seriesId: string, event: Partial<IEvent>): Observable<IEvent[]> {
    return this.http.put<IEvent[]>(`${this.apiUrl}/recurring/${seriesId}`, event);
  }

  cancelRecurringSeries(seriesId: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/recurring/${seriesId}/cancel`, { reason });
  }

  // Utility Methods
  isEventFull(event: IEvent): boolean {
    return event.registeredParticipants.size >= event.maxParticipants;
  }

  canRegister(event: IEvent): boolean {
    return !this.isEventFull(event) && 
           event.status === EventStatus.APPROVED && 
           !event.isCancelled &&
           new Date() < new Date(event.startDate);
  }

  getStatusColor(status: EventStatus): string {
    const statusColors: Record<EventStatus, string> = {
      [EventStatus.PENDING]: 'basic',
      [EventStatus.APPROVED]: 'accent',
      [EventStatus.CANCELLED]: 'warn',
      [EventStatus.COMPLETED]: 'primary',
      [EventStatus.DRAFT]: 'basic',
      [EventStatus.UPCOMING]: 'accent',
      [EventStatus.ONGOING]: 'primary',
      [EventStatus.PUBLISHED]: 'primary'
    };
    return statusColors[status] || 'basic';
  }

  calculateProgress(event: IEvent): number {
    return (event.registeredParticipants.size / event.maxParticipants) * 100;
  }

  isParticipant(event: IEvent, userId: string): boolean {
    return event.registeredParticipants.has(userId);
  }

  isWaitlisted(event: IEvent, userId: string): boolean {
    return event.waitlistedParticipants.has(userId);
  }

  isPending(event: IEvent, userId: string): boolean {
    return event.pendingParticipants.has(userId);
  }

  isApproved(event: IEvent, userId: string): boolean {
    return event.approvedParticipants.has(userId);
  }

  isRejected(event: IEvent, userId: string): boolean {
    return event.rejectedParticipants.has(userId);
  }

  private getUserId(): string | null {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      console.error('User data not found in localStorage');
      return null;
    }
    try {
      const user = JSON.parse(userData);
      return user.id?.toString() || null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getRegisteredEvents(): Observable<IEvent[]> {
    const userId = this.getUserId();
    if (!userId) {
      console.error('User ID not found in localStorage');
      return of([]);
    }
    const headers = new HttpHeaders().set('X-User-ID', userId);
    return this.http.get<IEvent[]>(`${this.apiUrl}/registered`, { headers }).pipe(
      map(events => events.map(event => ({
        ...event,
        registeredParticipants: new Set(event.registeredParticipants),
        waitlistedParticipants: new Set(event.waitlistedParticipants),
        approvedParticipants: new Set(event.approvedParticipants),
        rejectedParticipants: new Set(event.rejectedParticipants),
        pendingParticipants: new Set(event.pendingParticipants),
        tags: new Set(event.tags),
        resources: new Set(event.resources),
        sponsors: new Set(event.sponsors)
      }))),
      catchError(error => {
        console.error('Error fetching registered events:', error);
        return of([]);
      })
    );
  }

  getWaitlistedEvents(): Observable<IEvent[]> {
    const userId = this.getUserId();
    if (!userId) {
      console.error('User ID not found in localStorage');
      return of([]);
    }
    const headers = new HttpHeaders().set('X-User-ID', userId);
    return this.http.get<IEvent[]>(`${this.apiUrl}/waitlist`, { headers }).pipe(
      map(events => events.map(event => ({
        ...event,
        registeredParticipants: new Set(event.registeredParticipants),
        waitlistedParticipants: new Set(event.waitlistedParticipants),
        approvedParticipants: new Set(event.approvedParticipants),
        rejectedParticipants: new Set(event.rejectedParticipants),
        pendingParticipants: new Set(event.pendingParticipants),
        tags: new Set(event.tags),
        resources: new Set(event.resources),
        sponsors: new Set(event.sponsors)
      }))),
      catchError(error => {
        console.error('Error fetching waitlisted events:', error);
        return of([]);
      })
    );
  }
} 