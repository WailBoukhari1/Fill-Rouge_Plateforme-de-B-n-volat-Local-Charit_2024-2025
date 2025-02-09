import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="bg-primary-700 text-white py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              Make a Difference Today
            </h1>
            <p class="text-xl mb-8">
              Connect with organizations and find meaningful volunteer opportunities in your community
            </p>
            <div class="space-x-4">
              <a mat-raised-button color="accent" routerLink="/events">
                Find Events
              </a>
              <a mat-stroked-button routerLink="/auth/register">
                Become a Volunteer
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <mat-card class="p-6">
              <mat-card-header>
                <mat-icon class="text-primary-500 text-3xl mb-4">search</mat-icon>
              </mat-card-header>
              <mat-card-title class="mb-4">Find Opportunities</mat-card-title>
              <mat-card-content>
                Browse through various volunteer opportunities in your area and find the perfect match for your skills.
              </mat-card-content>
            </mat-card>

            <mat-card class="p-6">
              <mat-card-header>
                <mat-icon class="text-primary-500 text-3xl mb-4">group</mat-icon>
              </mat-card-header>
              <mat-card-title class="mb-4">Connect with Organizations</mat-card-title>
              <mat-card-content>
                Get in touch with organizations directly and learn more about their missions and needs.
              </mat-card-content>
            </mat-card>

            <mat-card class="p-6">
              <mat-card-header>
                <mat-icon class="text-primary-500 text-3xl mb-4">volunteer_activism</mat-icon>
              </mat-card-header>
              <mat-card-title class="mb-4">Start Volunteering</mat-card-title>
              <mat-card-content>
                Sign up for events and start making a positive impact in your community today.
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-gray-100 py-16">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p class="text-xl mb-8">Join our community of volunteers and organizations making a difference.</p>
          <a mat-raised-button color="primary" routerLink="/auth/register">
            Sign Up Now
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .mat-icon {
      transform: scale(1.5);
      margin-bottom: 1rem;
    }
  `]
})
export class HomeComponent {} 