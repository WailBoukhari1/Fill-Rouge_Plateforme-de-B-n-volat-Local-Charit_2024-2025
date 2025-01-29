import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { Event } from '../../../core/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly baseUrl = '/events';

  constructor(private apiService: ApiService) {}

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.apiService.post<Event>(this.baseUrl, event);
  }

  getEvent(id: string): Observable<Event> {
    return this.apiService.get<Event>(`${this.baseUrl}/${id}`);
  }

  getAllEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(this.baseUrl);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.apiService.put<Event>(`${this.baseUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchEvents(params: { location?: string; skills?: string[]; radius?: number }): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.baseUrl}/search`, params);
  }
} 