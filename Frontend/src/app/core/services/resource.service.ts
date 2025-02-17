import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Resource, ResourceType, ResourceUploadResponse } from '../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = `${environment.apiUrl}/api/resources`;

  constructor(private http: HttpClient) {}

  getResources(type?: ResourceType): Observable<Resource[]> {
    const params = type ? { type } : {};
    return this.http.get<Resource[]>(this.apiUrl, { params });
  }

  getResource(id: string): Observable<Resource> {
    return this.http.get<Resource>(`${this.apiUrl}/${id}`);
  }

  createResource(resource: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>(this.apiUrl, resource);
  }

  updateResource(id: string, resource: Partial<Resource>): Observable<Resource> {
    return this.http.put<Resource>(`${this.apiUrl}/${id}`, resource);
  }

  deleteResource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadFile(file: File, metadata?: Record<string, any>): Observable<HttpEvent<ResourceUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }

  downloadResource(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  shareResource(id: string, userIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/share`, { userIds });
  }

  getSharedResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/shared`);
  }
} 