import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatisticsService, VolunteerStatistics } from '../../../../core/services/statistics.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/models/auth.models';
import * as echarts from 'echarts';
import { tap } from 'rxjs/operators';

interface MonthlyParticipation {
  month: string;
  events: number;
}

interface HoursContribution {
  date: string;
  hours: number;
}

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container mx-auto p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Volunteer Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Total Events</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalEventsParticipated || 0}}</div>
              <div class="text-sm text-gray-500">
                Active: {{stats?.activeEvents || 0}} | Completed: {{stats?.completedEvents || 0}}
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Volunteer Hours</div>
              <div class="text-3xl font-bold text-primary">{{stats?.totalVolunteerHours || 0}}</div>
              <div class="text-sm text-gray-500">Total Hours Contributed</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Reliability Score</div>
              <div class="text-3xl font-bold text-primary">{{stats?.reliabilityScore || 0 | number:'1.1-1'}}</div>
              <div class="text-sm text-gray-500">Based on Event Participation</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Average Rating</div>
              <div class="text-3xl font-bold text-primary">{{stats?.averageEventRating || 0 | number:'1.1-1'}}</div>
              <div class="text-sm text-gray-500">From Event Organizers</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Impact Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Skills Endorsed</div>
              <div class="text-3xl font-bold text-primary">{{stats?.skillsEndorsements || 0}}</div>
              <div class="text-sm text-gray-500">Total Endorsements</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">People Impacted</div>
              <div class="text-3xl font-bold text-primary">{{stats?.peopleImpacted || 0}}</div>
              <div class="text-sm text-gray-500">Through Your Efforts</div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="text-lg font-semibold">Organizations</div>
              <div class="text-3xl font-bold text-primary">{{stats?.organizationsSupported || 0}}</div>
              <div class="text-sm text-gray-500">Organizations Supported</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Hours Contributed Over Time</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #hoursChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Events by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #categoryChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Additional Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Skills Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #skillsChart class="chart-container"></div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Monthly Participation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div #participationChart class="chart-container"></div>
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
export class VolunteerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('hoursChart') hoursChart!: ElementRef;
  @ViewChild('categoryChart') categoryChart!: ElementRef;
  @ViewChild('skillsChart') skillsChart!: ElementRef;
  @ViewChild('participationChart') participationChart!: ElementRef;

  stats: VolunteerStatistics | null = null;
  loading = true;
  private hoursChartInstance: echarts.ECharts | null = null;
  private categoryChartInstance: echarts.ECharts | null = null;
  private skillsChartInstance: echarts.ECharts | null = null;
  private participationChartInstance: echarts.ECharts | null = null;

  private statisticsService = inject(StatisticsService);
  private authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.loading = true;
    
    // Try to get user ID from auth service
    const userId = this.authService.getCurrentUserId();
    console.log('Attempting to load statistics for user ID:', userId);

    if (!userId) {
      // Try to get user ID from localStorage as fallback
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.id) {
            const parsedUserId = user.id.toString();
            console.log('Got user ID from localStorage:', parsedUserId);
            this.fetchStatistics(parsedUserId);
            return;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      console.error('No user ID available');
      this.loading = false;
      return;
    }

    this.fetchStatistics(userId);
  }

  private fetchStatistics(userId: string): void {
    if (!userId) {
      console.error('Attempted to fetch statistics with no user ID');
      this.loading = false;
      return;
    }

    console.log('Fetching statistics for user:', userId);
    this.statisticsService.getVolunteerStatistics(userId).subscribe({
      next: (response) => {
        if (!response.data) {
          console.error('No data in response');
          this.loading = false;
          return;
        }
        console.log('Received volunteer statistics:', response.data);
        this.stats = response.data;
        this.loading = false;
        this.initializeCharts();
      },
      error: (error: Error) => {
        console.error('Error loading volunteer statistics:', error);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  private initializeCharts(): void {
    if (!this.stats) return;

    // Hours Chart
    if (this.hoursChart?.nativeElement) {
      this.hoursChartInstance = echarts.init(this.hoursChart.nativeElement);
      const hoursData = this.stats.hoursContributed.map((h: { date: string; hours: number }) => h.hours);
      this.hoursChartInstance.setOption({
        title: { 
          text: 'Hours Contributed Over Time',
          left: 'center'
        },
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c} hours'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          data: this.stats.hoursContributed.map((h: { date: string }) => h.date),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Hours'
        },
        series: [{
          name: 'Hours',
          type: 'line',
          smooth: true,
          data: hoursData,
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

    // Category Chart
    if (this.categoryChart?.nativeElement) {
      this.categoryChartInstance = echarts.init(this.categoryChart.nativeElement);
      this.categoryChartInstance.setOption({
        title: { 
          text: 'Events by Category',
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
          data: Object.entries(this.stats.eventsByCategory).map(([name, value]) => ({
            name,
            value: value as number
          }))
        }]
      });
    }

    // Skills Chart
    if (this.skillsChart?.nativeElement) {
      this.skillsChartInstance = echarts.init(this.skillsChart.nativeElement);
      this.skillsChartInstance.setOption({
        title: { 
          text: 'Skills Distribution',
          left: 'center'
        },
        tooltip: { 
          trigger: 'item',
          formatter: '{b}: {c} endorsements'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [{
          name: 'Skills',
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
          data: Object.entries(this.stats.skillsDistribution).map(([name, value]) => ({
            name,
            value: value as number
          }))
        }]
      });
    }

    // Participation Chart
    if (this.participationChart?.nativeElement) {
      this.participationChartInstance = echarts.init(this.participationChart.nativeElement);
      const participationData = this.stats.monthlyParticipation.map((p: { month: string; events: number }) => p.events);
      this.participationChartInstance.setOption({
        title: { 
          text: 'Monthly Participation',
          left: 'center'
        },
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c} events'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          data: this.stats.monthlyParticipation.map((p: { month: string }) => p.month),
          axisLabel: { rotate: 45 }
        },
        yAxis: { 
          type: 'value',
          name: 'Events'
        },
        series: [{
          name: 'Events',
          type: 'bar',
          data: participationData,
          itemStyle: { color: '#10B981' }
        }]
      });
    }
  }

  ngOnDestroy(): void {
    if (this.hoursChartInstance) {
      this.hoursChartInstance.dispose();
    }
    if (this.categoryChartInstance) {
      this.categoryChartInstance.dispose();
    }
    if (this.skillsChartInstance) {
      this.skillsChartInstance.dispose();
    }
    if (this.participationChartInstance) {
      this.participationChartInstance.dispose();
    }
  }
} 