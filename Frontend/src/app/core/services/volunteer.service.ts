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

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface Availability {
  [key: string]: {
    start: string;
    end: string;
  };
}

export interface VolunteerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  profilePicture: string;
  emergencyContact: string;
  emergencyPhone: string;
  skills: string[];
  interests: string[];
  preferredCategories: string[];
  availableDays: string[];
  preferredTimeOfDay: string;
  certifications: string[];
  languages: string[];
  availableForEmergency: boolean;
  receiveNotifications: boolean;
  notificationPreferences: string[];
  profileVisible: boolean;
  totalEventsAttended: number;
  totalVolunteerHours: number;
  averageEventRating: number;
  reliabilityScore: number;
  backgroundChecked: boolean;
  backgroundCheckDate: string;
  backgroundCheckStatus: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  status: string;
  maxHoursPerWeek: number;
  preferredRadius: number;
  joinedAt: string;
  completionPercentage: number;
  impactScore: number;
  references: string[];
}

export interface VolunteerProfileRequest {
  bio: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  preferredCategories: string[];
  skills: string[];
  interests: string[];
  availableDays: string[];
  preferredTimeOfDay: string;
  certifications: string[];
  languages: string[];
  availableForEmergency: boolean;
  receiveNotifications: boolean;
  notificationPreferences: string[];
  profileVisible: boolean;
  profilePicture?: string;
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || 'Server error';
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getProfile(): Observable<VolunteerProfile> {
    return this.http.get<VolunteerProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(profile: VolunteerProfileRequest): Observable<VolunteerProfile> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<VolunteerProfile>(`${this.apiUrl}/profile`, profile, { headers });
  }

  getStatistics(): Observable<VolunteerStatistics> {
    return this.http
      .get<ApiResponse<VolunteerStatistics>>(`${this.apiUrl}/statistics`)
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

  updateAvailability(availability: Availability): Observable<VolunteerProfile> {
    return this.http.put<VolunteerProfile>(`${this.apiUrl}/profile/availability`, availability);
  }

  updateNotificationPreferences(preferences: NotificationPreferences): Observable<VolunteerProfile> {
    return this.http.put<VolunteerProfile>(`${this.apiUrl}/profile/notifications`, preferences);
  }

  uploadProfilePicture(file: File): Observable<VolunteerProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({
      'X-User-ID': this.authService.getCurrentUserId()
    });
    return this.http.post<VolunteerProfile>(`${this.apiUrl}/profile/picture`, formData, { headers });
  }

  getProfilePictureUrl(fileId: string): string {
    if (!fileId) return '';
    return `${environment.apiUrl}/files/${fileId}`;
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

  getBackgroundCheckStatus(): Observable<{ status: string }> {
    return this.http
      .get<ApiResponse<{ status: string }>>(
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

  closeAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/volunteers/me`).pipe(
      catchError((error) => {
        console.error('Error closing account:', error);
        return throwError(() => new Error('Failed to close account'));
      })
    );
  }
}
