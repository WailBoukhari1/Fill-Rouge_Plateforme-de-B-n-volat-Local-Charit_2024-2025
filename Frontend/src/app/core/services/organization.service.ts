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

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/api/organizations`;

  constructor(private http: HttpClient) {}

  // Organization CRUD operations
  getOrganizations(params?: {
    type?: OrganizationType;
    category?: OrganizationCategory;
    search?: string;
    verified?: boolean;
  }): Observable<Organization[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<Organization[]>(this.apiUrl, { params: httpParams });
  }

  getOrganization(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  createOrganization(organization: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  updateOrganization(id: string, organization: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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

  // Verification operations
  requestVerification(organizationId: string): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/${organizationId}/verify`, {});
  }

  verifyOrganization(organizationId: string, approved: boolean, reason?: string): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${organizationId}/verify`, {
      approved,
      reason
    });
  }

  // Statistics and metrics
  getOrganizationStats(organizationId: string): Observable<{
    totalEvents: number;
    activeEvents: number;
    totalVolunteers: number;
    activeVolunteers: number;
    totalHours: number;
    averageRating: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${organizationId}/statistics`);
  }

  getOrganizationVolunteers(organizationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${organizationId}/volunteers`);
  }

  getOrganizationEvents(organizationId: string, status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any[]>(`${this.apiUrl}/${organizationId}/events`, { params });
  }

  // Impact metrics
  updateImpactMetrics(organizationId: string, metrics: {
    peopleServed?: number;
    fundsRaised?: number;
    projectsCompleted?: number;
  }): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${organizationId}/impact-metrics`, metrics);
  }

  getImpactMetrics(organizationId: string): Observable<{
    peopleServed: number;
    fundsRaised: number;
    projectsCompleted: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${organizationId}/impact-metrics`);
  }
} 