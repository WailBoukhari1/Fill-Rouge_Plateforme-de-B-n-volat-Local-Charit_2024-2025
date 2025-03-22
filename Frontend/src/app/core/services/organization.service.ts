import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpRequest,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, map, catchError, throwError, tap, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Organization,
  OrganizationType,
  OrganizationCategory,
  OrganizationDocument,
  DocumentType,
  OrganizationProfile,
  OrganizationRequest,
  OrganizationResponse,
  SocialMediaLinks,
  ApiResponse,
} from '../models/organization.model';
import { Page } from '../models/page.model';
import { IEvent } from '../models/event.types';
import { AuthService } from './auth.service';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ImpactMetrics {
  peopleServed: number;
  fundsRaised: number;
  projectsCompleted: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // For admin and management views that need full organization details
  getOrganizationsDetailed(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<Organization>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('detailed', 'true');

    return this.http.get<PaginatedResponse<Organization>>(this.apiUrl, {
      params,
    });
  }

  // For public views that only need profile information
  getOrganizations(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<OrganizationProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrganizationProfile>>(this.apiUrl, {
      params,
    });
  }

  // Get detailed organization information
  getOrganizationDetailed(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}/detailed`);
  }

  // Get organization profile information
  getOrganization(id: string): Observable<ApiResponse<OrganizationProfile>> {
    console.log(`OrganizationService: Fetching organization with ID: ${id}, endpoint: ${this.apiUrl}/${id}`);
    return this.http.get<ApiResponse<OrganizationProfile>>(
      `${this.apiUrl}/${id}`
    ).pipe(
      tap(response => console.log('OrganizationService: getOrganization response:', response)),
      catchError(error => {
        console.error('OrganizationService: Error fetching organization:', error);
        return throwError(() => error);
      })
    );
  }

  getOrganizationByUserId(userId: string): Observable<OrganizationProfile> {
    console.log(`OrganizationService: Fetching organization by user ID: ${userId}, endpoint: ${this.apiUrl}/user/${userId}`);
    return this.http.get<OrganizationProfile>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(response => console.log('OrganizationService: getOrganizationByUserId response:', response)),
      catchError(error => {
        console.error('OrganizationService: Error fetching organization by user ID:', error);
        return throwError(() => error);
      })
    );
  }

  createOrganization(
    request: OrganizationRequest
  ): Observable<OrganizationProfile> {
    return this.http.post<OrganizationResponse>(this.apiUrl, request);
  }

  updateOrganization(
    id: string,
    data: OrganizationRequest
  ): Observable<{ data: OrganizationProfile }> {
    // Get token from auth service
    const token = this.authService.getToken();
    
    // Set headers with authorization
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    
    // Log request details
    console.log('Updating organization with ID:', id);
    console.log('Using token:', token ? 'Token exists' : 'No token');
    
    // Make the update request directly
    // No need to get current org first which causes the error
    return this.http.put<{ data: OrganizationProfile }>(
      `${this.apiUrl}/${id}`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('Update successful:', response)),
      catchError(error => {
        console.error('Error updating organization:', error);
        // Handle specific error cases
        if (error.status === 403) {
          console.error('Authentication error - user may not have permission');
        } else if (error.status === 400) {
          console.error('Validation error:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchOrganizations(query: string): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/search`, {
      params: { query },
    });
  }

  findByFocusAreas(areas: string[]): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/focus-areas`, {
      params: { areas: areas.join(',') },
    });
  }

  findNearbyOrganizations(
    latitude: number,
    longitude: number,
    radius: number
  ): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/nearby`, {
      params: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      },
    });
  }

  findByCity(city: string): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/city/${city}`);
  }

  findByCountry(country: string): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(
      `${this.apiUrl}/country/${country}`
    );
  }

  findByMinimumRating(minRating: number): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/rating`, {
      params: { minRating: minRating.toString() },
    });
  }

  findAcceptingVolunteers(): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(
      `${this.apiUrl}/accepting-volunteers`
    );
  }

  verifyOrganization(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/verify`, {});
  }

  addDocument(organizationId: string, documentId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${organizationId}/documents`,
      { documentUrl: documentId }
    );
  }

  removeDocument(id: string, documentUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/documents`, {
      params: { documentUrl },
    });
  }

  setAcceptingVolunteers(id: string, accepting: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/accepting-volunteers`, {
      accepting,
    });
  }

  // Suspend organization
  suspendOrganization(id: string, reason: string): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/${id}/suspend`, {
      reason,
    });
  }

  // Reactivate organization
  reactivateOrganization(id: string): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/${id}/reactivate`, {});
  }

  // Get organization events
  getOrganizationEvents(
    organizationId: string,
    page: number = 0,
    size: number = 10,
    status?: string
  ): Observable<Page<IEvent>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    console.log('Making request with organizationId:', organizationId);
    console.log('Current user ID:', this.authService.getCurrentUserId());

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getToken()}`,
      'X-Organization-ID': organizationId,
      'X-User-ID': this.authService.getCurrentUserId() || '',
    });

    return this.http
      .get<ApiResponse<IEvent[]>>(
        `${environment.apiUrl}/events/organization/${organizationId}`,
        {
          params,
          headers,
        }
      )
      .pipe(
        map((response) => {
          console.log('Raw API response:', response);
          // Map each event to ensure all required properties are present
          const events = Array.isArray(response.data)
            ? response.data.map((event) => ({
                ...event,
                _id: event.id || event._id,
                currentParticipants: event.currentParticipants || 0,
                registeredParticipants: event.registeredParticipants || [],
                waitlistedParticipants: event.waitlistedParticipants || [],
                startDate: event.startDate
                  ? new Date(event.startDate)
                  : new Date(),
                endDate: event.endDate ? new Date(event.endDate) : new Date(),
              }))
            : [];

          const meta = response.meta || {
            page: 0,
            size: events.length,
            totalElements: events.length,
            totalPages: 1,
          };

          return {
            content: events,
            totalElements: meta.totalElements,
            totalPages: meta.totalPages,
            size: meta.size,
            number: meta.page,
            first: meta.page === 0,
            last: meta.page === meta.totalPages - 1,
            empty: events.length === 0,
          };
        }),
        catchError((error) => {
          console.error('Error fetching events:', error);
          return throwError(() => error);
        })
      );
  }

  // Get organization volunteers
  getOrganizationVolunteers(
    organizationId: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/${organizationId}/volunteers`, {
      params,
    });
  }

  // Upload organization logo
  uploadLogo(
    id: string,
    file: File
  ): Observable<{ data: OrganizationProfile }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ data: OrganizationProfile }>(
      `${this.apiUrl}/${id}/logo`,
      formData
    );
  }

  uploadProfilePicture(organizationId: string, formData: FormData): Observable<OrganizationResponse> {
    console.log('Uploading profile picture for organization:', organizationId);
    return this.http.post<OrganizationResponse>(
      `${this.apiUrl}/${organizationId}/profile-picture`,
      formData
    ).pipe(
      tap(response => console.log('Upload response:', response)),
      catchError(error => {
        console.error('Upload error:', error);
        return throwError(() => error);
      })
    );
  }

  // Document management
  uploadDocument(
    id: string,
    file: File,
    type: DocumentType
  ): Observable<{ data: OrganizationDocument }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    return this.http.post<{ data: OrganizationDocument }>(
      `${this.apiUrl}/${id}/documents`,
      formData
    );
  }

  getDocuments(organizationId: string): Observable<OrganizationDocument[]> {
    return this.http.get<OrganizationDocument[]>(
      `${this.apiUrl}/${organizationId}/documents`
    );
  }

  deleteDocument(id: string, documentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}/documents/${documentId}`
    );
  }

  // Impact metrics
  updateImpactMetrics(
    organizationId: string,
    metrics: Partial<ImpactMetrics>
  ): Observable<Organization> {
    return this.http.put<Organization>(
      `${this.apiUrl}/${organizationId}/impact-metrics`,
      metrics
    );
  }

  getImpactMetrics(organizationId: string): Observable<ImpactMetrics> {
    return this.http.get<ImpactMetrics>(
      `${this.apiUrl}/${organizationId}/impact-metrics`
    );
  }
}
