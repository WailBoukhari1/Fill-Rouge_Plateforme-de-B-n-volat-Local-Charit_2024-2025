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
import { ReportType, OverviewStatistics, UserActivity, EventStatistics } from '../../../../core/models/report.model';

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
    ReactiveFormsModule
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
                <!-- Add chart component here -->
              </mat-card-content>
            </mat-card>

            <!-- Event Distribution Chart -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Event Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <!-- Add chart component here -->
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
              </mat-card-header>
              <mat-card-content class="p-4">
                <table mat-table [dataSource]="userActivity" class="w-full">
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let activity">{{activity.userName}}</td>
                  </ng-container>

                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef>Action</th>
                    <td mat-cell *matCellDef="let activity">{{activity.action}}</td>
                  </ng-container>

                  <ng-container matColumnDef="timestamp">
                    <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                    <td mat-cell *matCellDef="let activity">{{activity.timestamp | date:'medium'}}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['user', 'action', 'timestamp']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['user', 'action', 'timestamp'];"></tr>
                </table>
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
              </mat-card-header>
              <mat-card-content class="p-4">
                <table mat-table [dataSource]="eventStats" class="w-full">
                  <ng-container matColumnDef="event">
                    <th mat-header-cell *matHeaderCellDef>Event</th>
                    <td mat-cell *matCellDef="let stat">{{stat.eventName}}</td>
                  </ng-container>

                  <ng-container matColumnDef="participants">
                    <th mat-header-cell *matHeaderCellDef>Participants</th>
                    <td mat-cell *matCellDef="let stat">{{stat.participantCount}}</td>
                  </ng-container>

                  <ng-container matColumnDef="hours">
                    <th mat-header-cell *matHeaderCellDef>Hours</th>
                    <td mat-cell *matCellDef="let stat">{{stat.totalHours}}</td>
                  </ng-container>

                  <ng-container matColumnDef="rating">
                    <th mat-header-cell *matHeaderCellDef>Rating</th>
                    <td mat-cell *matCellDef="let stat">{{stat.averageRating}}</td>
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <mat-form-field>
                    <mat-label>Report Type</mat-label>
                    <mat-select [(value)]="selectedReportType">
                      <mat-option value="user">User Report</mat-option>
                      <mat-option value="event">Event Report</mat-option>
                      <mat-option value="organization">Organization Report</mat-option>
                      <mat-option value="volunteer">Volunteer Report</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Date Range</mat-label>
                    <mat-date-range-input [rangePicker]="picker">
                      <input matStartDate placeholder="Start date">
                      <input matEndDate placeholder="End date">
                    </mat-date-range-input>
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-date-range-picker #picker></mat-date-range-picker>
                  </mat-form-field>
                </div>

                <div class="mt-4">
                  <button mat-raised-button color="primary" (click)="generateReport()">
                    <mat-icon>download</mat-icon>
                    Generate Report
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
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

  userActivity: UserActivity[] = [];
  eventStats: EventStatistics[] = [];
  selectedReportType: ReportType = ReportType.USER;
  reportForm: FormGroup;
  loading = false;

  constructor(
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reportForm = this.formBuilder.group({
      reportType: [ReportType.USER],
      dateRange: this.formBuilder.group({
        start: [null],
        end: [null]
      })
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadUserActivity();
    this.loadEventStatistics();
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event statistics:', error);
        this.snackBar.open('Error loading event statistics', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  generateReport(): void {
    if (this.loading) return;

    this.loading = true;
    const formValue = this.reportForm.value;
    const startDate = formValue.dateRange?.start;
    const endDate = formValue.dateRange?.end;

    this.reportService.generateReport(formValue.reportType, startDate, endDate).subscribe({
      next: (response) => {
        this.downloadFile(response.fileUrl, response.fileName);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.snackBar.open('Error generating report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
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