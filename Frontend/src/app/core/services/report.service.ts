import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

export interface OrganizationReportResponse {
  organizationId: string;
  organizationName: string;
  periodStart: Date;
  periodEnd: Date;
  totalEventsHosted: number;
  totalVolunteersEngaged: number;
  totalVolunteerHours: number;
  averageEventRating: number;
  eventsByCategory: { [key: string]: number };
  mostRequestedSkills: string[];
  impactMetrics: { [key: string]: number };
  additionalStats?: { [key: string]: any };
}

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

  generateOrganizationReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Observable<OrganizationReportResponse> {
    // Format dates as ISO strings but only keep the date part (YYYY-MM-DD)
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    const params = new HttpParams()
      .set('startDate', formattedStartDate)
      .set('endDate', formattedEndDate);

    console.log('Generating report with params:', {
      organizationId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      url: `${this.apiUrl}/organization/${organizationId}`
    });

    return this.http
      .get<OrganizationReportResponse>(`${this.apiUrl}/organization/${organizationId}`, { params })
      .pipe(
        map(response => {
          // Convert string dates to Date objects if they're strings
          if (typeof response.periodStart === 'string') {
            response.periodStart = new Date(response.periodStart);
          }
          if (typeof response.periodEnd === 'string') {
            response.periodEnd = new Date(response.periodEnd);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  exportOrganizationReport(organizationId: string, format: 'PDF' | 'EXCEL'): Observable<Blob> {
    const params = new HttpParams().set('format', format);

    return this.http
      .get(`${this.apiUrl}/organization/${organizationId}/export`, {
        params,
        responseType: 'blob'
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);

    let errorMessage = 'An error occurred while processing your request.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 404) {
        errorMessage = 'Report not found. Please check your parameters and try again.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request parameters. Please check your input and try again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this report.';
      } else if (error.status === 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      }

      // Add more details if available
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => ({ error: errorMessage, status: error.status }));
  }
} 