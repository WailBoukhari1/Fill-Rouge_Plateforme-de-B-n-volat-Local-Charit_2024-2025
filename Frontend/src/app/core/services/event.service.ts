import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Event, 
  EventStats, 
  EventFeedback, 
  EventRegistration,
  EventFilters,
  EventStatus 
} from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  // Public Event Endpoints
  getEvents(filters: EventFilters, page: number = 0, size: number = 10): Observable<any> {
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

    return this.http.get<any>(this.apiUrl, { params });
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // Event Registration
  registerForEvent(eventId: string): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.apiUrl}/${eventId}/register`, {});
  }

  unregisterFromEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
  }

  // Waitlist Management
  joinWaitlist(eventId: string): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.apiUrl}/${eventId}/waitlist`, {});
  }

  leaveWaitlist(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/waitlist`);
  }

  getWaitlistPosition(eventId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${eventId}/waitlist/position`);
  }

  // Feedback Management
  submitFeedback(eventId: string, feedback: Partial<EventFeedback>): Observable<EventFeedback> {
    return this.http.post<EventFeedback>(`${this.apiUrl}/${eventId}/feedback`, feedback);
  }

  getFeedback(eventId: string, volunteerId: string): Observable<EventFeedback> {
    return this.http.get<EventFeedback>(`${this.apiUrl}/${eventId}/feedback/${volunteerId}`);
  }

  // Organization Event Management
  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Event Status Management
  updateEventStatus(id: string, status: EventStatus): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelEvent(id: string, reason: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  // Participant Management
  getEventParticipants(eventId: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/${eventId}/participants`, { params });
  }

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
  getEventStats(eventId: string): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/${eventId}/stats`);
  }

  getOrganizationEventStats(organizationId: string): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/organization/${organizationId}/stats`);
  }

  // Recurring Events
  createRecurringEvent(event: Partial<Event>, pattern: string, endDate: Date): Observable<Event[]> {
    return this.http.post<Event[]>(`${this.apiUrl}/recurring`, { event, pattern, endDate });
  }

  updateRecurringSeries(seriesId: string, event: Partial<Event>): Observable<Event[]> {
    return this.http.put<Event[]>(`${this.apiUrl}/recurring/${seriesId}`, event);
  }

  cancelRecurringSeries(seriesId: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/recurring/${seriesId}/cancel`, { reason });
  }

  // Utility Methods
  isEventFull(event: Event): boolean {
    return event.registeredParticipants.size >= event.maxParticipants;
  }

  canRegister(event: Event): boolean {
    return !this.isEventFull(event) && 
           event.status === EventStatus.UPCOMING && 
           !event.isCancelled &&
           new Date(event.registrationDeadline) > new Date();
  }

  getStatusColor(status: EventStatus): string {
    const statusColors: { [key in EventStatus]: string } = {
      [EventStatus.DRAFT]: 'basic',
      [EventStatus.PENDING]: 'accent',
      [EventStatus.UPCOMING]: 'primary',
      [EventStatus.ONGOING]: 'primary',
      [EventStatus.COMPLETED]: 'basic',
      [EventStatus.CANCELLED]: 'warn'
    };
    return statusColors[status] || 'basic';
  }

  calculateProgress(event: Event): number {
    return (event.registeredParticipants.size / event.maxParticipants) * 100;
  }

  isParticipant(event: Event, userId: string): boolean {
    return event.registeredParticipants.has(userId);
  }

  isWaitlisted(event: Event, userId: string): boolean {
    return event.waitlistedParticipants.has(userId);
  }

  isPending(event: Event, userId: string): boolean {
    return event.pendingParticipants.has(userId);
  }

  isApproved(event: Event, userId: string): boolean {
    return event.approvedParticipants.has(userId);
  }

  isRejected(event: Event, userId: string): boolean {
    return event.rejectedParticipants.has(userId);
  }
} 