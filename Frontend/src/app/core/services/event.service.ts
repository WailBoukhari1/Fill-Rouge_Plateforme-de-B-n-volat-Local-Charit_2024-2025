import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Event, EventRequest, EventSearchParams, EventResponse } from '../models/event.model';
import { Page } from '../models/page.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getAllEvents(params: { page: number; size: number }): Observable<Page<Event>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    return this.http.get<ApiResponse<Page<Event>>>(this.apiUrl, { params: httpParams })
      .pipe(
        map((response: ApiResponse<Page<Event>>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch events');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error getting events:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to fetch events');
        })
      );
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: ApiResponse<Event>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch event');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error getting event:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to fetch event');
        })
      );
  }

  createEvent(event: EventRequest): Observable<Event> {
    return this.http.post<ApiResponse<Event>>(this.apiUrl, event)
      .pipe(
        map((response: ApiResponse<Event>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to create event');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error creating event:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to create event');
        })
      );
  }

  updateEvent(id: string, event: Partial<EventRequest>): Observable<Event> {
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/${id}`, event)
      .pipe(
        map((response: ApiResponse<Event>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to update event');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error updating event:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to update event');
        })
      );
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: ApiResponse<void>) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete event');
          }
        }),
        catchError(error => {
          console.error('Error deleting event:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to delete event');
        })
      );
  }

  registerForEvent(eventId: string): Observable<Event> {
    return this.http.post<ApiResponse<Event>>(`${this.apiUrl}/${eventId}/register`, {})
      .pipe(
        map((response: ApiResponse<Event>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to register for event');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error registering for event:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to register for event');
        })
      );
  }

  searchEvents(params: EventSearchParams): Observable<Page<Event>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => httpParams = httpParams.append(key, v));
        } else {
          httpParams = httpParams.append(key, value.toString());
        }
      }
    });

    return this.http.get<ApiResponse<Page<Event>>>(`${this.apiUrl}/search`, { params: httpParams })
      .pipe(
        map((response: ApiResponse<Page<Event>>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to search events');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error searching events:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to search events');
        })
      );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/categories`)
      .pipe(
        tap((response: ApiResponse<string[]>) => console.log('Categories response:', response)),
        map((response: ApiResponse<string[]>) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch categories');
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error getting categories:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to fetch categories');
        })
      );
  }

  cancelRegistration(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}/register`)
      .pipe(
        tap((response: ApiResponse<void>) => console.log('Cancel registration response:', response)),
        map((response: ApiResponse<void>) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to cancel registration');
          }
        }),
        catchError(error => {
          console.error('Error canceling registration:', error);
          return throwError(() => error?.error?.message || error?.message || 'Failed to cancel registration');
        })
      );
  }
} 