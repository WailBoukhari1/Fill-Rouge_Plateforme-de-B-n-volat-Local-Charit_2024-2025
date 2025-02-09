import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { Event } from '../../../core/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private readonly baseUrl = '/volunteers';

  constructor(private apiService: ApiService) {}

  registerForEvent(eventId: string): Observable<void> {
    return this.apiService.post<void>(`${this.baseUrl}/events/${eventId}/register`, {});
  }

  cancelRegistration(eventId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/events/${eventId}/register`);
  }

  getRegisteredEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.baseUrl}/events/registered`);
  }

  searchBySkill(skill: string): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseUrl}/search/skills/${skill}`);
  }

  searchByLocation(location: string): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseUrl}/search/location/${location}`);
  }
} 