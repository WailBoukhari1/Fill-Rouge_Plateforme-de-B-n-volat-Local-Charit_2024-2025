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
    <div>
      <!-- Hero Section -->
      <section>
        <div class="container mx-auto p-4">
          <div class="text-center">
            <h1>Make a Difference Today</h1>
            <p>Connect with organizations and find meaningful volunteer opportunities</p>
            <div>
              <a mat-raised-button color="primary" routerLink="/events">Find Events</a>
              <a mat-stroked-button routerLink="/auth/register">Become a Volunteer</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section>
        <div class="container mx-auto p-4">
          <h2 class="text-center">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-4">
            <mat-card>
              <mat-card-header>
                <mat-icon>search</mat-icon>
              </mat-card-header>
              <mat-card-title>Find Opportunities</mat-card-title>
              <mat-card-content>
                Browse through various volunteer opportunities in your area.
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-icon>group</mat-icon>
              </mat-card-header>
              <mat-card-title>Connect with Organizations</mat-card-title>
              <mat-card-content>
                Get in touch with organizations directly.
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-icon>volunteer_activism</mat-icon>
              </mat-card-header>
              <mat-card-title>Start Volunteering</mat-card-title>
              <mat-card-content>
                Sign up for events and start making a positive impact.
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section>
        <div class="container mx-auto p-4 text-center">
          <h2>Ready to Get Started?</h2>
          <p>Join our community of volunteers and organizations.</p>
          <a mat-raised-button color="primary" routerLink="/auth/register">Sign Up Now</a>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {} 