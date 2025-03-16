import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.response.model';
import { StatisticsResponse, AdminStats, OrganizationStats, VolunteerStats, TimeSeriesData } from '../models/statistics.model';

export interface VolunteerStatistics {
  totalEventsParticipated: number;
  activeEvents: number;
  completedEvents: number;
  totalVolunteerHours: number;
  reliabilityScore: number;
  averageEventRating: number;
  skillsEndorsements: number;
  peopleImpacted: number;
  organizationsSupported: number;
  hoursContributed: { date: string; hours: number }[];
  eventsByCategory: { [key: string]: number };
  skillsDistribution: { [key: string]: number };
  monthlyParticipation: { month: string; events: number }[];
}

export interface OrganizationStatistics {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalVolunteers: number;
  totalVolunteerHours: number;
  averageEventRating: number;
  peopleImpacted: number;
  eventCategories: number;
  activeVolunteers: number;
  volunteerEngagement: { month: string; volunteers: number }[];
  eventDistribution: { [key: string]: number };
  volunteerRetention: { month: string; retention: number }[];
  eventSuccessRate: { month: string; rate: number }[];
}

export interface AdminStatistics {
  totalUsers: number;
  totalVolunteers: number;
  totalOrganizations: number;
  totalEvents: number;
  totalVolunteerHours: number;
  activeUsers: number;
  totalPeopleImpacted: number;
  totalEventCategories: number;
  activeOrganizations: number;
  userGrowth: { month: string; users: number }[];
  eventDistribution: { [key: string]: number };
  platformGrowth: { month: string; growth: number }[];
  userEngagement: { month: string; engagement: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  getStatistics(userId: string): Observable<StatisticsResponse> {
    return this.http.get<ApiResponse<StatisticsResponse>>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(response => response.data));
  }

  getVolunteerStatistics(userId: string): Observable<VolunteerStatistics> {
    return this.http.get<ApiResponse<VolunteerStatistics>>(`${this.apiUrl}/volunteer/${userId}`).pipe(
      map(response => response.data)
    );
  }

  getOrganizationStatistics(orgId: string): Observable<OrganizationStatistics> {
    return this.http.get<OrganizationStatistics>(`${this.apiUrl}/organization/${orgId}`);
  }

  getAdminStatistics(): Observable<AdminStatistics> {
    return this.http.get<AdminStatistics>(`${this.apiUrl}/admin`);
  }

  // Helper methods for chart data transformation
  transformTimeSeriesData(data: TimeSeriesData[]) {
    return {
      labels: data.map(item => item.date),
      datasets: [{
        data: data.map(item => item.value),
        label: data[0]?.category || 'Value',
        borderColor: '#2196f3',
        fill: false
      }]
    };
  }

  transformCategoryData(data: { [key: string]: number }) {
    const backgroundColors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ];

    return {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: backgroundColors.slice(0, Object.keys(data).length),
        borderWidth: 1
      }]
    };
  }
} 