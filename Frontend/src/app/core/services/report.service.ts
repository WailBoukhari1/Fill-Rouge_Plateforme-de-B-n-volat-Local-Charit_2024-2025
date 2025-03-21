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
  reportGeneratedAt: Date;
  additionalStats?: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {
    console.log('ReportService initialized with API URL:', this.apiUrl);
  }

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
    try {
      // Format dates to match backend's expected format exactly
      const formatDate = (date: Date): string => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          throw new Error('Invalid date provided');
        }
        return date.toISOString().slice(0, 19); // Format: YYYY-MM-DDTHH:mm:ss
      };

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      const url = `${this.apiUrl}/organization/${organizationId}`;
      const params = new HttpParams()
        .set('startDate', formattedStartDate)
        .set('endDate', formattedEndDate);

      console.log('Making API request:', {
        url,
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        organizationId
      });

      return this.http
        .get<OrganizationReportResponse>(url, { params })
        .pipe(
          map(response => {
            console.log('Received report response:', response);
            
            // Convert date strings to Date objects
            if (response.periodStart) {
              response.periodStart = new Date(response.periodStart);
            }
            if (response.periodEnd) {
              response.periodEnd = new Date(response.periodEnd);
            }
            if (response.reportGeneratedAt) {
              response.reportGeneratedAt = new Date(response.reportGeneratedAt);
            }

            // Ensure numeric values are numbers
            response.totalEventsHosted = Number(response.totalEventsHosted) || 0;
            response.totalVolunteersEngaged = Number(response.totalVolunteersEngaged) || 0;
            response.totalVolunteerHours = Number(response.totalVolunteerHours) || 0;
            response.averageEventRating = Number(response.averageEventRating) || 0;

            return response;
          }),
          catchError(error => {
            console.error('Error generating organization report:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });

            if (error.status === 400) {
              return throwError(() => new Error('Invalid request. Please check your inputs.'));
            }
            if (error.status === 404) {
              return throwError(() => new Error('Organization not found.'));
            }
            if (error.status === 500) {
              const errorMessage = error.error?.message || 'Server error. Please try again later.';
              return throwError(() => new Error(errorMessage));
            }
            return this.handleError(error);
          })
        );
    } catch (error) {
      console.error('Error formatting dates:', error);
      return throwError(() => new Error('Invalid date format. Please check your date inputs.'));
    }
  }

  exportOrganizationReport(organizationId: string, format: 'PDF' | 'EXCEL'): Observable<Blob> {
    const params = new HttpParams().set('format', format);

    return this.http
      .get(`${this.apiUrl}/export/organization/${organizationId}`, {
        params,
        responseType: 'blob'
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    console.error('API Error:', {
      error,
      message: errorMessage
    });

    return throwError(() => new Error(errorMessage));
  }
} 