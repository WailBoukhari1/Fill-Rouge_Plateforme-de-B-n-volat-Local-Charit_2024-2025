import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatisticsService, AdminStatistics } from '../../../../core/services/statistics.service';
import * as echarts from 'echarts';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container mx-auto p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Admin Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Total Users</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalUsers || 0}}</div>
              <div class="text-sm text-gray-500">
                Active: {{stats?.activeUsers || 0}}
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Organizations</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalOrganizations || 0}}</div>
              <div class="text-sm text-gray-500">Active: {{stats?.activeOrganizations || 0}}</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Total Events</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalEvents || 0}}</div>
              <div class="text-sm text-gray-500">Categories: {{stats?.totalEventCategories || 0}}</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Volunteer Hours</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalVolunteerHours || 0}}</div>
              <div class="text-sm text-gray-500">Total Hours</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>User Growth</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #growthChart class="chart-container"></div>
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
              <mat-card-title>Platform Growth</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #platformChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>User Engagement</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #engagementChart class="chart-container"></div>
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
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('growthChart') growthChart!: ElementRef;
  @ViewChild('distributionChart') distributionChart!: ElementRef;
  @ViewChild('platformChart') platformChart!: ElementRef;
  @ViewChild('engagementChart') engagementChart!: ElementRef;

  stats: AdminStatistics | null = null;
  loading = true;
  private growthChartInstance: echarts.ECharts | null = null;
  private distributionChartInstance: echarts.ECharts | null = null;
  private platformChartInstance: echarts.ECharts | null = null;
  private engagementChartInstance: echarts.ECharts | null = null;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.statisticsService.getAdminStatistics().subscribe({
      next: (response) => {
        if (!response.data) {
          console.error('No data in response');
          this.loading = false;
          return;
        }
        this.stats = response.data;
        this.loading = false;
        this.initializeCharts();
      },
      error: (error: Error) => {
        console.error('Error loading admin statistics:', error);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  private initializeCharts(): void {
    if (!this.stats) return;

    // Growth Chart
    if (this.growthChart?.nativeElement) {
      this.growthChartInstance = echarts.init(this.growthChart.nativeElement);
      this.growthChartInstance.setOption({
        title: { 
          text: 'User Growth',
          left: 'center'
        },
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c} users'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          data: this.stats.userGrowth.map(g => g.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Users'
        },
        series: [{
          name: 'Users',
          type: 'line',
          smooth: true,
          data: this.stats.userGrowth.map(g => g.users),
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

    // Platform Growth Chart
    if (this.platformChart?.nativeElement) {
      this.platformChartInstance = echarts.init(this.platformChart.nativeElement);
      this.platformChartInstance.setOption({
        title: { 
          text: 'Platform Growth',
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
          data: this.stats.platformGrowth.map(g => g.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Growth Rate (%)'
        },
        series: [{
          name: 'Growth',
          type: 'line',
          smooth: true,
          data: this.stats.platformGrowth.map(g => g.growth),
          itemStyle: { color: '#10B981' }
        }]
      });
    }

    // User Engagement Chart
    if (this.engagementChart?.nativeElement) {
      this.engagementChartInstance = echarts.init(this.engagementChart.nativeElement);
      this.engagementChartInstance.setOption({
        title: { 
          text: 'User Engagement',
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
          data: this.stats.userEngagement.map(e => e.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Engagement Rate (%)'
        },
        series: [{
          name: 'Engagement',
          type: 'bar',
          data: this.stats.userEngagement.map(e => e.engagement),
          itemStyle: { color: '#8B5CF6' }
        }]
      });
    }
  }

  ngOnDestroy(): void {
    if (this.growthChartInstance) {
      this.growthChartInstance.dispose();
    }
    if (this.distributionChartInstance) {
      this.distributionChartInstance.dispose();
    }
    if (this.platformChartInstance) {
      this.platformChartInstance.dispose();
    }
    if (this.engagementChartInstance) {
      this.engagementChartInstance.dispose();
    }
  }
} 