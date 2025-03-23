import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { curveLinear } from 'd3-shape';

@Component({
  selector: 'app-statistics-display',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgxChartsModule],
  template: `
    <div class="statistics-container">
      <!-- Overview Cards Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        @for (stat of overviewStats; track stat.label) {
          <mat-card class="stats-card shadow-sm hover:shadow-md transition-shadow duration-200">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-600 text-sm">{{ stat.label }}</div>
                  <div class="text-2xl font-bold text-primary">{{ stat.value }}</div>
                  @if (stat.growth !== undefined && stat.growth !== null) {
                    <div class="text-sm mt-1" [ngClass]="stat.growth >= 0 ? 'text-green-600' : 'text-red-600'">
                      <span class="flex items-center">
                        <mat-icon class="text-sm h-4 w-4">{{ stat.growth >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                        {{ stat.growth | number:'1.1-1' }}%
                      </span>
                    </div>
                  }
                </div>
                @if (stat.icon) {
                  <mat-icon class="text-primary-600 opacity-80 text-3xl">{{ stat.icon }}</mat-icon>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Main Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <!-- Time Series Chart -->
        @if (timeSeriesConfig) {
          <mat-card class="h-96 shadow-sm">
            <mat-card-header>
              <mat-card-title>{{ timeSeriesConfig.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-line-chart
                [results]="timeSeriesConfig.data"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [legend]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                [curve]="curve"
                [autoScale]="true">
              </ngx-charts-line-chart>
            </mat-card-content>
          </mat-card>
        }

        <!-- Distribution Chart -->
        @if (distributionConfig) {
          <mat-card class="h-96 shadow-sm">
            <mat-card-header>
              <mat-card-title>{{ distributionConfig.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-80">
              <ngx-charts-pie-chart
                [results]="distributionConfig.data"
                [gradient]="true"
                [legend]="true"
                [labels]="true"
                [doughnut]="true"
                [arcWidth]="0.35">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Additional Charts Section -->
      @if (showAdditionalCharts && (additionalChart1Config || additionalChart2Config)) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Additional Chart 1 -->
          @if (additionalChart1Config) {
            <mat-card class="h-96 shadow-sm">
              <mat-card-header>
                <mat-card-title>{{ additionalChart1Config.title }}</mat-card-title>
              </mat-card-header>
              <mat-card-content class="h-80">
                @if (additionalChart1Config.type === 'pie') {
                  <ngx-charts-pie-chart
                    [results]="additionalChart1Config.data"
                    [gradient]="true"
                    [legend]="true"
                    [labels]="true"
                    [doughnut]="false">
                  </ngx-charts-pie-chart>
                } @else if (additionalChart1Config.type === 'bar') {
                  <ngx-charts-bar-vertical
                    [results]="formatBarData(additionalChart1Config.data)"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true"
                    [showDataLabel]="true">
                  </ngx-charts-bar-vertical>
                } @else if (additionalChart1Config.type === 'line') {
                  <ngx-charts-line-chart
                    [results]="formatLineData(additionalChart1Config)"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="false"
                    [curve]="curve"
                    [autoScale]="true">
                  </ngx-charts-line-chart>
                } @else if (additionalChart1Config.type === 'radar') {
                  <ngx-charts-polar-chart
                    [results]="formatBarData(additionalChart1Config.data)"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true">
                  </ngx-charts-polar-chart>
                }
              </mat-card-content>
            </mat-card>
          }

          <!-- Additional Chart 2 -->
          @if (additionalChart2Config) {
            <mat-card class="h-96 shadow-sm">
              <mat-card-header>
                <mat-card-title>{{ additionalChart2Config.title }}</mat-card-title>
              </mat-card-header>
              <mat-card-content class="h-80">
                @if (additionalChart2Config.type === 'pie') {
                  <ngx-charts-pie-chart
                    [results]="additionalChart2Config.data"
                    [gradient]="true"
                    [legend]="true"
                    [labels]="true"
                    [doughnut]="false">
                  </ngx-charts-pie-chart>
                } @else if (additionalChart2Config.type === 'bar') {
                  <ngx-charts-bar-vertical
                    [results]="formatBarData(additionalChart2Config.data)"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true"
                    [showDataLabel]="true">
                  </ngx-charts-bar-vertical>
                } @else if (additionalChart2Config.type === 'line') {
                  <ngx-charts-line-chart
                    [results]="formatLineData(additionalChart2Config)"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="false"
                    [curve]="curve"
                    [autoScale]="true">
                  </ngx-charts-line-chart>
                } @else if (additionalChart2Config.type === 'radar') {
                  <ngx-charts-polar-chart
                    [results]="formatBarData(additionalChart2Config.data)"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true">
                  </ngx-charts-polar-chart>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      
      .statistics-container {
        width: 100%;
      }

      .stats-card:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease-in-out;
      }
    `
  ]
})
export class StatisticsDisplayComponent implements OnInit, OnChanges {
  @Input() overviewStats: { label: string; value: number; icon: string; growth?: number }[] = [];
  @Input() timeSeriesConfig: { title: string; data: any[] } | null = null;
  @Input() distributionConfig: { title: string; data: any[] } | null = null;
  @Input() additionalChart1Config: { title: string; type: 'line' | 'bar' | 'pie' | 'radar'; data: any } | null = null;
  @Input() additionalChart2Config: { title: string; type: 'line' | 'bar' | 'pie' | 'radar'; data: any } | null = null;
  @Input() showAdditionalCharts = false;

  curve = curveLinear;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any changes to input properties
    if (changes['timeSeriesConfig'] && this.timeSeriesConfig) {
      // Process time series data if needed
    }
    
    if (changes['distributionConfig'] && this.distributionConfig) {
      // Process distribution data if needed
    }
  }

  formatBarData(data: any): any[] {
    if (!data || !data.xAxisData || !data.values) {
      return [];
    }
    return data.xAxisData.map((name: string, i: number) => ({
      name,
      value: data.values[i]
    }));
  }

  formatLineData(config: any): any[] {
    if (!config || !config.data || !config.data.xAxisData || !config.data.values) {
      return [];
    }
    return [{
      name: config.title,
      series: config.data.xAxisData.map((name: string, i: number) => ({
        name,
        value: config.data.values[i]
      }))
    }];
  }
} 