import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../models/api-response.model';
import { 
  IVolunteer, 
  IVolunteerActivity, 
  IVolunteerFilters, 
  VolunteerStatus 
} from '../models/volunteer.types';
import { 
  IOrganizationVolunteer,
  VolunteerRole 
} from '../models/organization-volunteer.types';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  isActive: boolean;
  status: string;
  maxHoursPerWeek: number;
  preferredRadius: number;
  joinedAt: string;
  completionPercentage: number;
  impactScore: number;
  references: string[];
  userId: number;
  approved?: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  banned?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
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

export interface VolunteerSearchResponse {
  volunteers: VolunteerProfile[];
  total: number;
  page: number;
  size: number;
}

export interface VolunteerSearchParams {
  query?: string;
  location?: string;
  skills?: string[];
  availability?: string[];
  experienceLevel?: string;
  languages?: string[];
  certifications?: string[];
  reliabilityScore?: number;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class VolunteerService {
  private readonly apiUrl = `${environment.apiUrl}/volunteers`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const organizationId = localStorage.getItem('organizationId');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (userId) {
      headers = headers.set('X-User-ID', userId);
    }
    if (organizationId) {
      headers = headers.set('X-Organization-ID', organizationId);
    }

    return headers;
  }

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
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
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

  /** Get volunteer statistics */
  getStatistics(): Observable<any> {
    // Get the user ID from the auth service
    const userId = this.authService.getCurrentUserId();
    
    console.log(`Fetching statistics for userId: ${userId}`);
    
    // Call the correct endpoint with the user ID
    return this.http.get<any>(`${this.apiUrl}/stats/volunteer/${userId}`).pipe(
      tap(stats => console.log('Volunteer statistics retrieved successfully:', stats)),
      catchError(error => {
        console.error('Error fetching volunteer statistics:', error);
        // Return a default empty stats object instead of throwing an error
        return of({
          totalEventsParticipated: 0,
          activeEvents: 0,
          completedEvents: 0,
          registeredEvents: 0,
          totalVolunteerHours: 0,
          reliabilityScore: 0,
          averageEventRating: 0,
          skillsEndorsements: 0,
          hoursContributed: [],
          eventsParticipation: [],
          eventsByCategory: {},
          peopleImpacted: 0,
          organizationsSupported: 0,
          impactByCategory: {}
        });
      })
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

  searchVolunteers(params: VolunteerSearchParams): Observable<VolunteerSearchResponse> {
    let httpParams = new HttpParams();
    
    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.skills?.length) httpParams = httpParams.set('skills', params.skills.join(','));
    if (params.availability?.length) httpParams = httpParams.set('availability', params.availability.join(','));
    if (params.experienceLevel) httpParams = httpParams.set('experienceLevel', params.experienceLevel);
    if (params.languages?.length) httpParams = httpParams.set('languages', params.languages.join(','));
    if (params.certifications?.length) httpParams = httpParams.set('certifications', params.certifications.join(','));
    if (params.reliabilityScore) httpParams = httpParams.set('reliabilityScore', params.reliabilityScore.toString());
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<VolunteerSearchResponse>(`${this.apiUrl}/search`, { params: httpParams });
  }

  getOrganizationVolunteers(
    organizationId: string,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<IOrganizationVolunteer[]> {
    console.log('Getting volunteers for organization:', organizationId);
    console.log('Headers:', this.getHeaders().keys());

    const params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.http.get<IOrganizationVolunteer[] | ApiResponse<IOrganizationVolunteer[]>>(
      `${environment.apiUrl}/organizations/${organizationId}/volunteers`,
      {
        headers: this.getHeaders(),
        params
      }
    ).pipe(
      map(response => {
        console.log('Raw response:', response);
        // Check if response is an array (direct response) or ApiResponse wrapper
        if (Array.isArray(response)) {
          return response;
        }
        // If it's an ApiResponse wrapper
        if ('success' in response) {
          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch volunteers');
          }
          return response.data;
        }
        // If response is neither an array nor ApiResponse, throw error
        throw new Error('Invalid response format');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getVolunteerDetails(volunteerId: string): Observable<IVolunteer> {
    return this.http.get<IVolunteer>(`${this.apiUrl}/${volunteerId}`);
  }

  getVolunteerActivities(volunteerId: string): Observable<IVolunteerActivity[]> {
    return this.http.get<IVolunteerActivity[]>(`${this.apiUrl}/${volunteerId}/activities`);
  }

  updateVolunteerStatus(
    organizationId: string,
    volunteerId: string,
    status: string
  ): Observable<IOrganizationVolunteer> {
    return this.http.patch<ApiResponse<IOrganizationVolunteer>>(
      `${this.apiUrl}/organization/${organizationId}/volunteer/${volunteerId}/status`,
      { status },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update volunteer status');
        }
        return response.data;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateVolunteerRole(
    organizationId: string,
    volunteerId: string,
    role: string
  ): Observable<IOrganizationVolunteer> {
    return this.http.patch<ApiResponse<IOrganizationVolunteer>>(
      `${this.apiUrl}/organization/${organizationId}/volunteer/${volunteerId}/role`,
      { role },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update volunteer role');
        }
        return response.data;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  removeVolunteerFromOrganization(
    organizationId: string,
    volunteerId: string
  ): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/organization/${organizationId}/volunteer/${volunteerId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to remove volunteer');
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  addVolunteerFeedback(
    volunteerId: string, 
    eventId: string, 
    feedback: string, 
    rating?: number
  ): Observable<IVolunteerActivity> {
    return this.http.post<IVolunteerActivity>(
      `${this.apiUrl}/${volunteerId}/events/${eventId}/feedback`,
      { feedback, rating }
    );
  }

  removeVolunteer(volunteerId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${volunteerId}`);
  }

  private buildFilterParams(filters?: IVolunteerFilters): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    if (!filters) return params;

    if (filters.searchTerm) params['search'] = filters.searchTerm;
    if (filters.status) params['status'] = filters.status;
    if (filters.skills?.length) params['skills'] = filters.skills.join(',');
    if (filters.sortBy) {
      params['sortBy'] = filters.sortBy;
      params['sortOrder'] = filters.sortOrder || 'asc';
    }

    return params;
  }

  approveVolunteer(volunteerId: string): Observable<any> {
    return this.http
      .patch<any>(
        `${this.apiUrl}/${volunteerId}/approve`,
        {}
      )
      .pipe(
        catchError(error => {
          console.error('Error approving volunteer:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to approve volunteer'));
        })
      );
  }

  rejectVolunteer(volunteerId: string, reason: string): Observable<any> {
    return this.http
      .patch<any>(
        `${this.apiUrl}/${volunteerId}/reject`,
        {},
        { 
          params: { reason } 
        }
      )
      .pipe(
        catchError(error => {
          console.error('Error rejecting volunteer:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to reject volunteer'));
        })
      );
  }

  banVolunteer(volunteerId: string, reason: string): Observable<any> {
    return this.http
      .patch<any>(
        `${this.apiUrl}/${volunteerId}/ban`,
        {},
        { 
          params: { reason } 
        }
      )
      .pipe(
        catchError(error => {
          console.error('Error banning volunteer:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to ban volunteer'));
        })
      );
  }

  unbanVolunteer(volunteerId: string): Observable<any> {
    return this.http
      .patch<any>(
        `${this.apiUrl}/${volunteerId}/unban`,
        {}
      )
      .pipe(
        catchError(error => {
          console.error('Error unbanning volunteer:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to unban volunteer'));
        })
      );
  }

  /**
   * Get the volunteer profile for the current user
   */
  getVolunteerProfile(): Observable<VolunteerProfile> {
    return this.http.get<VolunteerProfile>(`${this.apiUrl}/me`).pipe(
      map(profile => this.ensureValidVolunteerProfile(profile))
    );
  }
  
  /**
   * Get a volunteer profile by ID (admin only)
   */
  getVolunteerById(id: number): Observable<VolunteerProfile> {
    return this.http.get<VolunteerProfile>(`${this.apiUrl}/${id}`).pipe(
      map(profile => this.ensureValidVolunteerProfile(profile))
    );
  }
  
  /**
   * Get all volunteers with filtering options
   */
  getAllVolunteers(page: number, size: number, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.skills && filters.skills.length) {
        filters.skills.forEach((skill: string) => {
          params = params.append('skills', skill);
        });
      }
    }
    
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }
  
  /**
   * Get pending volunteer approvals (admin only)
   */
  getPendingVolunteers(page: number, size: number): Observable<any> {
    return this.getAllVolunteers(page, size, { status: 'PENDING' });
  }
  
  /**
   * Create or update volunteer profile
   */
  updateVolunteerProfile(profile: Partial<VolunteerProfile>): Observable<VolunteerProfile> {
    // Remove firstName, lastName, and email fields as they come from User entity
    const { firstName, lastName, email, ...profileData } = profile;
    
    // Create sanitized profile without the User fields
    const sanitizedProfile = {
      ...profileData,
    };
    
    return this.http.put<VolunteerProfile>(`${this.apiUrl}/me`, sanitizedProfile).pipe(
      map(profile => this.ensureValidVolunteerProfile(profile))
    );
  }
  
  /**
   * Get volunteer events (participations)
   */
  getVolunteerEvents(page: number, size: number, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<any>(`${this.apiUrl}/me/events`, { params });
  }
  
  /**
   * Get volunteer participation for a specific event
   */
  getVolunteerEventParticipation(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/events/${eventId}`);
  }
  
  /**
   * Check if volunteer profile is complete and approved
   */
  isProfileCompleteAndApproved(): Observable<{ complete: boolean; approved: boolean; status: string }> {
    return this.http.get<{ complete: boolean; approved: boolean; status: string }>(
      `${this.apiUrl}/me/status`
    );
  }

  // Ensure valid volunteer profile with proper defaults
  ensureValidVolunteerProfile(profile: any): VolunteerProfile {
    console.log('Processing volunteer profile from API:', profile);
    
    // Check if phone number exists
    if (!profile.phoneNumber || profile.phoneNumber === '') {
      console.log('Phone number missing from volunteer profile');
    } else {
      console.log('Phone number found in volunteer profile:', profile.phoneNumber);
    }
    
    // Check all possible sources for phone number
    if (profile.user && profile.user.phoneNumber) {
      console.log('Found phone number in user object:', profile.user.phoneNumber);
    }
    
    // Note: firstName, lastName, and email come exclusively from User entity
    // Email is not stored in VolunteerProfile table to avoid duplication
    const processedProfile = {
      ...profile,
      id: profile.id || profile._id || '',
      firstName: profile.firstName || profile.user?.firstName || '', // From User entity 
      lastName: profile.lastName || profile.user?.lastName || '',   // From User entity
      email: profile.email || profile.user?.email || '',         // From User entity - not stored in VolunteerProfile
      phoneNumber: profile.phoneNumber || profile.user?.phoneNumber || '',  // Try user object as fallback
      address: profile.address || '',
      city: profile.city || '',
      country: profile.country || '',
      bio: profile.bio || '',
      profilePicture: profile.profilePicture || '',
      emergencyContact: profile.emergencyContact || '',
      emergencyPhone: profile.emergencyPhone || '',
      // Ensure array fields are never null
      skills: profile.skills || [],
      interests: profile.interests || [],
      preferredCategories: profile.preferredCategories || [],
      availableDays: profile.availableDays || [],
      notificationPreferences: profile.notificationPreferences || []
    } as VolunteerProfile;
    
    console.log('Processed volunteer profile:', processedProfile);
    return processedProfile;
  }
}
