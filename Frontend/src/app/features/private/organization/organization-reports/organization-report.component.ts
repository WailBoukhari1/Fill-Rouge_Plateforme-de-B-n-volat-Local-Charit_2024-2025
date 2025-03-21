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
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { ReportService, OrganizationReportResponse } from '../../../../core/services/report.service';
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
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Organization Report</h1>
        <div class="flex gap-4">
          <form [formGroup]="dateRangeForm" class="flex gap-4">
            <mat-form-field>
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field>
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="loadReport()" [disabled]="loading">
              <mat-icon>refresh</mat-icon>
              Update Report
            </button>
          </form>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{error}}</span>
      </div>

      <div *ngIf="!loading && !error && report" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Organization Info -->
        <mat-card class="col-span-full">
          <mat-card-header>
            <mat-card-title>{{report.organizationName}}</mat-card-title>
            <mat-card-subtitle>Report Period: {{report.periodStart | date}} - {{report.periodEnd | date}}</mat-card-subtitle>
          </mat-card-header>
        </mat-card>

        <!-- Overview Stats -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Overview</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-4">
            <div class="grid gap-4">
              <div class="stat-item">
                <p class="text-gray-600">Total Events Hosted</p>
                <h3 class="text-2xl font-bold">{{report.totalEventsHosted}}</h3>
              </div>
              <div class="stat-item">
                <p class="text-gray-600">Total Volunteers</p>
                <h3 class="text-2xl font-bold">{{report.totalVolunteersEngaged}}</h3>
              </div>
              <div class="stat-item">
                <p class="text-gray-600">Volunteer Hours</p>
                <h3 class="text-2xl font-bold">{{report.totalVolunteerHours}}</h3>
              </div>
              <div class="stat-item">
                <p class="text-gray-600">Average Rating</p>
                <div class="flex items-center">
                  <h3 class="text-2xl font-bold">{{report.averageEventRating | number:'1.1-1'}}</h3>
                  <mat-icon class="text-yellow-500 ml-2">star</mat-icon>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Events by Category -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Events by Category</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-4">
            <div *ngIf="eventCategoryData.length > 0" style="height: 300px;">
              <ngx-charts-pie-chart
                [results]="eventCategoryData"
                [scheme]="colorScheme"
                [gradient]="true"
                [legend]="true"
                [labels]="true"
                [doughnut]="true">
              </ngx-charts-pie-chart>
            </div>
            <div *ngIf="eventCategoryData.length === 0" class="text-center text-gray-500 py-4">
              No event category data available
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Most Requested Skills -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Most Requested Skills</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-4">
            <div class="grid gap-2">
              <div *ngFor="let skill of report.mostRequestedSkills" class="skill-item p-2 bg-gray-100 rounded">
                <span class="font-medium">{{skill}}</span>
              </div>
              <div *ngIf="!report.mostRequestedSkills?.length" class="text-center text-gray-500 py-4">
                No skills data available
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Impact Metrics -->
        <mat-card class="md:col-span-2 lg:col-span-3">
          <mat-card-header>
            <mat-card-title>Impact Metrics</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-4">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div *ngFor="let metric of impactMetrics" class="impact-metric p-4 bg-gray-100 rounded">
                <p class="text-gray-600">{{metric.name}}</p>
                <h4 class="text-xl font-bold">{{metric.value}}</h4>
              </div>
              <div *ngIf="impactMetrics.length === 0" class="text-center text-gray-500 py-4 col-span-full">
                No impact metrics available
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Additional Stats -->
        <mat-card *ngIf="report.additionalStats" class="col-span-full">
          <mat-card-header>
            <mat-card-title>Additional Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-4">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div *ngFor="let stat of additionalStats" class="stat-item">
                <p class="text-gray-600">{{stat.name}}</p>
                <h4 class="text-xl font-bold">{{stat.value}}</h4>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Export Options -->
      <div class="mt-6 flex gap-4">
        <button mat-raised-button color="primary" (click)="exportReport('PDF')" [disabled]="loading || !report">
          <mat-icon>picture_as_pdf</mat-icon>
          Export as PDF
        </button>
        <button mat-raised-button color="accent" (click)="exportReport('EXCEL')" [disabled]="loading || !report">
          <mat-icon>table_chart</mat-icon>
          Export as Excel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
    .stat-item {
      padding: 1rem;
      background-color: #f9fafb;
      border-radius: 0.5rem;
    }
    .impact-metric {
      transition: transform 0.2s;
    }
    .impact-metric:hover {
      transform: translateY(-2px);
    }
    mat-form-field {
      width: 160px;
    }
  `]
})
export class OrganizationReportComponent implements OnInit {
  loading = true;
  error: string | null = null;
  report: OrganizationReportResponse | null = null;
  eventCategoryData: any[] = [];
  impactMetrics: { name: string; value: number }[] = [];
  additionalStats: { name: string; value: any }[] = [];
  dateRangeForm: FormGroup;
  
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  };

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    this.dateRangeForm = this.fb.group({
      startDate: [lastMonth],
      endDate: [today]
    });
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.error = null;
    
    const organizationId = this.authService.getCurrentOrganizationId();
    console.log('Loading report for organization:', organizationId);
    
    if (!organizationId) {
      this.error = 'Organization ID not found. Please ensure you are logged in as an organization.';
      this.loading = false;
      return;
    }

    const { startDate, endDate } = this.dateRangeForm.value;
    
    // Ensure we have valid dates
    if (!startDate || !endDate) {
      this.error = 'Please select both start and end dates';
      this.loading = false;
      return;
    }

    // Set the time to start of day for start date and end of day for end date
    const formattedStartDate = new Date(startDate);
    formattedStartDate.setHours(0, 0, 0, 0);

    const formattedEndDate = new Date(endDate);
    formattedEndDate.setHours(23, 59, 59, 999);

    console.log('Fetching report with dates:', {
      startDate: formattedStartDate.toISOString(),
      endDate: formattedEndDate.toISOString()
    });

    this.reportService.generateOrganizationReport(organizationId, formattedStartDate, formattedEndDate)
      .subscribe({
        next: (data) => {
          console.log('Report data received:', data);
          this.report = data;
          this.processReportData();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading report:', error);
          this.error = error.error || 'Failed to load organization report. Please try again later.';
          this.loading = false;
          this.snackBar.open(this.error || 'An error occurred', 'Close', { duration: 5000 });
        }
      });
  }

  private processReportData() {
    if (!this.report) return;

    // Process event categories for the pie chart
    this.eventCategoryData = Object.entries(this.report.eventsByCategory || {})
      .map(([name, value]) => ({ name, value }));

    // Process impact metrics
    this.impactMetrics = Object.entries(this.report.impactMetrics || {})
      .map(([name, value]) => ({
        name: name.split(/(?=[A-Z])/).join(' '), // Convert camelCase to spaces
        value
      }));

    // Process additional stats
    this.additionalStats = Object.entries(this.report.additionalStats || {})
      .map(([name, value]) => ({
        name: name.split(/(?=[A-Z])/).join(' '), // Convert camelCase to spaces
        value
      }));
  }

  exportReport(format: 'PDF' | 'EXCEL') {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      this.snackBar.open('Organization ID not found', 'Close', { duration: 3000 });
      return;
    }

    this.reportService.exportOrganizationReport(organizationId, format)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `organization-report-${format.toLowerCase()}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.snackBar.open(`Report exported successfully as ${format}`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error exporting report:', error);
          this.snackBar.open(`Error exporting report as ${format}`, 'Close', { duration: 3000 });
        }
      });
  }
} 