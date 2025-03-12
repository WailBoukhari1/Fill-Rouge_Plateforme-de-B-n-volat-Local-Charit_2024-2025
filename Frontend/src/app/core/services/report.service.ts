import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  OverviewStatistics, 
  UserActivity, 
  EventStatistics, 
  ReportType, 
  ReportRequest, 
  ReportResponse, 
  Report, 
  ReportFilter 
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getOverviewStatistics(): Observable<OverviewStatistics> {
    return this.http.get<OverviewStatistics>(`${this.apiUrl}/overview`);
  }

  getUserActivity(): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/user-activity`);
  }

  getEventStatistics(): Observable<EventStatistics[]> {
    return this.http.get<EventStatistics[]>(`${this.apiUrl}/event-statistics`);
  }

  getReports(type?: ReportType): Observable<Report[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type.toString());
    }
    return this.http.get<Report[]>(this.apiUrl, { params });
  }

  generateReport(type: ReportType, startDate?: Date, endDate?: Date): Observable<ReportResponse> {
    const request: ReportRequest = {
      type,
      startDate,
      endDate
    };
    return this.http.post<ReportResponse>(`${this.apiUrl}/generate`, request);
  }

  getReport(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadReport(fileUrl: string): Observable<Blob> {
    return this.http.get(fileUrl, { responseType: 'blob' });
  }

  scheduleReport(type: ReportType, schedule: string, filters?: ReportFilter[]): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/schedule`, {
      type,
      schedule,
      filters
    });
  }
} 