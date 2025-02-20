import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Chart, ChartType } from 'chart.js/auto';

import * as VolunteerActions from '../../../store/volunteer/volunteer.actions';
import * as VolunteerSelectors from '../../../store/volunteer/volunteer.selectors';
import { VolunteerStatistics, VolunteerHours } from '../../../core/services/volunteer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Volunteer Dashboard</h1>

      <!-- Loading Spinner -->
      @if (loading$ | async) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Hours by Month Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Hours by Month</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              <canvas #hoursChart></canvas>
            </mat-card-content>
          </mat-card>

          <!-- Events by Category Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Events by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              <canvas #categoryChart></canvas>
            </mat-card-content>
          </mat-card>

          <!-- Participation by Day Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Participation by Day</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              <canvas #participationChart></canvas>
            </mat-card-content>
          </mat-card>

          <!-- Growth Metrics Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Growth Metrics</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              <canvas #growthChart></canvas>
            </mat-card-content>
          </mat-card>
        </div>
      }

      @if (error$ | async) {
        <div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {{error$ | async}}
          <button mat-button color="warn" (click)="retryLoading()">Retry</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-height: 300px;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('hoursChart') hoursChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('participationChart') participationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('growthChart') growthChartRef!: ElementRef<HTMLCanvasElement>;

  statistics$: Observable<VolunteerStatistics | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private hoursChart: Chart<'line'> | null = null;
  private categoryChart: Chart<'pie'> | null = null;
  private participationChart: Chart<'bar'> | null = null;
  private growthChart: Chart<'line'> | null = null;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.statistics$ = this.store.select(VolunteerSelectors.selectVolunteerStatistics);
    this.loading$ = this.store.select(VolunteerSelectors.selectVolunteerLoading);
    this.error$ = this.store.select(VolunteerSelectors.selectVolunteerError);
  }

  ngOnInit(): void {
    this.store.dispatch(VolunteerActions.loadStatistics());
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
    this.statistics$.subscribe(stats => {
      if (stats) {
        this.updateCharts(stats);
      }
    });
  }

  private initializeCharts(): void {
    // Initialize Hours Chart
    this.hoursChart = new Chart(this.hoursChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Hours Volunteered',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Initialize Category Chart
    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Initialize Participation Chart
    this.participationChart = new Chart(this.participationChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Events Attended',
          data: [],
          backgroundColor: 'rgb(54, 162, 235)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Initialize Growth Chart
    this.growthChart = new Chart(this.growthChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Participation Growth',
            data: [],
            borderColor: 'rgb(75, 192, 192)'
          },
          {
            label: 'Hours Growth',
            data: [],
            borderColor: 'rgb(255, 99, 132)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private updateCharts(stats: VolunteerStatistics): void {
    // Update Hours Chart
    if (this.hoursChart && stats.hoursByMonth) {
      const labels = Object.keys(stats.hoursByMonth);
      const data = Object.values(stats.hoursByMonth);
      this.hoursChart.data.labels = labels;
      this.hoursChart.data.datasets[0].data = data;
      this.hoursChart.update();
    }

    // Update Category Chart
    if (this.categoryChart && stats.eventsByCategory) {
      const labels = Object.keys(stats.eventsByCategory);
      const data = Object.values(stats.eventsByCategory);
      this.categoryChart.data.labels = labels;
      this.categoryChart.data.datasets[0].data = data;
      this.categoryChart.update();
    }

    // Update Participation Chart
    if (this.participationChart && stats.participationByDay) {
      const data = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        .map(day => stats.participationByDay[day] || 0);
      this.participationChart.data.datasets[0].data = data;
      this.participationChart.update();
    }

    // Update Growth Chart
    if (this.growthChart) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const participationData = months.map(() => stats.participationGrowthRate * 100);
      const hoursData = months.map(() => stats.hoursGrowthRate * 100);
      this.growthChart.data.datasets[0].data = participationData;
      this.growthChart.data.datasets[1].data = hoursData;
      this.growthChart.update();
    }
  }

  retryLoading() {
    this.store.dispatch(VolunteerActions.loadStatistics());
  }
}