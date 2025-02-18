import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: `
    @if (isLoading) {
      <div class="flex justify-center items-center min-h-screen">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (error) {
      <div class="flex flex-col items-center justify-center min-h-screen">
        <mat-icon class="text-6xl text-red-500 mb-4">error_outline</mat-icon>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading Organization</h3>
        <p class="text-gray-600 mb-4">{{error}}</p>
        <button mat-raised-button color="primary" (click)="loadOrganization()">
          <mat-icon class="mr-2">refresh</mat-icon>
          Retry
        </button>
      </div>
    } @else {
      <!-- Organization Header -->
      <section class="bg-primary-50 py-12">
        <div class="container mx-auto px-4">
          <div class="flex items-center gap-4 mb-4">
            <button mat-icon-button routerLink="/organizations">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <img [src]="organization.logoUrl" [alt]="organization.name" 
                 class="w-24 h-24 rounded-lg object-cover">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{organization.name}}</h1>
              <div class="flex items-center gap-4 text-gray-600">
                <div class="flex items-center">
                  <mat-icon class="mr-1">location_on</mat-icon>
                  {{organization.location}}
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-1">star</mat-icon>
                  {{organization.rating}} ({{organization.reviewCount}} reviews)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="py-8">
        <div class="container mx-auto px-4">
          <mat-tab-group>
            <!-- About Tab -->
            <mat-tab label="About">
              <div class="py-6">
                <div class="max-w-3xl">
                  <h2 class="text-2xl font-bold mb-4">About Us</h2>
                  <p class="text-gray-600 mb-6">{{organization.description}}</p>

                  <h3 class="text-xl font-bold mb-4">Mission</h3>
                  <p class="text-gray-600 mb-6">{{organization.mission}}</p>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-gray-600 text-sm">Active Events</p>
                          <h3 class="text-2xl font-bold">{{organization.stats.activeEvents}}</h3>
                        </div>
                        <mat-icon class="text-primary-500">event_available</mat-icon>
                      </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-gray-600 text-sm">Total Volunteers</p>
                          <h3 class="text-2xl font-bold">{{organization.stats.totalVolunteers}}</h3>
                        </div>
                        <mat-icon class="text-blue-500">group</mat-icon>
                      </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-gray-600 text-sm">Impact Hours</p>
                          <h3 class="text-2xl font-bold">{{organization.stats.impactHours}}</h3>
                        </div>
                        <mat-icon class="text-green-500">volunteer_activism</mat-icon>
                      </div>
                    </div>
                  </div>

                  <h3 class="text-xl font-bold mb-4">Contact Information</h3>
                  <div class="space-y-3 text-gray-600">
                    <div class="flex items-center">
                      <mat-icon class="mr-2">email</mat-icon>
                      <span>{{organization.email}}</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">phone</mat-icon>
                      <span>{{organization.phone}}</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">language</mat-icon>
                      <a href="{{organization.website}}" target="_blank" class="text-primary-600 hover:underline">
                        {{organization.website}}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Events Tab -->
            <mat-tab label="Events">
              <div class="py-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-bold">Upcoming Events</h2>
                  <button mat-raised-button color="primary" [routerLink]="['/organizations', organization.id, 'events']">
                    <mat-icon class="mr-2">event</mat-icon>
                    View All Events
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (event of organization.upcomingEvents; track event.id) {
                    <mat-card>
                      <img mat-card-image [src]="event.imageUrl" [alt]="event.title" 
                           class="h-48 w-full object-cover">
                      <mat-card-content class="p-4">
                        <h3 class="text-xl font-semibold mb-2">{{event.title}}</h3>
                        <div class="space-y-2 text-gray-500">
                          <div class="flex items-center">
                            <mat-icon class="mr-2">calendar_today</mat-icon>
                            <span>{{event.date | date:'mediumDate'}}</span>
                          </div>
                          <div class="flex items-center">
                            <mat-icon class="mr-2">location_on</mat-icon>
                            <span>{{event.location}}</span>
                          </div>
                        </div>
                      </mat-card-content>
                      <mat-card-actions class="p-4 pt-0">
                        <a mat-button color="primary" [routerLink]="['/events', event.id]">
                          View Details
                        </a>
                      </mat-card-actions>
                    </mat-card>
                  }
                </div>
              </div>
            </mat-tab>

            <!-- Reviews Tab -->
            <mat-tab label="Reviews">
              <div class="py-6">
                <div class="max-w-3xl">
                  <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Volunteer Reviews</h2>
                    <div class="flex items-center">
                      <mat-icon class="text-yellow-500 mr-2">star</mat-icon>
                      <span class="text-2xl font-bold">{{organization.rating}}</span>
                      <span class="text-gray-500 ml-2">({{organization.reviewCount}} reviews)</span>
                    </div>
                  </div>

                  @for (review of organization.reviews; track review.id) {
                    <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
                      <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center">
                          <img [src]="review.userAvatar" [alt]="review.userName"
                               class="w-10 h-10 rounded-full mr-3">
                          <div>
                            <h4 class="font-semibold">{{review.userName}}</h4>
                            <p class="text-gray-500 text-sm">{{review.date | date}}</p>
                          </div>
                        </div>
                        <div class="flex items-center">
                          <mat-icon class="text-yellow-500">star</mat-icon>
                          <span class="ml-1">{{review.rating}}</span>
                        </div>
                      </div>
                      <p class="text-gray-600">{{review.comment}}</p>
                    </div>
                  }
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </section>
    }
  `
})
export class OrganizationDetailComponent implements OnInit {
  organization: any;
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadOrganization();
  }

  loadOrganization() {
    this.isLoading = true;
    this.error = null;

    // TODO: Implement organization loading from service
    setTimeout(() => {
      this.organization = {
        id: '1',
        name: 'Ocean Conservation Society',
        logoUrl: 'https://source.unsplash.com/random/800x600/?ocean',
        location: 'Miami, FL',
        rating: 4.8,
        reviewCount: 124,
        description: 'The Ocean Conservation Society is dedicated to protecting marine ecosystems and wildlife through community action and education.',
        mission: 'Our mission is to preserve and protect marine environments through community engagement, education, and direct action, ensuring a sustainable future for our oceans.',
        email: 'info&#64;oceanconservation.org',
        phone: '(555) 123-4567',
        website: 'https://oceanconservation.org',
        stats: {
          activeEvents: 15,
          totalVolunteers: 1200,
          impactHours: 5000
        },
        upcomingEvents: [
          {
            id: '1',
            title: 'Beach Cleanup Drive',
            imageUrl: 'https://source.unsplash.com/random/800x600/?beach',
            date: new Date(),
            location: 'Miami Beach'
          },
          // Add more events
        ],
        reviews: [
          {
            id: '1',
            userName: 'John Doe',
            userAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
            rating: 5,
            date: new Date(),
            comment: 'Amazing organization! The beach cleanup event was well organized and made a real impact.'
          },
          // Add more reviews
        ]
      };
      this.isLoading = false;
    }, 1000);
  }
} 