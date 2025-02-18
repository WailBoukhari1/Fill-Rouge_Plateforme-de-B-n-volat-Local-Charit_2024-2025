import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '../../../../core/services/organization.service';
import { Organization } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="bg-primary-50 py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Partner Organizations
          </h1>
          <p class="text-xl text-gray-600">
            Discover organizations making a difference in your community.
          </p>
        </div>
      </div>
    </section>

    <!-- Organizations Grid -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        @if (isLoading) {
          <div class="flex justify-center items-center py-12">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (error) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-red-500 mb-4">error_outline</mat-icon>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading Organizations</h3>
            <p class="text-gray-600">{{error}}</p>
            <button mat-raised-button color="primary" class="mt-4" (click)="loadOrganizations()">
              <mat-icon class="mr-2">refresh</mat-icon>
              Retry
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (org of organizations; track org.id) {
              <mat-card class="h-full">
                <img mat-card-image [src]="org.logoUrl" [alt]="org.name" 
                     class="h-48 w-full object-cover">
                <mat-card-content class="p-4">
                  <h3 class="text-xl font-semibold mb-2">{{org.name}}</h3>
                  <p class="text-gray-600 mb-4">{{org.description}}</p>
                  <div class="space-y-2 text-gray-500">
                    <div class="flex items-center">
                      <mat-icon class="mr-2">location_on</mat-icon>
                      <span>{{org.location}}</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">event</mat-icon>
                      <span>{{org.eventCount}} Events</span>
                    </div>
                    @if (org.rating) {
                      <div class="flex items-center">
                        <mat-icon class="mr-2">star</mat-icon>
                        <span>{{org.rating | number:'1.1-1'}} ({{org.reviewCount}} reviews)</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions class="p-4 pt-0">
                  <a mat-button color="primary" [routerLink]="['/organizations', org.id]">
                    <mat-icon class="mr-1">info</mat-icon>
                    View Details
                  </a>
                  <a mat-button [routerLink]="['/organizations', org.id, 'events']">
                    <mat-icon class="mr-1">event</mat-icon>
                    View Events
                  </a>
                </mat-card-actions>
              </mat-card>
            }
          </div>

          @if (organizations.length === 0) {
            <div class="text-center py-12">
              <mat-icon class="text-6xl text-gray-400 mb-4">business_off</mat-icon>
              <h3 class="text-xl font-semibold text-gray-600 mb-2">No Organizations Found</h3>
              <p class="text-gray-500">Check back later for new organizations</p>
            </div>
          }
        }
      </div>
    </section>
  `
})
export class OrganizationListComponent implements OnInit {
  organizations: Organization[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.isLoading = true;
    this.error = null;

    this.organizationService.getOrganizations().subscribe({
      next: (response) => {
        this.organizations = response.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.error = 'Failed to load organizations. Please try again.';
        this.isLoading = false;
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
      }
    });
  }
} 