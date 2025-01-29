import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { Organization } from '../../../core/models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly baseUrl = '/organizations';

  constructor(private apiService: ApiService) {}

  createOrganization(organization: Partial<Organization>): Observable<Organization> {
    return this.apiService.post<Organization>(this.baseUrl, organization);
  }

  getOrganization(id: string): Observable<Organization> {
    return this.apiService.get<Organization>(`${this.baseUrl}/${id}`);
  }

  updateOrganization(id: string, organization: Partial<Organization>): Observable<Organization> {
    return this.apiService.put<Organization>(`${this.baseUrl}/${id}`, organization);
  }

  deleteOrganization(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
} 