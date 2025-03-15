import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.response.model';
import { StatisticsResponse, AdminStats, OrganizationStats, VolunteerStats, TimeSeriesData } from '../models/statistics.model';

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

  getVolunteerStatistics(userId: string): Observable<VolunteerStats> {
    return this.http.get<ApiResponse<VolunteerStats>>(`${this.apiUrl}/volunteer/${userId}`)
      .pipe(
        map(response => ({
          ...response.data,
          userId,
          userRole: 'VOLUNTEER',
          totalEventsAttended: response.data.eventsParticipated || 0,
          reliabilityScore: 100,
          skillEndorsements: 0
        }))
      );
  }

  getOrganizationStatistics(userId: string): Observable<OrganizationStats> {
    return this.http.get<ApiResponse<OrganizationStats>>(`${this.apiUrl}/organizations/${userId}`)
      .pipe(map(response => response.data));
  }

  getAdminStatistics(): Observable<AdminStats> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/admin`)
      .pipe(map(response => response.data));
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