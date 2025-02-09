import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event, EventFilters } from '../models/event.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(filters?: EventFilters): Observable<Event[]> {
    let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.skills?.length) params.append('skills', filters.skills.join(','));
      if (filters.radius) params.append('radius', filters.radius.toString());
      url += `?${params.toString()}`;
    }
    return this.http.get<Event[]>(url);
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  registerForEvent(eventId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventId}/register`, {});
  }

  cancelRegistration(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
  }
} 