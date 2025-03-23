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
    templateUrl: './organization-report.component.html',
  
  styles: [`
    :host {
      display: block;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      padding: 12px 16px;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
    }

    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: transparent;
    }

    ::ng-deep .mat-mdc-form-field:hover .mat-mdc-form-field-focus-overlay {
      opacity: 0.04;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
      opacity: 0.12;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-infix {
      border-color: #3b82f6;
    }

    ::ng-deep .mat-mdc-form-field-label {
      color: #6b7280;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #3b82f6;
    }

    ::ng-deep .mat-mdc-button {
      text-transform: none;
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-raised-button {
      box-shadow: none !important;
    }

    ::ng-deep .mat-mdc-raised-button:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
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
