import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VolunteerStats, OrganizationStats, AdminStats, DetailedVolunteerStats, StatisticsResponse, RecentEvent } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStatisticsByRole(userId: string): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.apiUrl}/stats/user/${userId}`);
  }

  getVolunteerStats(userId: string): Observable<VolunteerStats> {
    return this.http.get<VolunteerStats>(`${this.apiUrl}/stats/volunteer/${userId}`);
  }

  getOrganizationStats(organizationId: string): Observable<OrganizationStats> {
    return this.http.get<OrganizationStats>(`${this.apiUrl}/stats/organization/${organizationId}`);
  }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats/admin`);
  }

  getDetailedVolunteerStats(): Observable<DetailedVolunteerStats> {
    return this.http.get<DetailedVolunteerStats>(`${this.apiUrl}/volunteer/detailed-stats`);
  }

  getVolunteerStatsByDateRange(startDate: Date, endDate: Date): Observable<DetailedVolunteerStats> {
    return this.http.get<DetailedVolunteerStats>(`${this.apiUrl}/volunteer/stats/range`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  }

  getVolunteerHours(): Observable<{ totalHours: number }> {
    return this.http.get<{ totalHours: number }>(`${this.apiUrl}/volunteer/hours`);
  }

  getVolunteerReliability(): Observable<{ reliabilityScore: number }> {
    return this.http.get<{ reliabilityScore: number }>(`${this.apiUrl}/volunteer/reliability`);
  }
} 