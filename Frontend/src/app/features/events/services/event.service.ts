import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Event, EventRequest, EventFilters, EventResponse } from '../../../core/models/event.model';

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

  getAllEvents(filters?: EventFilters): Observable<EventResponse[]> {
    let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.skills?.length) params.append('skills', filters.skills.join(','));
      if (filters.radius) params.append('radius', filters.radius.toString());
      url += `?${params.toString()}`;
    }
    return this.http.get<ApiResponse<EventResponse[]>>(url).pipe(
      map(response => response.data)
    );
  }

  getEvent(id: string): Observable<EventResponse> {
    return this.http.get<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createEvent(event: EventRequest): Observable<EventResponse> {
    return this.http.post<ApiResponse<EventResponse>>(this.apiUrl, event).pipe(
      map(response => response.data)
    );
  }

  updateEvent(id: string, event: EventRequest): Observable<EventResponse> {
    return this.http.put<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}`, event).pipe(
      map(response => response.data)
    );
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  registerForEvent(eventId: string): Observable<EventResponse> {
    return this.http.post<ApiResponse<EventResponse>>(`${this.apiUrl}/${eventId}/register`, {}).pipe(
      map(response => response.data)
    );
  }

  getEvents(filters?: EventFilters): Observable<EventResponse[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.location) queryParams.set('location', filters.location);
      if (filters.skills) queryParams.set('skills', filters.skills.join(','));
      if (filters.radius) queryParams.set('radius', filters.radius.toString());
    }
    const url = `${this.apiUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get<ApiResponse<EventResponse[]>>(url)
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