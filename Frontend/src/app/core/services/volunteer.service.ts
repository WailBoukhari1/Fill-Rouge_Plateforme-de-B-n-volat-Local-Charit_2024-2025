import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = `${environment.apiUrl}/volunteers`;

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
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  // Get volunteer achievements
  getAchievements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/achievements`);
  }

  // Get volunteer hours
  getVolunteerHours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hours`);
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
} 