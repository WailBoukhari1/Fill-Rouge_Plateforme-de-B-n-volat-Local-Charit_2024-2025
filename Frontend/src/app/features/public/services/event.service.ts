import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  registerForEvent(eventId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/register`, { userId });
  }

  saveEvent(eventId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/save`, { userId });
  }

  unsaveEvent(eventId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${eventId}/save/${userId}`);
  }
} 