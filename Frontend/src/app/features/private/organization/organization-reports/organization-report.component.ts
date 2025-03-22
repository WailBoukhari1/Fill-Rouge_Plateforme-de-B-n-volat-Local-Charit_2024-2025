import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import {
  NgxChartsModule,
  Color,
  ScaleType,
  LegendPosition,
} from '@swimlane/ngx-charts';
import {
  ReportService,
  OrganizationReportResponse,
} from '../../../../core/services/report.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-organization-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
  ],
  template: `
    <div class="container">
      <!-- Header Section -->
      <header class="header">
        <h1 class="title">Organization Report</h1>
        <p class="subtitle">View and analyze your organization's performance</p>
      </header>

      <!-- Date Range Selection -->
      <div class="card date-range-card">
        <form [formGroup]="dateForm" class="date-form">
          <mat-form-field >
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field >
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="loadReport()" [disabled]="loading">
            <mat-icon>refresh</mat-icon>
            Update Report
          </button>
        </form>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Generating your report...</p>
        </div>
      }

      <!-- Report Content -->
      @if (reportData && !loading) {
        <!-- Key Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <mat-icon class="metric-icon">event</mat-icon>
            <div class="metric-content">
              <h3 class="metric-value">{{reportData.totalEventsHosted}}</h3>
              <p class="metric-label">Total Events</p>
            </div>
          </div>

          <div class="metric-card">
            <mat-icon class="metric-icon">people</mat-icon>
            <div class="metric-content">
              <h3 class="metric-value">{{reportData.totalVolunteersEngaged}}</h3>
              <p class="metric-label">Total Volunteers</p>
            </div>
          </div>

          <div class="metric-card">
            <mat-icon class="metric-icon">schedule</mat-icon>
            <div class="metric-content">
              <h3 class="metric-value">{{reportData.totalVolunteerHours}}</h3>
              <p class="metric-label">Volunteer Hours</p>
            </div>
          </div>

          <div class="metric-card">
            <mat-icon class="metric-icon">star</mat-icon>
            <div class="metric-content">
              <h3 class="metric-value">{{reportData.averageEventRating | number:'1.1-1'}}</h3>
              <p class="metric-label">Average Rating</p>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Events by Category Chart -->
          <div class="card chart-card">
            <h2 class="chart-title">Events by Category</h2>
            @if (eventsByCategoryData.length > 0) {
              <div class="chart-container">
                <ngx-charts-pie-chart
                  [results]="eventsByCategoryData"
                  [scheme]="colorScheme"
                  [legend]="true"
                  [labels]="true"
                  [doughnut]="true"
                  [gradient]="true"
                  [legendPosition]="legendPosition"
                  [animations]="true"
                  [tooltipDisabled]="false"
                  [view]="[400, 300]">
                </ngx-charts-pie-chart>
              </div>
            } @else {
              <div class="no-data">
                <mat-icon>event_busy</mat-icon>
                <p>No events found for the selected period</p>
              </div>
            }
          </div>

          <!-- Most Requested Skills -->
          @if (reportData.mostRequestedSkills.length) {
            <div class="card skills-card">
              <h2 class="chart-title">Most Requested Skills</h2>
              <div class="skills-grid">
                @for (skill of reportData.mostRequestedSkills; track skill) {
                  <div class="skill-item">
                    <mat-icon>check_circle</mat-icon>
                    <span>{{skill}}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Export Section -->
        <div class="card export-card">
          <h2 class="section-title">Download Report</h2>
          <div class="export-buttons">
            <button mat-flat-button color="primary" (click)="exportReport('PDF')" [disabled]="loading">
              <mat-icon>picture_as_pdf</mat-icon>
              Export as PDF
            </button>
            <button mat-flat-button color="primary" (click)="exportReport('EXCEL')" [disabled]="loading">
              <mat-icon>table_chart</mat-icon>
              Export as Excel
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .title {
      font-size: 2rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .subtitle {
      color: #666;
      margin: 0.5rem 0 0;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .date-range-card {
      margin-bottom: 2rem;
    }

    .date-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      color: #666;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
    }

    .metric-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
      color: #2196f3;
    }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .metric-label {
      color: #666;
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card, .skills-card {
      min-height: 400px;
    }

    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 1.5rem;
    }

    .chart-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100% - 3rem);
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: calc(100% - 3rem);
      color: #666;
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: 1rem;
      color: #999;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .skill-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .skill-item mat-icon {
      color: #4caf50;
      font-size: 1.25rem;
    }

    .export-card {
      text-align: center;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 1rem;
    }

    .export-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .export-buttons {
        flex-direction: column;
      }

      .export-buttons button {
        width: 100%;
      }
    }
  `]
})
export class OrganizationReportComponent implements OnInit {
  dateForm: FormGroup;
  reportData: OrganizationReportResponse | null = null;
  loading = false;
  eventsByCategoryData: any[] = [];
  legendPosition: LegendPosition = LegendPosition.Below;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#2196F3', // Blue
      '#4CAF50', // Green
      '#FFC107', // Amber
      '#FF5722', // Deep Orange
      '#9C27B0', // Purple
      '#3F51B5', // Indigo
      '#E91E63', // Pink
      '#009688', // Teal
      '#FF9800', // Orange
      '#CDDC39', // Lime
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.dateForm = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
    });
  }

  ngOnInit() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateForm.patchValue({
      startDate: thirtyDaysAgo,
      endDate: today,
    });

    this.loadReport();
  }

  loadReport() {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      this.snackBar.open('Organization ID not found', 'Close', {
        duration: 5000,
      });
      return;
    }

    const startDate = this.dateForm.get('startDate')?.value;
    const endDate = this.dateForm.get('endDate')?.value;

    if (!startDate || !endDate) {
      this.snackBar.open('Please select both start and end dates', 'Close', {
        duration: 5000,
      });
      return;
    }

    // Set time to start and end of day
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    this.loading = true;
    this.reportService
      .generateOrganizationReport(organizationId, start, end)
      .subscribe({
        next: (data) => {
          this.reportData = data;
          this.updateChartData();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading report:', error);
          this.loading = false;
          this.snackBar.open(
            'Error loading report. Please try again.',
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  updateChartData() {
    if (
      !this.reportData?.eventsByCategory ||
      Object.keys(this.reportData.eventsByCategory).length === 0
    ) {
      this.eventsByCategoryData = [];
      return;
    }

    // Transform the data for the chart
    this.eventsByCategoryData = Object.entries(this.reportData.eventsByCategory)
      .filter(([_, value]) => value > 0) // Only show categories with events
      .map(([name, value]) => ({
        name: name || 'Uncategorized',
        value: Number(value),
      }))
      .sort((a, b) => b.value - a.value); // Sort by value in descending order

    // If after filtering there are no events, set to empty array
    if (this.eventsByCategoryData.length === 0) {
      this.eventsByCategoryData = [];
    }

    console.log('Chart data:', this.eventsByCategoryData);
  }

  exportReport(format: 'PDF' | 'EXCEL') {
    if (!this.reportData) return;

    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      this.snackBar.open('Organization ID not found', 'Close', {
        duration: 5000,
      });
      return;
    }

    this.loading = true;
    this.reportService
      .exportOrganizationReport(organizationId, format)
      .subscribe({
        next: (blob) => {
          const fileName = `organization-report-${
            new Date().toISOString().split('T')[0]
          }.${format.toLowerCase()}`;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
          this.snackBar.open(`Report downloaded successfully`, 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error exporting report:', error);
          this.loading = false;
          this.snackBar.open(
            'Error downloading report. Please try again.',
            'Close',
            { duration: 5000 }
          );
        },
      });
  }
}
