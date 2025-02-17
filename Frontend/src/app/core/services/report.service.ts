import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report, ReportFilter, ReportType } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/api/reports`;

  constructor(private http: HttpClient) {}

  generateReport(type: ReportType, filters?: ReportFilter[]): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/generate`, { type, filters });
  }

  getReport(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  getReports(type?: ReportType): Observable<Report[]> {
    const params = type ? { type } : {};
    return this.http.get<Report[]>(this.apiUrl, { params });
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadReport(id: string, format: 'pdf' | 'csv' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download/${format}`, {
      responseType: 'blob'
    });
  }

  scheduleReport(type: ReportType, schedule: string, filters?: ReportFilter[]): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/schedule`, {
      type,
      schedule,
      filters
    });
  }
} 