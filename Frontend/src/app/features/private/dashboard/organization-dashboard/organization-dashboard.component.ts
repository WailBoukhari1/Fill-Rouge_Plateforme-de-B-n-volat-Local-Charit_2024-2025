import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatisticsService, OrganizationStatistics } from '../../../../core/services/statistics.service';
import { AuthService } from '../../../../core/services/auth.service';
import * as echarts from 'echarts';
import { switchMap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-organization-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container mx-auto p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Organization Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Total Events</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalEvents || 0}}</div>
              <div class="text-sm text-gray-500">
                Active: {{stats?.activeEvents || 0}} | Completed: {{stats?.completedEvents || 0}}
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Total Volunteers</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalVolunteers || 0}}</div>
              <div class="text-sm text-gray-500">Active: {{stats?.activeVolunteers || 0}}</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Volunteer Hours</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalVolunteerHours || 0}}</div>
              <div class="text-sm text-gray-500">Total Hours</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Average Rating</div>
              <div class="text-3xl font-bold text-primary">{{stats?.averageEventRating || 0 | number:'1.1-1'}}</div>
              <div class="text-sm text-gray-500">From Volunteers</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Volunteer Engagement</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #engagementChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Event Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #distributionChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Additional Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Volunteer Retention</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #retentionChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Event Success Rate</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #successChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      height: 300px;
      width: 100%;
    }
  `]
})
export class OrganizationDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('engagementChart') engagementChart!: ElementRef;
  @ViewChild('distributionChart') distributionChart!: ElementRef;
  @ViewChild('retentionChart') retentionChart!: ElementRef;
  @ViewChild('successChart') successChart!: ElementRef;

  stats: OrganizationStatistics | null = null;
  loading = true;
  private engagementChartInstance: echarts.ECharts | null = null;
  private distributionChartInstance: echarts.ECharts | null = null;
  private retentionChartInstance: echarts.ECharts | null = null;
  private successChartInstance: echarts.ECharts | null = null;

  private statisticsService = inject(StatisticsService);
  private authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.authService.currentUser$.pipe(
      filter(user => user !== null),
      map(user => user.id),
      switchMap(orgId => this.statisticsService.getOrganizationStatistics(orgId))
    ).subscribe({
      next: (data: OrganizationStatistics) => {
        this.stats = data;
        this.loading = false;
        this.initializeCharts();
      },
      error: (error: Error) => {
        console.error('Error loading organization statistics:', error);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  private initializeCharts(): void {
    if (!this.stats) return;

    // Engagement Chart
    if (this.engagementChart?.nativeElement) {
      this.engagementChartInstance = echarts.init(this.engagementChart.nativeElement);
      this.engagementChartInstance.setOption({
        title: { 
          text: 'Volunteer Engagement',
          left: 'center'
        },
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c} volunteers'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          data: this.stats.volunteerEngagement.map(e => e.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Volunteers'
        },
        series: [{
          name: 'Volunteers',
          type: 'line',
          smooth: true,
          data: this.stats.volunteerEngagement.map(e => e.volunteers),
          itemStyle: { color: '#3B82F6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ])
          }
        }]
      });
    }

    // Distribution Chart
    if (this.distributionChart?.nativeElement) {
      this.distributionChartInstance = echarts.init(this.distributionChart.nativeElement);
      this.distributionChartInstance.setOption({
        title: { 
          text: 'Event Distribution',
          left: 'center'
        },
        tooltip: { 
          trigger: 'item',
          formatter: '{b}: {c} events ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [{
          name: 'Events',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: Object.entries(this.stats.eventDistribution).map(([name, value]) => ({
            name,
            value
          }))
        }]
      });
    }

    // Retention Chart
    if (this.retentionChart?.nativeElement) {
      this.retentionChartInstance = echarts.init(this.retentionChart.nativeElement);
      this.retentionChartInstance.setOption({
        title: { 
          text: 'Volunteer Retention',
          left: 'center'
        },
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          data: this.stats.volunteerRetention.map(r => r.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Retention Rate (%)'
        },
        series: [{
          name: 'Retention',
          type: 'line',
          smooth: true,
          data: this.stats.volunteerRetention.map(r => r.retention),
          itemStyle: { color: '#10B981' }
        }]
      });
    }

    // Success Rate Chart
    if (this.successChart?.nativeElement) {
      this.successChartInstance = echarts.init(this.successChart.nativeElement);
      this.successChartInstance.setOption({
        title: { 
          text: 'Event Success Rate',
          left: 'center'
        },
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          data: this.stats.eventSuccessRate.map(s => s.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Success Rate (%)'
        },
        series: [{
          name: 'Success Rate',
          type: 'bar',
          data: this.stats.eventSuccessRate.map(s => s.rate),
          itemStyle: { color: '#8B5CF6' }
        }]
      });
    }
  }

  ngOnDestroy(): void {
    if (this.engagementChartInstance) {
      this.engagementChartInstance.dispose();
    }
    if (this.distributionChartInstance) {
      this.distributionChartInstance.dispose();
    }
    if (this.retentionChartInstance) {
      this.retentionChartInstance.dispose();
    }
    if (this.successChartInstance) {
      this.successChartInstance.dispose();
    }
  }
} 