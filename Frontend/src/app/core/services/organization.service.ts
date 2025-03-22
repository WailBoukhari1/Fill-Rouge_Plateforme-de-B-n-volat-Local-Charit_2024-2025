import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationProfile, ApiResponse } from '../models/organization.model';

export interface OrganizationResponse {
  content: OrganizationProfile[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) { }

  /**
   * Get all organizations with pagination and search
   */
  getAllOrganizations(page: number, pageSize: number, search?: string): Observable<OrganizationResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<OrganizationResponse>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching organizations:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get pending organizations awaiting approval
   */
  getPendingOrganizations(page: number, pageSize: number): Observable<OrganizationResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('status', 'PENDING');
      
    return this.http.get<OrganizationResponse>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching pending organizations:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get organization by ID
   */
  getOrganizationById(id: string): Observable<OrganizationProfile> {
    return this.http.get<OrganizationProfile>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Create a new organization
   */
  createOrganization(organizationData: any): Observable<OrganizationProfile> {
    return this.http.post<OrganizationProfile>(this.apiUrl, organizationData)
      .pipe(
        catchError(error => {
          console.error('Error creating organization:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Update organization details
   */
  updateOrganization(id: string, organizationData: any): Observable<ApiResponse<OrganizationProfile>> {
    return this.http.put<ApiResponse<OrganizationProfile>>(`${this.apiUrl}/${id}`, organizationData)
      .pipe(
        catchError(error => {
          console.error(`Error updating organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Approve organization
   */
  approveOrganization(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, {})
      .pipe(
        catchError(error => {
          console.error(`Error approving organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Reject organization with reason
   */
  rejectOrganization(id: string, reason: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, { reason })
      .pipe(
        catchError(error => {
          console.error(`Error rejecting organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Ban organization with reason
   */
  banOrganization(id: string, reason: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/ban`, { reason })
      .pipe(
        catchError(error => {
          console.error(`Error banning organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Unban organization
   */
  unbanOrganization(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/unban`, {})
      .pipe(
        catchError(error => {
          console.error(`Error unbanning organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Delete organization
   */
  deleteOrganization(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get organization events
   */
  getOrganizationEvents(id: string, page: number, pageSize: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    return this.http.get<any>(`${environment.apiUrl}/events/organization/${id}`, { params })
      .pipe(
        catchError(error => {
          console.error(`Error fetching events for organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get organization members
   */
  getOrganizationMembers(id: string, page: number, pageSize: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    return this.http.get<any>(`${this.apiUrl}/${id}/members`, { params })
      .pipe(
        catchError(error => {
          console.error(`Error fetching members for organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Add member to organization
   */
  addOrganizationMember(organizationId: string, userId: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${organizationId}/members`, { userId, role })
      .pipe(
        catchError(error => {
          console.error(`Error adding member to organization with id ${organizationId}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Remove member from organization
   */
  removeOrganizationMember(organizationId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${organizationId}/members/${userId}`)
      .pipe(
        catchError(error => {
          console.error(`Error removing member from organization with id ${organizationId}:`, error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Update member role in organization
   */
  updateMemberRole(organizationId: string, userId: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${organizationId}/members/${userId}`, { role })
      .pipe(
        catchError(error => {
          console.error(`Error updating member role in organization with id ${organizationId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Upload organization logo
   */
  uploadLogo(organizationId: string, file: File | FormData): Observable<ApiResponse<OrganizationProfile>> {
    let formData: FormData;
    
    if (!(file instanceof FormData)) {
      formData = new FormData();
      formData.append('file', file);
    } else {
      formData = file;
    }
    
    return this.http.post<ApiResponse<OrganizationProfile>>(`${this.apiUrl}/${organizationId}/logo`, formData)
      .pipe(
        catchError(error => {
          console.error(`Error uploading logo for organization with id ${organizationId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get organization by ID (with data wrapper)
   */
  getOrganization(id: string | number): Observable<ApiResponse<OrganizationProfile>> {
    return this.http.get<ApiResponse<OrganizationProfile>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching organization with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get organization by user ID
   */
  getOrganizationByUserId(userId: string): Observable<ApiResponse<OrganizationProfile>> {
    return this.http.get<ApiResponse<OrganizationProfile>>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching organization for user id ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete organization document
   */
  deleteDocument(organizationId: string, documentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${organizationId}/documents/${documentId}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting document ${documentId} for organization ${organizationId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Upload organization profile picture
   */
  uploadProfilePicture(organizationId: string, file: File | FormData): Observable<ApiResponse<OrganizationProfile>> {
    let formData: FormData;
    
    if (!(file instanceof FormData)) {
      formData = new FormData();
      formData.append('file', file);
    } else {
      formData = file;
    }
    
    return this.http.post<ApiResponse<OrganizationProfile>>(`${this.apiUrl}/${organizationId}/profile-picture`, formData)
      .pipe(
        catchError(error => {
          console.error(`Error uploading profile picture for organization with id ${organizationId}:`, error);
          return throwError(() => error);
        })
      );
  }
}
