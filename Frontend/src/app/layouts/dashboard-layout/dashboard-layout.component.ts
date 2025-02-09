import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardNavbarComponent } from './components/dashboard-navbar.component';
import { DashboardSidebarComponent } from './components/dashboard-sidebar.component';
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
  template: `
    <div class="h-screen flex flex-col">
      <app-dashboard-navbar (toggleSidebar)="sidenav.toggle()"></app-dashboard-navbar>
      
      <mat-sidenav-container class="flex-grow">
        <mat-sidenav #sidenav mode="side" opened class="border-r">
          <app-dashboard-sidebar></app-dashboard-sidebar>
        </mat-sidenav>
        
        <mat-sidenav-content>
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
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