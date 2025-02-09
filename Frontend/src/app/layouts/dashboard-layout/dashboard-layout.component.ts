import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DashboardSidebarComponent } from './components/sidebar/dashboard-sidebar.component';
import { DashboardNavbarComponent } from './components/navbar/dashboard-navbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    DashboardSidebarComponent,
    DashboardNavbarComponent
  ],
  template: `
    <div class="dashboard-container">
      <app-dashboard-navbar></app-dashboard-navbar>
      <mat-sidenav-container>
        <mat-sidenav mode="side" opened>
          <app-dashboard-sidebar></app-dashboard-sidebar>
        </mat-sidenav>
        <mat-sidenav-content>
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    mat-sidenav-container {
      height: calc(100vh - 64px);
    }

    mat-sidenav {
      width: 250px;
      background-color: #f5f5f5;
    }

    .content-container {
      padding: 20px;
    }
  `]
})
export class DashboardLayoutComponent {} 