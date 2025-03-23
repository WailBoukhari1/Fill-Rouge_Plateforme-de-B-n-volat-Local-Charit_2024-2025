import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { curveLinear } from 'd3-shape';

import { AppState } from '../../../../store';
import * as AdminActions from '../../../../store/admin/admin.actions';
import * as AdminSelectors from '../../../../store/admin/admin.selectors';
import { AdminStatistics } from '../../../../core/models/statistics.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatIconModule, 
    MatProgressSpinnerModule, 
    NgxChartsModule
  ],
  template: `
    
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
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: AdminStatistics | null = null;
  loading = true;
  curve = curveLinear;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.loadStatistics();
    
    // Subscribe to the statistics from the store
    this.store.select(AdminSelectors.selectAdminStatistics)
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        if (stats) {
          this.stats = stats;
          this.loading = false;
        }
      });
      
    // Subscribe to the loading state  
    this.store.select(AdminSelectors.selectAdminLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistics(): void {
    this.store.dispatch(AdminActions.loadAdminStatistics());
  }

  formatTimeSeriesData(data: any[]): any[] {
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(item => ({
      name: item.date,
      value: item.value
    }));
  }

  formatCategoryData(data: Record<string, number>): any[] {
    if (!data) {
      return [];
    }
    
    return Object.entries(data).map(([name, value]) => ({
      name,
      value
    }));
  }

  getVerificationRate(): number {
    if (!this.stats || !this.stats.totalOrganizations || this.stats.totalOrganizations === 0) {
      return 0;
    }
    return (this.stats.verifiedOrganizations / this.stats.totalOrganizations) * 100;
  }
} 