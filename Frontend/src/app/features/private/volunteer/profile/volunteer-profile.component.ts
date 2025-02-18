import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VolunteerService, VolunteerProfile } from '../../../../core/services/volunteer.service';

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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Volunteer Profile</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <!-- Basic Information -->
            <mat-form-field>
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Address</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>

            <mat-form-field>
              <mat-label>City</mat-label>
              <input matInput formControlName="city">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Country</mat-label>
              <input matInput formControlName="country">
            </mat-form-field>

            <!-- Emergency Contact -->
            <mat-form-field>
              <mat-label>Emergency Contact</mat-label>
              <input matInput formControlName="emergencyContact">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Emergency Phone</mat-label>
              <input matInput formControlName="emergencyPhone">
            </mat-form-field>

            <!-- Skills and Preferences -->
            <mat-form-field>
              <mat-label>Skills</mat-label>
              <mat-select formControlName="skills" multiple>
                <mat-option *ngFor="let skill of availableSkills" [value]="skill">
                  {{skill}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Interests</mat-label>
              <mat-select formControlName="interests" multiple>
                <mat-option *ngFor="let interest of availableInterests" [value]="interest">
                  {{interest}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Available Days</mat-label>
              <mat-select formControlName="availableDays" multiple>
                <mat-option *ngFor="let day of weekDays" [value]="day">
                  {{day}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Preferred Time of Day</mat-label>
              <mat-select formControlName="preferredTimeOfDay">
                <mat-option value="morning">Morning</mat-option>
                <mat-option value="afternoon">Afternoon</mat-option>
                <mat-option value="evening">Evening</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Languages</mat-label>
              <mat-select formControlName="languages" multiple>
                <mat-option *ngFor="let language of availableLanguages" [value]="language">
                  {{language}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Preferences -->
            <div class="col-span-2">
              <mat-slide-toggle formControlName="availableForEmergency">
                Available for Emergency
              </mat-slide-toggle>
            </div>

            <div class="col-span-2">
              <mat-slide-toggle formControlName="receiveNotifications">
                Receive Notifications
              </mat-slide-toggle>
            </div>

            <!-- Statistics (Read-only) -->
            <div class="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="text-lg font-bold">{{profile?.totalEventsAttended || 0}}</div>
                  <div class="text-sm text-gray-600">Events Attended</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="text-lg font-bold">{{profile?.totalHoursVolunteered || 0}}</div>
                  <div class="text-sm text-gray-600">Hours Volunteered</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="text-lg font-bold">{{profile?.averageRating || 0}}</div>
                  <div class="text-sm text-gray-600">Average Rating</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="text-lg font-bold">{{profile?.reliabilityScore || 0}}</div>
                  <div class="text-sm text-gray-600">Reliability Score</div>
                </mat-card-content>
              </mat-card>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions class="p-4">
          <button mat-raised-button color="primary" 
                  [disabled]="!profileForm.valid || loading"
                  (click)="onSubmit()">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Save Profile</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .stat-card {
      @apply bg-gray-50;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class VolunteerProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: VolunteerProfile | null = null;
  loading = false;

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  availableSkills = ['Communication', 'Leadership', 'Organization', 'Problem Solving', 'Teamwork'];
  availableInterests = ['Education', 'Environment', 'Health', 'Social Services', 'Youth'];
  availableLanguages = ['English', 'French', 'Spanish', 'Arabic', 'Chinese'];

  constructor(
    private fb: FormBuilder,
    private volunteerService: VolunteerService
  ) {
    this.profileForm = this.fb.group({
      bio: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      emergencyContact: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
      skills: [[]],
      interests: [[]],
      availableDays: [[]],
      preferredTimeOfDay: [''],
      languages: [[]],
      availableForEmergency: [false],
      receiveNotifications: [true],
      notificationPreferences: [[]],
      profileVisible: [true]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.volunteerService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue(profile);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.volunteerService.updateProfile(this.profileForm.value).subscribe({
        next: (profile) => {
          this.profile = profile;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.loading = false;
        }
      });
    }
  }
} 