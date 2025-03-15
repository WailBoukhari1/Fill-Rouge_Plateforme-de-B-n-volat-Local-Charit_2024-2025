import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ApiResponse } from '../models/profile.model';

export interface VolunteerProfile {
  id: string;
  bio: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship?: string;
  };
  preferredCategories: string[];
  skills: string[];
  interests: string[];
  availableDays: string[];
  preferredTimeOfDay: string;
  languages: string[];
  certifications: string[];
  totalEventsAttended: number;
  totalHoursVolunteered: number;
  averageRating: number;
  reliabilityScore: number;
  badges: string[];
  availableForEmergency: boolean;
  receiveNotifications: boolean;
  notificationPreferences: string[];
  profileVisible: boolean;
  backgroundCheck: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
    date?: Date;
    expiryDate?: Date;
  };
}

export interface VolunteerStatistics {
  totalEventsAttended: number;
  upcomingEvents: number;
  completedEvents: number;
  canceledEvents: number;
  eventsByCategory: Record<string, number>;
  totalHoursVolunteered: number;
  averageHoursPerEvent: number;
  hoursByMonth: Record<string, number>;
  averageRating: number;
  reliabilityScore: number;
  organizationsWorkedWith: number;
  participationGrowthRate: number;
  hoursGrowthRate: number;
  participationByDay: Record<string, number>;
}

export interface VolunteerHours {
  id: string;
  eventId: string;
  eventName: string;
  date: Date;
  hours: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedDate: Date;
  category: string;
  level?: string;
  currentPoints: number;
  requiredPoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedDate: Date;
  type: string;
  value: number;
  icon?: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class VolunteerService {
  private readonly apiUrl = `${environment.apiUrl}/volunteers`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getProfile(): Observable<VolunteerProfile> {
    return this.http
      .get<ApiResponse<VolunteerProfile>>(`${this.apiUrl}/profile`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  updateProfile(
    profile: Partial<VolunteerProfile>
  ): Observable<VolunteerProfile> {
    return this.http
      .put<ApiResponse<VolunteerProfile>>(`${this.apiUrl}/profile`, profile)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  getStatistics(): Observable<VolunteerStatistics> {
    return this.http
      .get<ApiResponse<VolunteerStatistics>>(`${this.apiUrl}/stats`)
      .pipe(
        map((response) => response.data),
        catchError(() =>
          of({
            totalEventsAttended: 0,
            upcomingEvents: 0,
            completedEvents: 0,
            canceledEvents: 0,
            eventsByCategory: {},
            totalHoursVolunteered: 0,
            averageHoursPerEvent: 0,
            hoursByMonth: {},
            averageRating: 0,
            reliabilityScore: 0,
            organizationsWorkedWith: 0,
            participationGrowthRate: 0,
            hoursGrowthRate: 0,
            participationByDay: {},
          })
        )
      );
  }

  getVolunteerHours(): Observable<VolunteerHours[]> {
    return this.http
      .get<ApiResponse<VolunteerHours[]>>(`${this.apiUrl}/hours`)
      .pipe(
        map((response) => response.data),
        catchError(() => of([]))
      );
  }

  updateAvailability(availability: {
    availableDays: string[];
    preferredTimeOfDay: string;
    availableForEmergency: boolean;
  }): Observable<VolunteerProfile> {
    return this.http
      .put<ApiResponse<VolunteerProfile>>(
        `${this.apiUrl}/availability`,
        availability
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  updateNotificationPreferences(
    preferences: string[]
  ): Observable<VolunteerProfile> {
    return this.http
      .put<ApiResponse<VolunteerProfile>>(`${this.apiUrl}/notifications`, {
        preferences,
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  uploadProfilePicture(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<{ url: string }>>(
        `${this.apiUrl}/profile/picture`,
        formData
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  addCertification(certification: {
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
  }): Observable<VolunteerProfile> {
    return this.http
      .post<ApiResponse<VolunteerProfile>>(
        `${this.apiUrl}/certifications`,
        certification
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  removeCertification(certificationId: string): Observable<VolunteerProfile> {
    return this.http
      .delete<ApiResponse<VolunteerProfile>>(
        `${this.apiUrl}/certifications/${certificationId}`
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  getAchievements(): Observable<Achievement[]> {
    return this.http
      .get<ApiResponse<Achievement[]>>(`${this.apiUrl}/achievements`)
      .pipe(
        map((response) => response.data),
        catchError(() => of([]))
      );
  }

  getBadges(): Observable<Badge[]> {
    return this.http.get<ApiResponse<Badge[]>>(`${this.apiUrl}/badges`).pipe(
      map((response) => response.data),
      catchError(() => of([]))
    );
  }

  getBackgroundCheckStatus(): Observable<VolunteerProfile['backgroundCheck']> {
    return this.http
      .get<ApiResponse<VolunteerProfile['backgroundCheck']>>(
        `${this.apiUrl}/background-check`
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  requestBackgroundCheck(): Observable<VolunteerProfile> {
    return this.http
      .post<ApiResponse<VolunteerProfile>>(
        `${this.apiUrl}/background-check/request`,
        {}
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${
        error.error?.message || error.statusText
      }`;
    }

    console.error('VolunteerService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
