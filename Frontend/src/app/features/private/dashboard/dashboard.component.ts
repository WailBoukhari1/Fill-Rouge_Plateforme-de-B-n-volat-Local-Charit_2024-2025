import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { VolunteerDashboardComponent } from './volunteer-dashboard/volunteer-dashboard.component';
import { OrganizationDashboardComponent } from './organization-dashboard/organization-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization.service';

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

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserRole();
  }

  private loadUserRole(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.userRole = user.role as UserRole;
        
        // If organization role, check profile completion
        if (this.userRole === 'ORGANIZATION') {
          this.checkOrganizationProfileCompletion();
        }
      }
      this.loading = false;
    });
  }

  private checkOrganizationProfileCompletion(): void {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      console.error('No organization ID available');
      return;
    }

    this.organizationService.getOrganization(organizationId).subscribe({
      next: (response) => {
        if (!response.data) {
          console.error('No organization data found');
          return;
        }

        const profile = response.data;
        // Check if all required fields are filled
        const isProfileComplete = !!(
          profile?.name &&
          profile?.description &&
          profile?.mission &&
          profile?.phoneNumber &&
          profile?.address &&
          profile?.city &&
          profile?.province &&
          profile?.country &&
          profile?.type &&
          profile?.category &&
          profile?.size &&
          profile?.focusAreas?.length > 0
        );

        if (!isProfileComplete) {
          console.log('Organization profile incomplete, redirecting to profile page');
          this.router.navigate(['/organization/profile']);
        }
      },
      error: (error) => {
        console.error('Error checking organization profile:', error);
      }
    });
  }
}
