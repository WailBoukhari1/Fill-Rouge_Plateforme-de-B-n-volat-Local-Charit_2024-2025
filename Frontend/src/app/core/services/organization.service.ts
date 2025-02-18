import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Organization,
  OrganizationType,
  OrganizationCategory,
  OrganizationDocument,
  DocumentType
} from '../models/organization.model';

export interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  averageRating: number;
  impactScore: number;
}

export interface ImpactMetrics {
  peopleServed: number;
  fundsRaised: number;
  projectsCompleted: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/api/organizations`;

  constructor(private http: HttpClient) {}

  // Get all organizations with pagination and filters
  getOrganizations(page: number = 0, size: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get organization by ID
  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  // Create new organization
  createOrganization(organization: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  // Update organization
  updateOrganization(id: string, organization: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  // Delete organization
  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get organization statistics
  getOrganizationStats(organizationId: string): Observable<OrganizationStats> {
    return this.http.get<OrganizationStats>(`${this.apiUrl}/${organizationId}/stats`);
  }

  // Verify organization
  verifyOrganization(organizationId: string, approved?: boolean, reason?: string): Observable<Organization> {
    if (approved === undefined) {
      return this.http.post<Organization>(`${this.apiUrl}/${organizationId}/verify`, {});
    }
    return this.http.put<Organization>(`${this.apiUrl}/${organizationId}/verify`, { approved, reason });
  }

  // Suspend organization
  suspendOrganization(id: string, reason: string): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/${id}/suspend`, { reason });
  }

  // Reactivate organization
  reactivateOrganization(id: string): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/${id}/reactivate`, {});
  }

  // Get organization events
  getOrganizationEvents(organizationId: string, page: number = 0, size: number = 10, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<any>(`${this.apiUrl}/${organizationId}/events`, { params });
  }

  // Get organization volunteers
  getOrganizationVolunteers(organizationId: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/${organizationId}/volunteers`, { params });
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

    const req = new HttpRequest('POST', `${this.apiUrl}/${organizationId}/documents`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }

  getDocuments(organizationId: string): Observable<OrganizationDocument[]> {
    return this.http.get<OrganizationDocument[]>(`${this.apiUrl}/${organizationId}/documents`);
  }

  deleteDocument(organizationId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${organizationId}/documents/${documentId}`);
  }

  // Impact metrics
  updateImpactMetrics(organizationId: string, metrics: Partial<ImpactMetrics>): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${organizationId}/impact-metrics`, metrics);
  }

  getImpactMetrics(organizationId: string): Observable<ImpactMetrics> {
    return this.http.get<ImpactMetrics>(`${this.apiUrl}/${organizationId}/impact-metrics`);
  }
} 