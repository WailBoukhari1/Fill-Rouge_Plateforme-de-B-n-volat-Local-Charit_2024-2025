import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { StatisticsService } from '../../../../core/services/statistics.service';
import { MatTabsModule } from '@angular/material/tabs';
import { VolunteerStatistics } from '../../../../core/models/statistics.model';
import { curveLinear } from 'd3-shape';

interface MonthlyParticipation {
  name: string;
  value: number;
}

interface HoursContribution {
  name: string;
  value: number;
}

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
    MatTabsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Volunteer Dashboard</h1>
      
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error) {
        <mat-card class="bg-red-50 border border-red-200 mb-6">
          <mat-card-content class="p-4">
            <div class="flex items-center">
              <mat-icon class="text-red-500 mr-2">error</mat-icon>
              <span>Failed to load statistics: {{error}}</span>
            </div>
            <div class="mt-2">
              <button mat-button color="primary" (click)="loadStatistics()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Total Events</div>
                  <div class="text-2xl font-bold text-blue-600">{{ stats?.totalEventsParticipated || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Completed: {{ stats?.completedEvents || 0 }}</div>
                </div>
                <mat-icon class="text-blue-500 opacity-80 text-3xl">event</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Volunteer Hours</div>
                  <div class="text-2xl font-bold text-indigo-600">{{ stats?.totalVolunteerHours || 0 }}</div>
                </div>
                <mat-icon class="text-indigo-500 opacity-80 text-3xl">schedule</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Reliability Score</div>
                  <div class="text-2xl font-bold text-green-600">{{ stats?.reliabilityScore?.toFixed(1) || 0 }}%</div>
                </div>
                <mat-icon class="text-green-500 opacity-80 text-3xl">verified</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md hover:shadow-lg transition-shadow">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">Average Rating</div>
                  <div class="text-2xl font-bold text-amber-600">{{ stats?.averageEventRating?.toFixed(1) || 0 }}/5</div>
                </div>
                <mat-icon class="text-amber-500 opacity-80 text-3xl">star</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Hours Contributed</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-area-chart
                [results]="[{ name: 'Hours', series: hoursContributed }]"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                [xAxisLabel]="'Month'"
                [yAxisLabel]="'Hours'"
                [curve]="curve"
                [legend]="false"
                [autoScale]="true">
              </ngx-charts-area-chart>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Events by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-pie-chart
                [results]="eventsByCategory"
                [gradient]="true"
                [labels]="true"
                [doughnut]="true"
                [legend]="true"
                [arcWidth]="0.35"
                [animations]="true">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Skills Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-bar-horizontal
                [results]="skillsDistribution"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                [xAxisLabel]="'Count'"
                [yAxisLabel]="'Skill'"
                [roundDomains]="true">
              </ngx-charts-bar-horizontal>
            </mat-card-content>
          </mat-card>

          <mat-card class="shadow-md">
            <mat-card-header>
              <mat-card-title>Monthly Participation</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-line-chart
                [results]="[{ name: 'Events', series: monthlyParticipation }]"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                [xAxisLabel]="'Month'"
                [yAxisLabel]="'Events'"
                [curve]="curve"
                [legend]="false"
                [autoScale]="true">
              </ngx-charts-line-chart>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    mat-card {
      border-radius: 8px;
      overflow: hidden;
    }
    mat-card:hover {
      transform: translateY(-2px);
      transition: transform 0.2s ease-in-out;
    }
  `]
})
export class VolunteerDashboardComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  stats: VolunteerStatistics | null = null;
  curve = curveLinear;
  
  hoursContributed: HoursContribution[] = [];
  monthlyParticipation: MonthlyParticipation[] = [];
  eventsByCategory: any[] = [];
  skillsDistribution: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.statisticsService.getVolunteerStatistics(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stats = response.data || null;
          this.formatChartData();
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.message || 'An error occurred while loading statistics';
          this.loading = false;
        }
      });
  }

  formatChartData(): void {
    if (!this.stats) return;

    // Format hours contributed
    this.hoursContributed = (this.stats.hoursContributed || []).map(item => ({
      name: item.date,
      value: item.hours
    }));

    // Format monthly participation
    this.monthlyParticipation = (this.stats.monthlyParticipation || []).map(item => ({
      name: item.month,
      value: item.events
    }));

    // Format events by category
    this.eventsByCategory = Object.entries(this.stats.eventsByCategory || {}).map(([name, value]) => ({
      name,
      value
    }));

    // Format skills distribution
    this.skillsDistribution = Object.entries(this.stats.skillsDistribution || {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Show only top 7 skills
  }
} 