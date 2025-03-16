import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { VolunteerDashboardComponent } from './volunteer-dashboard/volunteer-dashboard.component';
import { OrganizationDashboardComponent } from './organization-dashboard/organization-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

type UserRole = 'VOLUNTEER' | 'ORGANIZATION' | 'ADMIN';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    VolunteerDashboardComponent,
    OrganizationDashboardComponent,
    AdminDashboardComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        @if (userRole === 'VOLUNTEER') {
          <app-volunteer-dashboard></app-volunteer-dashboard>
        } @else if (userRole === 'ORGANIZATION') {
          <app-organization-dashboard></app-organization-dashboard>
        } @else if (userRole === 'ADMIN') {
          <app-admin-dashboard></app-admin-dashboard>
        }
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userRole: UserRole = 'VOLUNTEER';
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserRole();
  }

  private loadUserRole(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.userRole = user.role as UserRole;
      }
      this.loading = false;
    });
  }
}
