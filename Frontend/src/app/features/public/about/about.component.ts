import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
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
            About Volunteer Hub
          </h1>
          <p class="text-xl text-gray-600">
            Connecting passionate volunteers with meaningful opportunities since 2024.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold mb-6">Our Mission</h2>
          <p class="text-lg text-gray-600 mb-8">
            At Volunteer Hub, we believe in the power of community service to transform lives and create positive change. 
            Our mission is to make volunteering accessible, meaningful, and impactful for everyone.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-semibold mb-4">For Volunteers</h3>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <mat-icon class="text-primary-500 mr-2">check_circle</mat-icon>
                  <span>Easy access to diverse volunteering opportunities</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-primary-500 mr-2">check_circle</mat-icon>
                  <span>Track your volunteer hours and impact</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-primary-500 mr-2">check_circle</mat-icon>
                  <span>Connect with like-minded individuals</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-4">For Organizations</h3>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <mat-icon class="text-primary-500 mr-2">check_circle</mat-icon>
                  <span>Reach dedicated volunteers</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-primary-500 mr-2">check_circle</mat-icon>
                  <span>Manage events and registrations efficiently</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-primary-500 mr-2">check_circle</mat-icon>
                  <span>Track volunteer participation and impact</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Section -->
    <section class="bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div class="text-center">
            <div class="text-4xl font-bold text-primary-500 mb-2">1000+</div>
            <div class="text-gray-600">Active Volunteers</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-primary-500 mb-2">500+</div>
            <div class="text-gray-600">Events Completed</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-primary-500 mb-2">10,000+</div>
            <div class="text-gray-600">Volunteer Hours</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-6">Join Our Community</h2>
          <p class="text-xl text-gray-600 mb-8">
            Whether you're looking to volunteer or need volunteers for your organization, 
            we're here to help you make a difference.
          </p>
          <div class="flex justify-center gap-4">
            <a mat-raised-button color="primary" routerLink="/auth/register">
              <mat-icon class="mr-2">person_add</mat-icon>
              Sign Up as Volunteer
            </a>
            <a mat-raised-button color="accent" routerLink="/auth/register">
              <mat-icon class="mr-2">business</mat-icon>
              Register Organization
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AboutComponent {} 