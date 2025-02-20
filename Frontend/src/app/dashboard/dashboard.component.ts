import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import * as VolunteerActions from '../store/volunteer/volunteer.actions';
import * as VolunteerSelectors from '../store/volunteer/volunteer.selectors';
import { VolunteerStatistics } from '../core/services/volunteer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="dashboard-container">
      <div class="chart-container">
        <canvas baseChart
          [data]="hoursChartData"
          [options]="hoursChartOptions"
          [type]="'line'">
        </canvas>
      </div>
      
      <div class="chart-container">
        <canvas baseChart
          [data]="eventsChartData"
          [options]="eventsChartOptions"
          [type]="'pie'">
        </canvas>
      </div>

      <div class="chart-container">
        <canvas baseChart
          [data]="participationChartData"
          [options]="participationChartOptions"
          [type]="'bar'">
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .chart-container {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-height: 300px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  // Hours Chart
  public hoursChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Volunteer Hours',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)'
      }
    ]
  };

  public hoursChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Volunteer Hours'
      }
    }
  };

  // Events Chart
  public eventsChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };

  public eventsChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Events by Category'
      }
    }
  };

  // Participation Chart
  public participationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: [],
        label: 'Daily Participation',
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }
    ]
  };

  public participationChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Participation by Day'
      }
    }
  };

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(VolunteerActions.loadStatistics());
    
    this.store.select(VolunteerSelectors.selectVolunteerStatistics).subscribe(stats => {
      if (stats) {
        this.updateCharts(stats);
      }
    });
  }

  private updateCharts(stats: VolunteerStatistics) {
    // Update Hours Chart
    if (stats.hoursByMonth) {
      const months = Object.keys(stats.hoursByMonth);
      const hours = Object.values(stats.hoursByMonth);
      this.hoursChartData.labels = months;
      this.hoursChartData.datasets[0].data = hours;
    }

    // Update Events Chart
    if (stats.eventsByCategory) {
      const categories = Object.keys(stats.eventsByCategory);
      const counts = Object.values(stats.eventsByCategory);
      this.eventsChartData.labels = categories;
      this.eventsChartData.datasets[0].data = counts;
    }

    // Update Participation Chart
    if (stats.participationByDay) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const participation = days.map(day => stats.participationByDay[day] || 0);
      this.participationChartData.datasets[0].data = participation;
    }
  }
} 