import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../../../core/services/report.service';
import { Report, ReportType, OverviewStatistics, UserActivity, EventStatistics } from '../../../../core/models/report.model';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTreeModule } from '@angular/material/tree';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NgxChartsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    MatSortModule,
    MatToolbarModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTreeModule,
    MatGridListModule,
    MatRadioModule,
    MatSidenavModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Reports & Analytics</h1>

      <mat-tab-group>
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <!-- Total Users -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Total Users</p>
                    <h2 class="text-2xl font-bold">{{stats.totalUsers}}</h2>
                    <p class="text-sm text-green-500">
                      <mat-icon class="text-sm">arrow_upward</mat-icon>
                      {{stats.userGrowthRate}}% growth
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">people</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Active Organizations -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Active Organizations</p>
                    <h2 class="text-2xl font-bold">{{stats.activeOrganizations}}</h2>
                    <p class="text-sm text-green-500">
                      <mat-icon class="text-sm">arrow_upward</mat-icon>
                      {{stats.organizationGrowthRate}}% growth
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">business</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Total Events -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Total Events</p>
                    <h2 class="text-2xl font-bold">{{stats.totalEvents}}</h2>
                    <p class="text-sm text-green-500">
                      <mat-icon class="text-sm">arrow_upward</mat-icon>
                      {{stats.eventGrowthRate}}% growth
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">event</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Volunteer Hours -->
            <mat-card>
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600">Volunteer Hours</p>
                    <h2 class="text-2xl font-bold">{{stats.totalVolunteerHours}}</h2>
                    <p class="text-sm text-green-500">
                      <mat-icon class="text-sm">arrow_upward</mat-icon>
                      {{stats.volunteerHoursGrowthRate}}% growth
                    </p>
                  </div>
                  <mat-icon class="text-primary-500">schedule</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <!-- User Growth Chart -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>User Growth</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <ngx-charts-line-chart
                  [results]="userGrowthData"
                  [xAxis]="true"
                  [yAxis]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  xAxisLabel="Month"
                  yAxisLabel="Users"
                  [autoScale]="true"
                  [timeline]="true"
                  [curve]="curve"
                  [roundDomains]="true"
                  [showGridLines]="true"
                  [animations]="true"
                  [gradient]="true"
                  [tooltipDisabled]="false"
                  [legend]="true"
                  [legendTitle]="'User Types'"
                  [legendPosition]="LegendPosition.Below"
                  [showRefLines]="true"
                  [referenceLines]="referenceLines"
                  [showRefLabels]="true"
                  [scheme]="colorScheme"
                  [customColors]="customColors">
                </ngx-charts-line-chart>
              </mat-card-content>
            </mat-card>

            <!-- Event Distribution Chart -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Event Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <ngx-charts-pie-chart
                  [results]="eventDistributionData"
                  [labels]="true"
                  [doughnut]="true"
                  [arcWidth]="0.5"
                  [gradient]="true"
                  [activeEntries]="activeEntries"
                  [tooltipDisabled]="false"
                  [animations]="true"
                  [legend]="true"
                  [legendTitle]="'Event Types'"
                  [legendPosition]="LegendPosition.Below"
                  [scheme]="colorScheme"
                  [customColors]="customColors">
                </ngx-charts-pie-chart>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- User Activity Tab -->
        <mat-tab label="User Activity">
          <div class="mt-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>User Activity Log</mat-card-title>
                <mat-form-field appearance="outline" class="ml-auto">
                  <mat-label>Filter by Action</mat-label>
                  <mat-select [(value)]="selectedAction">
                    <mat-option value="">All Actions</mat-option>
                    <mat-option value="LOGIN">Login</mat-option>
                    <mat-option value="REGISTER">Register</mat-option>
                    <mat-option value="UPDATE_PROFILE">Update Profile</mat-option>
                    <mat-option value="JOIN_EVENT">Join Event</mat-option>
                    <mat-option value="COMPLETE_EVENT">Complete Event</mat-option>
                  </mat-select>
                </mat-form-field>
              </mat-card-header>
              <mat-card-content class="p-4">
                <table mat-table [dataSource]="filteredUserActivity" matSort>
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>User</th>
                    <td mat-cell *matCellDef="let activity">{{activity.userName}}</td>
                  </ng-container>

                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Action</th>
                    <td mat-cell *matCellDef="let activity">
                      <mat-chip [color]="getActionColor(activity.action)" selected>
                        {{activity.action}}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="timestamp">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                    <td mat-cell *matCellDef="let activity">{{activity.timestamp | date:'medium'}}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['user', 'action', 'timestamp']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['user', 'action', 'timestamp'];"></tr>
                </table>

                <mat-paginator
                  [pageSizeOptions]="[5, 10, 25, 100]"
                  [pageSize]="10"
                  showFirstLastButtons>
                </mat-paginator>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Event Statistics Tab -->
        <mat-tab label="Event Statistics">
          <div class="mt-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Event Performance</mat-card-title>
                <mat-form-field appearance="outline" class="ml-auto">
                  <mat-label>Sort By</mat-label>
                  <mat-select [(value)]="sortBy">
                    <mat-option value="participants">Participants</mat-option>
                    <mat-option value="hours">Hours</mat-option>
                    <mat-option value="rating">Rating</mat-option>
                  </mat-select>
                </mat-form-field>
              </mat-card-header>
              <mat-card-content class="p-4">
                <table mat-table [dataSource]="sortedEventStats" matSort>
                  <ng-container matColumnDef="event">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Event</th>
                    <td mat-cell *matCellDef="let stat">{{stat.eventName}}</td>
                  </ng-container>

                  <ng-container matColumnDef="participants">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Participants</th>
                    <td mat-cell *matCellDef="let stat">
                      <div class="flex items-center">
                        <span>{{stat.participantCount}}</span>
                        <mat-progress-bar
                          mode="determinate"
                          [value]="(stat.participantCount / maxParticipants) * 100"
                          class="ml-2">
                        </mat-progress-bar>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="hours">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Hours</th>
                    <td mat-cell *matCellDef="let stat">{{stat.totalHours}}</td>
                  </ng-container>

                  <ng-container matColumnDef="rating">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Rating</th>
                    <td mat-cell *matCellDef="let stat">
                      <div class="flex items-center">
                        <mat-icon class="text-yellow-500">star</mat-icon>
                        <span>{{stat.averageRating | number:'1.1-1'}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['event', 'participants', 'hours', 'rating']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['event', 'participants', 'hours', 'rating'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Export Reports Tab -->
        <mat-tab label="Export Reports">
          <div class="mt-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Generate Reports</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <form [formGroup]="reportForm" (ngSubmit)="generateReport()">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Report Type</mat-label>
                      <mat-select formControlName="reportType">
                        <mat-option value="USER">User Report</mat-option>
                        <mat-option value="EVENT">Event Report</mat-option>
                        <mat-option value="ORGANIZATION">Organization Report</mat-option>
                        <mat-option value="VOLUNTEER">Volunteer Report</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Format</mat-label>
                      <mat-select formControlName="format">
                        <mat-option value="PDF">PDF</mat-option>
                        <mat-option value="EXCEL">Excel</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date Range</mat-label>
                      <mat-date-range-input [rangePicker]="picker">
                        <input matStartDate formControlName="startDate" placeholder="Start date">
                        <input matEndDate formControlName="endDate" placeholder="End date">
                      </mat-date-range-input>
                      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-date-range-picker #picker></mat-date-range-picker>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Include Charts</mat-label>
                      <mat-select formControlName="includeCharts">
                        <mat-option [value]="true">Yes</mat-option>
                        <mat-option [value]="false">No</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="mt-4">
                    <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                      <mat-icon>download</mat-icon>
                      Generate Report
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Report History -->
            <mat-card class="mt-4">
              <mat-card-header>
                <mat-card-title>Report History</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <table mat-table [dataSource]="reportHistory">
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let report">{{report.type}}</td>
                  </ng-container>

                  <ng-container matColumnDef="generatedAt">
                    <th mat-header-cell *matHeaderCellDef>Generated At</th>
                    <td mat-cell *matCellDef="let report">{{report.generatedAt | date:'medium'}}</td>
                  </ng-container>

                  <ng-container matColumnDef="format">
                    <th mat-header-cell *matHeaderCellDef>Format</th>
                    <td mat-cell *matCellDef="let report">{{report.format}}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let report">
                      <button mat-icon-button [matMenuTriggerFor]="menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="downloadReport(report.id)">
                          <mat-icon>download</mat-icon>
                          <span>Download</span>
                        </button>
                        <button mat-menu-item (click)="deleteReport(report.id)">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['type', 'generatedAt', 'format', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['type', 'generatedAt', 'format', 'actions'];"></tr>
                </table>

                <mat-paginator
                  [pageSizeOptions]="[5, 10, 25, 100]"
                  [pageSize]="10"
                  showFirstLastButtons>
                </mat-paginator>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .ml-auto {
      margin-left: auto;
    }

    .mt-4 {
      margin-top: 1rem;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .grid {
      display: grid;
    }

    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .md\:grid-cols-2 {
      @media (min-width: 768px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .lg\:grid-cols-4 {
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .gap-4 {
      gap: 1rem;
    }

    .flex {
      display: flex;
    }

    .items-center {
      align-items: center;
    }

    .justify-between {
      justify-content: space-between;
    }

    .text-gray-600 {
      color: #4B5563;
    }

    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .font-bold {
      font-weight: 700;
    }

    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .text-green-500 {
      color: #10B981;
    }

    .text-primary-500 {
      color: #3B82F6;
    }

    .text-yellow-500 {
      color: #F59E0B;
    }

    .ml-2 {
      margin-left: 0.5rem;
    }

    mat-card {
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    mat-card-header {
      padding: 1rem;
      border-bottom: 1px solid #E5E7EB;
    }

    mat-card-content {
      padding: 1rem;
    }

    table {
      width: 100%;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }
  `]
})
export class ReportsComponent implements OnInit {
  stats: OverviewStatistics = {
    totalUsers: 0,
    userGrowthRate: 0,
    activeOrganizations: 0,
    organizationGrowthRate: 0,
    totalEvents: 0,
    eventGrowthRate: 0,
    totalVolunteerHours: 0,
    volunteerHoursGrowthRate: 0
  };

  LegendPosition = LegendPosition;

  userActivity: UserActivity[] = [];
  eventStats: EventStatistics[] = [];
  reportHistory: Report[] = [];
  selectedAction: string = '';
  sortBy: string = 'participants';
  loading = false;
  maxParticipants = 0;

  // Chart data
  userGrowthData: any[] = [];
  eventDistributionData: any[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  customColors: any[] = [];
  curve = 'linear';
  activeEntries: any[] = [];
  referenceLines: any[] = [];

  reportForm: FormGroup;

  constructor(
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reportForm = this.formBuilder.group({
      reportType: ['USER'],
      format: ['PDF'],
      startDate: [null],
      endDate: [null],
      includeCharts: [true]
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadUserActivity();
    this.loadEventStatistics();
    this.loadReportHistory();
    this.initializeChartData();
  }

  loadStatistics(): void {
    this.loading = true;
    this.reportService.getOverviewStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.snackBar.open('Error loading statistics', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadUserActivity(): void {
    this.loading = true;
    this.reportService.getUserActivity().subscribe({
      next: (activity) => {
        this.userActivity = activity;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user activity:', error);
        this.snackBar.open('Error loading user activity', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadEventStatistics(): void {
    this.loading = true;
    this.reportService.getEventStatistics().subscribe({
      next: (stats) => {
        this.eventStats = stats;
        this.maxParticipants = Math.max(...stats.map(s => s.participantCount));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event statistics:', error);
        this.snackBar.open('Error loading event statistics', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadReportHistory(): void {
    this.loading = true;
    this.reportService.getReports().subscribe({
      next: (reports) => {
        this.reportHistory = reports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report history:', error);
        this.snackBar.open('Error loading report history', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  initializeChartData(): void {
    // User Growth Data
    this.userGrowthData = [
      {
        name: 'Volunteers',
        series: [
          { name: 'Jan', value: 100 },
          { name: 'Feb', value: 150 },
          { name: 'Mar', value: 200 },
          { name: 'Apr', value: 250 },
          { name: 'May', value: 300 },
          { name: 'Jun', value: 350 }
        ]
      },
      {
        name: 'Organizations',
        series: [
          { name: 'Jan', value: 50 },
          { name: 'Feb', value: 75 },
          { name: 'Mar', value: 100 },
          { name: 'Apr', value: 125 },
          { name: 'May', value: 150 },
          { name: 'Jun', value: 175 }
        ]
      }
    ];

    // Event Distribution Data
    this.eventDistributionData = [
      { name: 'Education', value: 35 },
      { name: 'Environment', value: 25 },
      { name: 'Health', value: 20 },
      { name: 'Social', value: 15 },
      { name: 'Other', value: 5 }
    ];

    // Reference Lines
    this.referenceLines = [
      { name: 'Target', value: 400 }
    ];
  }

  get filteredUserActivity(): UserActivity[] {
    if (!this.selectedAction) return this.userActivity;
    return this.userActivity.filter(activity => activity.action === this.selectedAction);
  }

  get sortedEventStats(): EventStatistics[] {
    return [...this.eventStats].sort((a, b) => {
      switch (this.sortBy) {
        case 'participants':
          return b.participantCount - a.participantCount;
        case 'hours':
          return b.totalHours - a.totalHours;
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'LOGIN':
        return 'primary';
      case 'REGISTER':
        return 'accent';
      case 'UPDATE_PROFILE':
        return 'warn';
      case 'JOIN_EVENT':
        return 'primary';
      case 'COMPLETE_EVENT':
        return 'accent';
      default:
        return '';
    }
  }

  generateReport(): void {
    if (this.loading) return;

    this.loading = true;
    const formValue = this.reportForm.value;

    this.reportService.generateReport(
      formValue.reportType,
      formValue.startDate,
      formValue.endDate
    ).subscribe({
      next: (response) => {
        this.downloadFile(response.fileUrl, response.fileName);
        this.loadReportHistory();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.snackBar.open('Error generating report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  downloadReport(reportId: string): void {
    this.reportService.getReport(reportId).subscribe({
      next: (report) => {
        if (report.downloadUrl) {
          this.downloadFile(report.downloadUrl, `report-${reportId}.${report.format.toLowerCase()}`);
        }
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.snackBar.open('Error downloading report', 'Close', { duration: 3000 });
      }
    });
  }

  deleteReport(reportId: string): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.deleteReport(reportId).subscribe({
        next: () => {
          this.loadReportHistory();
          this.snackBar.open('Report deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting report:', error);
          this.snackBar.open('Error deleting report', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private downloadFile(fileUrl: string, fileName: string): void {
    this.reportService.downloadReport(fileUrl).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.snackBar.open('Error downloading file', 'Close', { duration: 3000 });
      }
    });
  }
} 