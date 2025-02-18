import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="bg-primary-50 py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Make a Difference in Your Community
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Join thousands of volunteers making positive change. Find opportunities that match your interests and skills.
          </p>
          <div class="flex justify-center gap-4">
            <a mat-raised-button color="primary" routerLink="/events">
              <mat-icon class="mr-2">search</mat-icon>
              Find Events
            </a>
            <a mat-raised-button color="accent" routerLink="/auth/register">
              <mat-icon class="mr-2">person_add</mat-icon>
              Become a Volunteer
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Why Join Volunteer Hub?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <mat-icon class="text-5xl text-primary-500 mb-4">search</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Find Opportunities</h3>
            <p class="text-gray-600">
              Discover meaningful volunteer opportunities that match your interests and schedule.
            </p>
          </div>
          <div class="text-center">
            <mat-icon class="text-5xl text-primary-500 mb-4">groups</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Connect with Others</h3>
            <p class="text-gray-600">
              Join a community of like-minded individuals making a positive impact.
            </p>
          </div>
          <div class="text-center">
            <mat-icon class="text-5xl text-primary-500 mb-4">trending_up</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Track Your Impact</h3>
            <p class="text-gray-600">
              Monitor your volunteer hours and see the difference you're making.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p class="text-xl mb-8">
            Join our community of volunteers and start making a difference today.
          </p>
          <a mat-raised-button color="primary" routerLink="/auth/register">
            Get Started
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .text-5xl {
      font-size: 3rem;
    }
  `]
})
export class HomeComponent {} 