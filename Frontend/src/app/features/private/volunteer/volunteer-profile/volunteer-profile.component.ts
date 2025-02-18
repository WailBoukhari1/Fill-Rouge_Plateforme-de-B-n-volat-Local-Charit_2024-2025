import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-volunteer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p class="text-gray-600">Manage your volunteer profile and preferences</p>
        </div>

        <!-- Profile Form -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Information -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-xl font-bold">Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName">
                  <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName">
                  <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email">
                  <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone">
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Additional Information -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-xl font-bold">Additional Information</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Location</mat-label>
                  <input matInput formControlName="location">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Availability</mat-label>
                  <mat-select formControlName="availability" multiple>
                    <mat-option value="weekday_morning">Weekday Mornings</mat-option>
                    <mat-option value="weekday_afternoon">Weekday Afternoons</mat-option>
                    <mat-option value="weekday_evening">Weekday Evenings</mat-option>
                    <mat-option value="weekend_morning">Weekend Mornings</mat-option>
                    <mat-option value="weekend_afternoon">Weekend Afternoons</mat-option>
                    <mat-option value="weekend_evening">Weekend Evenings</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full md:col-span-2">
                  <mat-label>Bio</mat-label>
                  <textarea matInput formControlName="bio" rows="4"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full md:col-span-2">
                  <mat-label>Skills & Interests</mat-label>
                  <mat-select formControlName="skills" multiple>
                    <mat-option value="teaching">Teaching</mat-option>
                    <mat-option value="mentoring">Mentoring</mat-option>
                    <mat-option value="organizing">Event Organization</mat-option>
                    <mat-option value="environmental">Environmental Work</mat-option>
                    <mat-option value="social">Social Services</mat-option>
                    <mat-option value="healthcare">Healthcare</mat-option>
                    <mat-option value="technology">Technology</mat-option>
                    <mat-option value="arts">Arts & Culture</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Preferences -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-xl font-bold">Preferences</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Preferred Causes</mat-label>
                  <mat-select formControlName="preferredCauses" multiple>
                    <mat-option value="education">Education</mat-option>
                    <mat-option value="environment">Environment</mat-option>
                    <mat-option value="health">Healthcare</mat-option>
                    <mat-option value="poverty">Poverty Alleviation</mat-option>
                    <mat-option value="animals">Animal Welfare</mat-option>
                    <mat-option value="community">Community Development</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Maximum Travel Distance (miles)</mat-label>
                  <input matInput type="number" formControlName="maxTravelDistance">
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="profileForm.invalid || isSubmitting">
              <mat-icon class="mr-2">save</mat-icon>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VolunteerProfileComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      availability: [[]],
      bio: [''],
      skills: [[]],
      preferredCauses: [[]],
      maxTravelDistance: [25]
    });
  }

  ngOnInit() {
    // TODO: Load volunteer profile data from service
    this.loadProfile();
  }

  loadProfile() {
    // TODO: Implement profile loading
    const mockProfile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      location: 'Miami, FL',
      availability: ['weekday_evening', 'weekend_morning'],
      bio: 'Passionate about making a difference in my community.',
      skills: ['organizing', 'environmental', 'technology'],
      preferredCauses: ['environment', 'education'],
      maxTravelDistance: 25
    };

    this.profileForm.patchValue(mockProfile);
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      // TODO: Implement profile update
      console.log('Profile data:', this.profileForm.value);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000
        });
      }, 1000);
    }
  }
} 