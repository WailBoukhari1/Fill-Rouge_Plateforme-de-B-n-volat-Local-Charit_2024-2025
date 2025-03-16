import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpRequest,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
} from '../models/organization.model';
import { OrganizationStats } from '../../store/organization/organization.types';

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

  constructor(private http: HttpClient) {}

  // For admin and management views that need full organization details
  getOrganizationsDetailed(page: number = 0, size: number = 10): Observable<PaginatedResponse<Organization>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('detailed', 'true');

    return this.http.get<PaginatedResponse<Organization>>(this.apiUrl, { params });
  }

  // For public views that only need profile information
  getOrganizations(page: number = 0, size: number = 10): Observable<PaginatedResponse<OrganizationProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrganizationProfile>>(this.apiUrl, { params });
  }

  // Get detailed organization information
  getOrganizationDetailed(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}/detailed`);
  }

  // Get organization profile information
  getOrganization(id: string): Observable<OrganizationProfile> {
    return this.http.get<OrganizationProfile>(`${this.apiUrl}/${id}`);
  }

  createOrganization(request: OrganizationRequest): Observable<OrganizationProfile> {
    return this.http.post<OrganizationResponse>(this.apiUrl, request);
  }

  updateOrganization(id: string, request: OrganizationRequest): Observable<OrganizationProfile> {
    return this.http.put<OrganizationResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchOrganizations(query: string): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/search`, {
      params: { query }
    });
  }

  findByFocusAreas(areas: string[]): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/focus-areas`, {
      params: { areas: areas.join(',') }
    });
  }

  findNearbyOrganizations(latitude: number, longitude: number, radius: number): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/nearby`, {
      params: { latitude: latitude.toString(), longitude: longitude.toString(), radius: radius.toString() }
    });
  }

  findByCity(city: string): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/city/${city}`);
  }

  findByCountry(country: string): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/country/${country}`);
  }

  findByMinimumRating(minRating: number): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/rating`, {
      params: { minRating: minRating.toString() }
    });
  }

  findAcceptingVolunteers(): Observable<OrganizationProfile[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/accepting-volunteers`);
  }

  verifyOrganization(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/verify`, {});
  }

  addDocument(id: string, documentUrl: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/documents`, { documentUrl });
  }

  removeDocument(id: string, documentUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/documents`, {
      params: { documentUrl }
    });
  }

  setAcceptingVolunteers(id: string, accepting: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/accepting-volunteers`, { accepting });
  }

  // Get organization statistics
  getOrganizationStats(organizationId: string): Observable<OrganizationStats> {
    return this.http.get<OrganizationStats>(
      `${this.apiUrl}/${organizationId}/stats`
    );
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
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any>(`${this.apiUrl}/${organizationId}/events`, {
      params,
    });
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
  uploadLogo(id: string, file: File): Observable<Organization> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<Organization>(`${this.apiUrl}/${id}/logo`, formData);
  }

  // Document management
  uploadDocument(
    organizationId: string,
    file: File,
    type: DocumentType
  ): Observable<HttpEvent<OrganizationDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const req = new HttpRequest(
      'POST',
      `${this.apiUrl}/${organizationId}/documents`,
      formData,
      {
        reportProgress: true,
      }
    );

    return this.http.request(req);
  }

  getDocuments(organizationId: string): Observable<OrganizationDocument[]> {
    return this.http.get<OrganizationDocument[]>(
      `${this.apiUrl}/${organizationId}/documents`
    );
  }

  deleteDocument(organizationId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${organizationId}/documents/${documentId}`
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
