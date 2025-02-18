import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  totalEventsAttended: number;
  totalHoursVolunteered: number;
  averageRating: number;
  reliabilityScore: number;
  badges: string[];
  upcomingEvents: number;
  completedEvents: number;
  canceledEvents: number;
  achievementsEarned: number;
  impactMetrics: {
    peopleServed: number;
    projectsCompleted: number;
    skillsLearned: number;
  };
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

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = `${environment.apiUrl}/api/volunteers`;

  constructor(private http: HttpClient) {}

  // Get volunteer profile
  getProfile(): Observable<VolunteerProfile> {
    return this.http.get<VolunteerProfile>(`${this.apiUrl}/profile`);
  }

  // Update volunteer profile
  updateProfile(profile: Partial<VolunteerProfile>): Observable<VolunteerProfile> {
    return this.http.put<VolunteerProfile>(`${this.apiUrl}/profile`, profile);
  }

  // Get volunteer statistics
  getStatistics(): Observable<VolunteerStatistics> {
    return this.http.get<VolunteerStatistics>(`${this.apiUrl}/statistics`).pipe(
      catchError(error => {
        console.error('Error fetching volunteer statistics:', error);
        // Return default statistics if the API fails
        return of({
          totalEventsAttended: 0,
          totalHoursVolunteered: 0,
          averageRating: 0,
          reliabilityScore: 0,
          badges: [],
          upcomingEvents: 0,
          completedEvents: 0,
          canceledEvents: 0,
          achievementsEarned: 0,
          impactMetrics: {
            peopleServed: 0,
            projectsCompleted: 0,
            skillsLearned: 0
          }
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
    return this.http.get<VolunteerHours[]>(`${this.apiUrl}/hours`).pipe(
      catchError(error => {
        console.error('Error fetching volunteer hours:', error);
        return of([]);
      })
    );
  }

  // Update volunteer availability
  updateAvailability(availability: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/availability`, availability);
  }

  // Update notification preferences
  updateNotificationPreferences(preferences: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications`, { preferences });
  }

  // Upload profile picture
  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/profile/picture`, formData);
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
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  // Get volunteer dashboard statistics by date range
  getDashboardStatsByDateRange(startDate: Date, endDate: Date): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/range`, {
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