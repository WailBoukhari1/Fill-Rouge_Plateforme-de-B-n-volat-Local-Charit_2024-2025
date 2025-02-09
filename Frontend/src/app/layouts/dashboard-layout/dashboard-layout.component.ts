import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardNavbarComponent } from './components/navbar/dashboard-navbar.component';
import { DashboardSidebarComponent } from './components/sidebar/dashboard-sidebar.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardNavbarComponent,
    DashboardSidebarComponent,
    MatSidenavModule
  ],
  templateUrl: './dashboard-layout.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    
    mat-sidenav-container {
      height: calc(100vh - 64px); // Adjust based on navbar height
    }
  `]
})
export class DashboardLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
} 