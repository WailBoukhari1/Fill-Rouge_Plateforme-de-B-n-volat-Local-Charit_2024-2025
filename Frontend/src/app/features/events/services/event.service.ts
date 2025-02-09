import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Event, EventRequest, EventFilters } from '../../../core/models/event.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: EventRequest): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: string, event: EventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  registerForEvent(eventId: string): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/register`, {});
  }

  getEvents(filters?: EventFilters): Observable<Event[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.location) queryParams.set('location', filters.location);
      if (filters.skills) queryParams.set('skills', filters.skills.join(','));
      if (filters.radius) queryParams.set('radius', filters.radius.toString());
    }
    const url = `${this.apiUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get<ApiResponse<Event[]>>(url)
      .pipe(map(response => response.data));
  }

  getEventsByOrganization(organizationId: string): Observable<Event[]> {
    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/organization/${organizationId}`)
      .pipe(map(response => response.data));
  }

  publishEvent(id: string): Observable<Event> {
    return this.http.patch<ApiResponse<Event>>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(map(response => response.data));
  }

  cancelEvent(id: string): Observable<Event> {
    return this.http.patch<ApiResponse<Event>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(map(response => response.data));
  }

  cancelRegistration(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/register`)
      .pipe(map(response => response.data));
  }

  searchEvents(params: { location?: string; skills?: string[]; radius?: number }): Observable<Event[]> {
    const queryParams = new URLSearchParams();
    if (params.location) queryParams.set('location', params.location);
    if (params.skills) queryParams.set('skills', params.skills.join(','));
    if (params.radius) queryParams.set('radius', params.radius.toString());

    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/search?${queryParams}`)
      .pipe(map(response => response.data));
  }
}