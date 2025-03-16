import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.response.model';
import { 
  StatisticsResponse, 
  TimeSeriesData,
  VolunteerStatistics,
  OrganizationStatistics,
  AdminStatistics
} from '../models/statistics.model';

// Re-export the interfaces so they can be imported from this service
export { VolunteerStatistics, OrganizationStatistics, AdminStatistics } from '../models/statistics.model';

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
    // Ensure we're using the MongoDB ObjectId format
    const mongoId = userId.includes('_') ? userId.split('_')[1] : userId;
    return this.http.get<ApiResponse<VolunteerStatistics>>(`${this.apiUrl}/volunteer/${mongoId}`).pipe(
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