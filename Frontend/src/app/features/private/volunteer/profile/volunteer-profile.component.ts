import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VolunteerService } from '@core/services/volunteer.service';
import { VolunteerProfile } from '@core/interfaces/volunteer.interface';

@Component({
  selector: 'app-volunteer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card *ngIf="profile" class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <h1 class="text-2xl font-bold mb-2">
              {{ profile.firstName }} {{ profile.lastName }}
            </h1>
          </mat-card-title>
          <mat-card-subtitle>
            <div class="text-gray-600">{{ profile.email }}</div>
            <div class="text-gray-600">
              {{ profile.city }}, {{ profile.country }}
            </div>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="mt-4">
          <!-- Basic Information -->
          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Phone:</strong> {{ profile.phoneNumber }}</p>
                <p><strong>Address:</strong> {{ profile.address }}</p>
                <p><strong>Joined:</strong> {{ profile.joinedAt | date }}</p>
                <p>
                  <strong>Status:</strong>
                  <span [class.text-green-600]="profile.status === 'ACTIVE'">{{
                    profile.status
                  }}</span>
                </p>
              </div>
              <div>
                <p>
                  <strong>Emergency Contact:</strong>
                  {{ profile.emergencyContact }}
                </p>
                <p>
                  <strong>Emergency Phone:</strong> {{ profile.emergencyPhone }}
                </p>
                <p>
                  <strong>Background Check:</strong>
                  {{ profile.backgroundCheckStatus }}
                </p>
              </div>
            </div>
          </section>

          <!-- Statistics -->
          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Volunteer Statistics</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <mat-card class="stat-card">
                <div class="text-center">
                  <div class="text-3xl font-bold">
                    {{ profile.totalEventsAttended }}
                  </div>
                  <div class="text-gray-600">Events Attended</div>
                </div>
              </mat-card>
              <mat-card class="stat-card">
                <div class="text-center">
                  <div class="text-3xl font-bold">
                    {{ profile.totalVolunteerHours }}
                  </div>
                  <div class="text-gray-600">Volunteer Hours</div>
                </div>
              </mat-card>
              <mat-card class="stat-card">
                <div class="text-center">
                  <div class="text-3xl font-bold">
                    {{ profile.reliabilityScore }}%
                  </div>
                  <div class="text-gray-600">Reliability Score</div>
                </div>
              </mat-card>
            </div>
          </section>

          <!-- Skills and Interests -->
          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Skills & Interests</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="font-medium mb-2">Skills</h3>
                <mat-chip-list>
                  <mat-chip *ngFor="let skill of profile.skills">{{
                    skill
                  }}</mat-chip>
                  <mat-chip *ngIf="profile.skills.length === 0" color="accent"
                    >No skills added yet</mat-chip
                  >
                </mat-chip-list>
              </div>
              <div>
                <h3 class="font-medium mb-2">Interests</h3>
                <mat-chip-list>
                  <mat-chip *ngFor="let interest of profile.interests">{{
                    interest
                  }}</mat-chip>
                  <mat-chip
                    *ngIf="profile.interests.length === 0"
                    color="accent"
                    >No interests added yet</mat-chip
                  >
                </mat-chip-list>
              </div>
            </div>
          </section>

          <!-- Preferences -->
          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Preferences</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Max Hours/Week:</strong> {{ profile.maxHoursPerWeek }}
                </p>
                <p>
                  <strong>Preferred Radius:</strong>
                  {{ profile.preferredRadius }} km
                </p>
                <p>
                  <strong>Preferred Time:</strong>
                  {{ profile.preferredTimeOfDay }}
                </p>
                <p>
                  <strong>Available for Emergency:</strong>
                  {{ profile.availableForEmergency ? 'Yes' : 'No' }}
                </p>
              </div>
              <div>
                <h3 class="font-medium mb-2">Preferred Categories</h3>
                <mat-chip-list>
                  <mat-chip
                    *ngFor="let category of profile.preferredCategories"
                    >{{ category }}</mat-chip
                  >
                  <mat-chip
                    *ngIf="profile.preferredCategories.length === 0"
                    color="accent"
                    >No categories selected</mat-chip
                  >
                </mat-chip-list>
              </div>
            </div>
          </section>

          <!-- Achievements -->
          <section class="mb-6" *ngIf="profile.achievements.length > 0">
            <h2 class="text-xl font-semibold mb-3">Achievements</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <mat-card
                *ngFor="let achievement of profile.achievements"
                class="achievement-card"
              >
                <mat-card-content>
                  <div class="text-center">
                    <mat-icon class="text-3xl text-primary">stars</mat-icon>
                    <div class="mt-2">{{ achievement }}</div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </section>
        </mat-card-content>
      </mat-card>

      <mat-progress-spinner
        *ngIf="!profile"
        mode="indeterminate"
        diameter="50"
        class="mx-auto mt-8"
      >
      </mat-progress-spinner>
    </div>
  `,
  styles: [
    `
      .profile-card {
        max-width: 1200px;
        margin: 0 auto;
      }
      .stat-card {
        padding: 1rem;
      }
      .achievement-card {
        padding: 1rem;
      }
      mat-chip {
        margin: 4px;
      }
    `,
  ],
})
export class VolunteerProfileComponent implements OnInit {
  profile: VolunteerProfile | null = null;

  constructor(
    private volunteerService: VolunteerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.volunteerService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (error) => {
        this.snackBar.open('Error loading profile: ' + error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }
}
