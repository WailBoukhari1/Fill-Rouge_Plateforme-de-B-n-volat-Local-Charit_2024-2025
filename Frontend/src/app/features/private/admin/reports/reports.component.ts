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
      <div class="header mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p class="text-gray-600 mt-2">View and analyze your organization's performance metrics</p>
      </div>

      <mat-tab-group class="reports-tabs" animationDuration="200ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <!-- Total Users -->
            <mat-card class="dashboard-card hover:shadow-lg transition-shadow duration-300">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm uppercase tracking-wide">Total Users</p>
                    <h2 class="text-3xl font-bold mt-2">{{stats.totalUsers}}</h2>
                    <p class="text-sm mt-2" [ngClass]="stats.userGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'">
                      <mat-icon class="text-sm align-middle">{{stats.userGrowthRate >= 0 ? 'arrow_upward' : 'arrow_downward'}}</mat-icon>
                      <span class="ml-1">{{stats.userGrowthRate}}% growth</span>
                    </p>
                  </div>
                  <div class="icon-container">
                    <mat-icon class="text-primary-500 text-4xl">people</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Active Organizations -->
            <mat-card class="dashboard-card hover:shadow-lg transition-shadow duration-300">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm uppercase tracking-wide">Active Organizations</p>
                    <h2 class="text-3xl font-bold mt-2">{{stats.activeOrganizations}}</h2>
                    <p class="text-sm mt-2" [ngClass]="stats.organizationGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'">
                      <mat-icon class="text-sm align-middle">{{stats.organizationGrowthRate >= 0 ? 'arrow_upward' : 'arrow_downward'}}</mat-icon>
                      <span class="ml-1">{{stats.organizationGrowthRate}}% growth</span>
                    </p>
                  </div>
                  <div class="icon-container">
                    <mat-icon class="text-primary-500 text-4xl">business</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Total Events -->
            <mat-card class="dashboard-card hover:shadow-lg transition-shadow duration-300">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm uppercase tracking-wide">Total Events</p>
                    <h2 class="text-3xl font-bold mt-2">{{stats.totalEvents}}</h2>
                    <p class="text-sm mt-2" [ngClass]="stats.eventGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'">
                      <mat-icon class="text-sm align-middle">{{stats.eventGrowthRate >= 0 ? 'arrow_upward' : 'arrow_downward'}}</mat-icon>
                      <span class="ml-1">{{stats.eventGrowthRate}}% growth</span>
                    </p>
                  </div>
                  <div class="icon-container">
                    <mat-icon class="text-primary-500 text-4xl">event</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Volunteer Hours -->
            <mat-card class="dashboard-card hover:shadow-lg transition-shadow duration-300">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm uppercase tracking-wide">Volunteer Hours</p>
                    <h2 class="text-3xl font-bold mt-2">{{stats.totalVolunteerHours}}</h2>
                    <p class="text-sm mt-2" [ngClass]="stats.volunteerHoursGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'">
                      <mat-icon class="text-sm align-middle">{{stats.volunteerHoursGrowthRate >= 0 ? 'arrow_upward' : 'arrow_downward'}}</mat-icon>
                      <span class="ml-1">{{stats.volunteerHoursGrowthRate}}% growth</span>
                    </p>
                  </div>
                  <div class="icon-container">
                    <mat-icon class="text-primary-500 text-4xl">schedule</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <!-- User Growth Chart -->
            <mat-card class="chart-card">
              <mat-card-header class="border-b border-gray-200 p-6">
                <mat-card-title class="text-xl font-semibold">User Growth</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
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
            <mat-card class="chart-card">
              <mat-card-header class="border-b border-gray-200 p-6">
                <mat-card-title class="text-xl font-semibold">Event Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
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
                <mat-form-field class="ml-auto">
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
                <mat-form-field class="ml-auto">
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
                    <mat-form-field>
                      <mat-label>Report Type</mat-label>
                      <mat-select formControlName="reportType">
                        <mat-option value="USER">User Report</mat-option>
                        <mat-option value="EVENT">Event Report</mat-option>
                        <mat-option value="ORGANIZATION">Organization Report</mat-option>
                        <mat-option value="VOLUNTEER">Volunteer Report</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Format</mat-label>
                      <mat-select formControlName="format">
                        <mat-option value="PDF">PDF</mat-option>
                        <mat-option value="EXCEL">Excel</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Date Range</mat-label>
                      <mat-date-range-input [rangePicker]="picker">
                        <input matStartDate formControlName="startDate" placeholder="Start date">
                        <input matEndDate formControlName="endDate" placeholder="End date">
                      </mat-date-range-input>
                      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-date-range-picker #picker></mat-date-range-picker>
                    </mat-form-field>

                    <mat-form-field>
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
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      position: relative;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 60px;
      height: 4px;
      background: #2196f3;
      border-radius: 2px;
    }

    .reports-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      overflow: hidden;
      height: 400px;
    }

    .icon-container {
      background: rgba(33, 150, 243, 0.1);
      padding: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    mat-card-header {
      background: #fafafa;
    }

    .mat-mdc-tab-group {
      border-radius: 12px;
      overflow: hidden;
    }

    .mat-mdc-tab {
      min-width: 120px;
    }

    .align-middle {
      vertical-align: middle;
    }

    .transition-shadow {
      transition: box-shadow 0.3s ease-in-out;
    }

    .hover\\:shadow-lg:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    th.mat-header-cell {
      background: #fafafa;
      padding: 16px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    td.mat-cell {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    tr.mat-row:hover {
      background: #f9fafb;
    }

    .mat-column-actions {
      width: 100px;
      text-align: right;
    }

    mat-form-field {
      width: 100%;
    }

    .mat-mdc-card-content {
      padding: 0;
    }

    .mat-mdc-progress-bar {
      border-radius: 4px;
    }

    .text-primary-500 {
      color: #2196f3;
    }

    .tracking-wide {
      letter-spacing: 0.025em;
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
    console.log('Loading statistics...');
    this.reportService.getOverviewStatistics().subscribe({
      next: (stats) => {
        console.log('Received statistics:', stats);
        if (!stats) {
          console.error('Received null or undefined statistics');
          this.snackBar.open('Error: Received invalid statistics data', 'Close', { duration: 3000 });
          this.loading = false;
          return;
        }

        try {
          console.log('Processing statistics data...');
          this.stats = {
            totalUsers: this.getValueOrDefault(stats.totalUsers, 0, 'totalUsers'),
            userGrowthRate: this.getValueOrDefault(stats.userGrowthRate, 0, 'userGrowthRate'),
            activeOrganizations: this.getValueOrDefault(stats.activeOrganizations, 0, 'activeOrganizations'),
            organizationGrowthRate: this.getValueOrDefault(stats.organizationGrowthRate, 0, 'organizationGrowthRate'),
            totalEvents: this.getValueOrDefault(stats.totalEvents, 0, 'totalEvents'),
            eventGrowthRate: this.getValueOrDefault(stats.eventGrowthRate, 0, 'eventGrowthRate'),
            totalVolunteerHours: this.getValueOrDefault(stats.totalVolunteerHours, 0, 'totalVolunteerHours'),
            volunteerHoursGrowthRate: this.getValueOrDefault(stats.volunteerHoursGrowthRate, 0, 'volunteerHoursGrowthRate')
          };
          console.log('Successfully updated stats object:', this.stats);
        } catch (error) {
          console.error('Error processing statistics data:', error);
          this.snackBar.open('Error processing statistics data', 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        let errorMessage = 'An error occurred while loading statistics';
        
        if (error.status === 404) {
          errorMessage = 'Statistics data not found';
        } else if (error.status === 403) {
          errorMessage = 'Access denied to statistics data';
        } else if (error.status === 500) {
          errorMessage = 'Server error while loading statistics';
        }
        
        console.log('Showing error message:', errorMessage);
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private getValueOrDefault(value: any, defaultValue: number, fieldName: string): number {
    if (value === null || value === undefined) {
      console.warn(`${fieldName} is ${value}, using default value: ${defaultValue}`);
      return defaultValue;
    }
    if (typeof value !== 'number') {
      console.warn(`${fieldName} is not a number (${typeof value}), attempting to convert...`);
      const converted = Number(value);
      if (isNaN(converted)) {
        console.warn(`Could not convert ${fieldName} to number, using default value: ${defaultValue}`);
        return defaultValue;
      }
      return converted;
    }
    return value;
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
    if (!this.reportForm.valid) {
      console.error('Report form is invalid:', this.reportForm.errors);
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.reportForm.value;
    console.log('Generating report with form values:', formValue);

    this.loading = true;
    this.reportService.generateReport(
      formValue.reportType,
      formValue.startDate,
      formValue.endDate
    ).subscribe({
      next: (response) => {
        console.log('Report generation response:', response);
        if (!response || !response.fileUrl) {
          console.error('Invalid report response:', response);
          this.snackBar.open('Error: Invalid report response from server', 'Close', { duration: 3000 });
          return;
        }

        // Download the report
        this.downloadFile(response.fileUrl, response.fileName || `report.${formValue.format.toLowerCase()}`);
        this.snackBar.open('Report generated successfully', 'Close', { duration: 3000 });
        
        // Refresh report history
        this.loadReportHistory();
      },
      error: (error) => {
        console.error('Error generating report:', error);
        let errorMessage = 'Error generating report: ';
        
        if (error.status === 400) {
          errorMessage += 'Invalid request parameters';
        } else if (error.status === 403) {
          errorMessage += 'Access denied';
        } else if (error.status === 404) {
          errorMessage += 'Report type not found';
        } else if (error.status === 500) {
          errorMessage += 'Server error';
        } else {
          errorMessage += error.message || 'Unknown error';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      },
      complete: () => {
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