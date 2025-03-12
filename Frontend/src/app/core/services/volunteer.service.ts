import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface VolunteerProfile {
  id: string;
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
  backgroundChecked: boolean;
  backgroundCheckDate?: Date;
  backgroundCheckStatus: string;
}

export interface VolunteerStatistics {
  // Event Statistics
  totalEventsAttended: number;
  upcomingEvents: number;
  completedEvents: number;
  canceledEvents: number;
  eventsByCategory: { [key: string]: number };

  // Time Statistics
  totalHoursVolunteered: number;
  averageHoursPerEvent: number;
  hoursByMonth: { [key: string]: number };

  // Performance Statistics
  averageRating: number;
  reliabilityScore: number;
  organizationsWorkedWith: number;

  // Growth Statistics
  participationGrowthRate: number;
  hoursGrowthRate: number;

  // Engagement Statistics
  participationByDay: { [key: string]: number };
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

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = environment.apiUrl + '/volunteers';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get volunteer profile
  getProfile(): Observable<VolunteerProfile> {
    return this.http.get<VolunteerProfile>(`${this.apiUrl}/profile`, { withCredentials: true });
  }

  // Update volunteer profile
  updateProfile(profile: Partial<VolunteerProfile>): Observable<VolunteerProfile> {
    return this.http.put<VolunteerProfile>(`${this.apiUrl}/profile`, profile, { withCredentials: true });
  }

  // Get volunteer statistics
  getStatistics(): Observable<VolunteerStatistics> {
    const headers = new HttpHeaders().set('X-User-ID', this.authService.getCurrentUserId());
    return this.http.get<ApiResponse<VolunteerStatistics>>(`${this.apiUrl}/statistics`, { 
      headers,
      withCredentials: true 
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching volunteer statistics:', error);
        // Return default statistics if the API fails
        return of({
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
          participationByDay: {}
        });
      })
    );
  }

  // Get volunteer achievements
  getAchievements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/achievements`);
  }

  // Get volunteer hours
  getVolunteerHours(): Observable<VolunteerHours[]> {
    const headers = new HttpHeaders().set('X-User-ID', this.authService.getCurrentUserId());
    return this.http.get<ApiResponse<VolunteerHours[]>>(`${this.apiUrl}/hours`, { 
      headers,
      withCredentials: true 
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching volunteer hours:', error);
        return of([]);
      })
    );
  }

  // Update volunteer availability
  updateAvailability(availability: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/availability`, availability, { withCredentials: true });
  }

  // Update notification preferences
  updateNotificationPreferences(preferences: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications`, { preferences }, { withCredentials: true });
  }

  // Upload profile picture
  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/profile/picture`, formData, { withCredentials: true });
  }

  // Add certification
  addCertification(certification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/certifications`, certification);
  }

  // Remove certification
  removeCertification(certificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/certifications/${certificationId}`);
  }

  // Get volunteer badges
  getBadges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/badges`);
  }

  // Get background check status
  getBackgroundCheckStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/background-check`);
  }

  // Request background check
  requestBackgroundCheck(): Observable<any> {
    return this.http.post(`${this.apiUrl}/background-check/request`, {});
  }

  // Get volunteer dashboard statistics
  getDashboardStats(): Observable<any> {
    const headers = new HttpHeaders().set('X-User-ID', this.authService.getCurrentUserId());
    return this.http.get(`${this.apiUrl}/dashboard`, { headers });
  }

  // Get volunteer dashboard statistics by date range
  getDashboardStatsByDateRange(startDate: Date, endDate: Date): Observable<any> {
    const headers = new HttpHeaders().set('X-User-ID', this.authService.getCurrentUserId());
    return this.http.get(`${this.apiUrl}/dashboard/range`, {
      headers,
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  }

  // Get volunteer reliability score
  getReliabilityScore(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/reliability-score`);
  }
} 