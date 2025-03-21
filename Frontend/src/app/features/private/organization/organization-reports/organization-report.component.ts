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
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    <div class="report-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Organization Report</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="dateForm" class="date-form">
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

            <button mat-raised-button color="primary" (click)="loadReport()">
              Generate Report
            </button>
          </form>

          <div *ngIf="reportData" class="report-content">
            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{reportData.totalEventsHosted}}</div>
                  <div class="stat-label">Total Events</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{reportData.totalVolunteersEngaged}}</div>
                  <div class="stat-label">Total Volunteers</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{reportData.totalVolunteerHours}}</div>
                  <div class="stat-label">Volunteer Hours</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{reportData.averageEventRating | number:'1.1-1'}}</div>
                  <div class="stat-label">Average Rating</div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="charts-container">
              <div class="chart-card">
                <h3>Events by Category</h3>
                <ngx-charts-pie-chart
                  [results]="eventsByCategoryData"
                  [scheme]="colorScheme"
                  [legend]="true"
                  [labels]="true"
                  [doughnut]="true">
                </ngx-charts-pie-chart>
              </div>
            </div>

            <div class="export-buttons">
              <button mat-raised-button color="accent" (click)="exportToPDF()">
                Export to PDF
              </button>
              <button mat-raised-button color="accent" (click)="exportToExcel()">
                Export to Excel
              </button>
            </div>
          </div>

          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .report-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .date-form {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
      padding: 20px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2196f3;
    }

    .stat-label {
      margin-top: 8px;
      color: #666;
    }

    .charts-container {
      margin: 30px 0;
    }

    .chart-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .export-buttons {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      margin: 40px 0;
    }
  `]
})
export class OrganizationReportComponent implements OnInit {
  dateForm: FormGroup;
  reportData: any;
  loading = false;
  eventsByCategoryData: any[] = [];
  
  colorScheme: Color = {
    name: 'cool',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
  };

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.dateForm = this.formBuilder.group({
      startDate: [new Date()],
      endDate: [new Date()]
    });
  }

  ngOnInit() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.dateForm.patchValue({
      startDate: thirtyDaysAgo,
      endDate: today
    });

    this.loadReport();
  }

  loadReport() {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      this.snackBar.open('Organization ID not found', 'Close', { duration: 5000 });
      return;
    }

    const startDate = this.dateForm.get('startDate')?.value;
    const endDate = this.dateForm.get('endDate')?.value;

    if (!startDate || !endDate) {
      this.snackBar.open('Please select both start and end dates', 'Close', { duration: 5000 });
      return;
    }

    // Set time to start and end of day
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    this.loading = true;
    console.log('Generating report for:', {
      organizationId,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });

    this.reportService.generateOrganizationReport(organizationId, start, end)
      .subscribe({
        next: (data) => {
          console.log('Report data received:', data);
          this.reportData = data;
          this.updateChartData();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading report:', error);
          this.loading = false;
          this.snackBar.open(
            error.message || 'Error loading report. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  private updateChartData() {
    if (this.reportData && this.reportData.eventsByCategory) {
      this.eventsByCategoryData = Object.entries(this.reportData.eventsByCategory)
        .map(([name, value]) => ({
          name,
          value: Number(value)
        }))
        .filter(item => item.value > 0);
    }
  }

  exportToPDF() {
    if (!this.reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text('Organization Report', pageWidth / 2, 20, { align: 'center' });

    // Organization Info
    doc.setFontSize(12);
    doc.text(`Organization: ${this.reportData.organizationName}`, 20, 40);
    doc.text(`Period: ${new Date(this.reportData.periodStart).toLocaleDateString()} - ${new Date(this.reportData.periodEnd).toLocaleDateString()}`, 20, 50);

    // Statistics Table
    const statsData = [
      ['Metric', 'Value'],
      ['Total Events', this.reportData.totalEventsHosted],
      ['Total Volunteers', this.reportData.totalVolunteersEngaged],
      ['Volunteer Hours', this.reportData.totalVolunteerHours],
      ['Average Rating', this.reportData.averageEventRating.toFixed(1)]
    ];

    (doc as any).autoTable({
      startY: 60,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'grid'
    });

    // Events by Category
    if (this.eventsByCategoryData.length > 0) {
      doc.addPage();
      doc.text('Events by Category', 20, 20);
      
      const categoryData = this.eventsByCategoryData.map(item => [
        item.name,
        item.value.toString()
      ]);

      (doc as any).autoTable({
        startY: 30,
        head: [['Category', 'Count']],
        body: categoryData,
        theme: 'grid'
      });
    }

    // Save the PDF
    doc.save(`organization-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel() {
    if (!this.reportData) return;

    // Prepare the data
    const data = [
      ['Organization Report'],
      ['Organization', this.reportData.organizationName],
      ['Period', `${new Date(this.reportData.periodStart).toLocaleDateString()} - ${new Date(this.reportData.periodEnd).toLocaleDateString()}`],
      [],
      ['Statistics'],
      ['Total Events', this.reportData.totalEventsHosted],
      ['Total Volunteers', this.reportData.totalVolunteersEngaged],
      ['Volunteer Hours', this.reportData.totalVolunteerHours],
      ['Average Rating', this.reportData.averageEventRating.toFixed(1)],
      [],
      ['Events by Category']
    ];

    // Add category data
    this.eventsByCategoryData.forEach(item => {
      data.push([item.name, item.value]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Save the file
    XLSX.writeFile(wb, `organization-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
} 