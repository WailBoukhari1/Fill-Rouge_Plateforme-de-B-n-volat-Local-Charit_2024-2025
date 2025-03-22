import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { VolunteerService, VolunteerProfile, VolunteerProfileRequest } from '../../../../../core/services/volunteer.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-profile',
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
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="edit-profile-container">
      <!-- Top Toolbar -->
      <mat-toolbar color="primary" class="edit-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Edit Profile</span>
        <span class="toolbar-spacer"></span>
        <button mat-raised-button color="accent" (click)="onSubmit()" 
                [disabled]="profileForm.invalid || isSubmitting">
          <mat-icon class="mr-2">save</mat-icon>
          Save Changes
        </button>
      </mat-toolbar>

      <div class="content-container">
        <div *ngIf="error" class="error-message">
          <mat-icon>error_outline</mat-icon>
          {{ error }}
        </div>

        <mat-stepper linear #stepper>
          <!-- Basic Information Step -->
          <mat-step [stepControl]="profileForm" label="Basic Information">
            <form [formGroup]="profileForm" class="profile-form">
              <!-- Profile Picture -->
              <mat-card class="profile-picture-card">
                <mat-card-content>
                  <div class="profile-picture-container">
                    <div class="profile-picture-wrapper">
                      @if (loading) {
                        <div class="profile-picture-placeholder">
                          <mat-spinner diameter="40"></mat-spinner>
                        </div>
                      } @else {
                        <img [src]="profilePictureUrl" 
                             alt="Profile Picture" 
                             class="profile-picture"
                             >
                      }
                      <div class="profile-picture-overlay">
                        <button mat-icon-button color="primary" (click)="fileInput.click()">
                          <mat-icon>camera_alt</mat-icon>
                        </button>
                        <input #fileInput type="file" 
                               accept="image/*" 
                               (change)="onFileSelected($event)" 
                               style="display: none">
                      </div>
                    </div>
                    <div class="profile-picture-info">
                      <p>Upload a profile picture (JPG, PNG)</p>
                      <p class="text-sm text-gray-500">Maximum size: 5MB</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Personal Information -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Personal Information</mat-card-title>
                  <mat-icon>person</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field>
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" required>
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email" required>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                        Please enter a valid email
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Phone</mat-label>
                      <input matInput formControlName="phoneNumber" required>
                      <mat-hint>Format: +123456789 (must start with a non-zero digit)</mat-hint>
                      <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                        Phone is required
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('pattern')">
                        Please enter a valid phone number (must start with + followed by a non-zero digit, or a non-zero digit)
                      </mat-error>
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
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Emergency Contact -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Emergency Contact</mat-card-title>
                  <mat-icon>emergency</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field>
                      <mat-label>Emergency Contact Name</mat-label>
                      <input matInput formControlName="emergencyContact" required>
                      <mat-error *ngIf="profileForm.get('emergencyContact')?.hasError('required')">
                        Emergency contact name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Emergency Contact Phone</mat-label>
                      <input matInput formControlName="emergencyPhone" required>
                      <mat-hint>Format: +123456789 (must start with a non-zero digit)</mat-hint>
                      <mat-error *ngIf="profileForm.get('emergencyPhone')?.hasError('required')">
                        Emergency contact phone is required
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('emergencyPhone')?.hasError('pattern')">
                        Please enter a valid phone number (must start with + followed by a non-zero digit, or a non-zero digit)
                      </mat-error>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="stepper-actions">
                <button mat-button matStepperNext [disabled]="!isBasicInfoValid()">Next</button>
              </div>
            </form>
          </mat-step>

          <!-- Skills & Interests Step -->
          <mat-step [stepControl]="profileForm" label="Skills & Interests">
            <form [formGroup]="profileForm" class="profile-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Skills & Interests</mat-card-title>
                  <mat-icon>psychology</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field class="full-width">
                      <mat-label>Skills</mat-label>
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

                    <mat-form-field class="full-width">
                      <mat-label>Interests</mat-label>
                      <mat-select formControlName="interests" multiple>
                        <mat-option value="education">Education</mat-option>
                        <mat-option value="environment">Environment</mat-option>
                        <mat-option value="health">Healthcare</mat-option>
                        <mat-option value="poverty">Poverty Alleviation</mat-option>
                        <mat-option value="animals">Animal Welfare</mat-option>
                        <mat-option value="community">Community Development</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="stepper-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-button matStepperNext>Next</button>
              </div>
            </form>
          </mat-step>

          <!-- Availability Step -->
          <mat-step [stepControl]="profileForm" label="Availability">
            <form [formGroup]="profileForm" class="profile-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Availability</mat-card-title>
                  <mat-icon>schedule</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <div formGroupName="availability">
                    <div *ngFor="let day of weekDays" class="day-row">
                      <mat-checkbox [formControlName]="day.toLowerCase()">
                        {{day}}
                      </mat-checkbox>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="stepper-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-button matStepperNext>Next</button>
              </div>
            </form>
          </mat-step>

          <!-- Preferences Step -->
          <mat-step [stepControl]="profileForm" label="Preferences">
            <form [formGroup]="profileForm" class="profile-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Preferences</mat-card-title>
                  <mat-icon>settings</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field>
                      <mat-label>Preferred Time of Day</mat-label>
                      <mat-select formControlName="preferredTimeOfDay" required>
                        <mat-option value="MORNING">Morning</mat-option>
                        <mat-option value="AFTERNOON">Afternoon</mat-option>
                        <mat-option value="EVENING">Evening</mat-option>
                      </mat-select>
                      <mat-error *ngIf="profileForm.get('preferredTimeOfDay')?.hasError('required')">
                        Preferred time of day is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Preferred Categories</mat-label>
                      <mat-select formControlName="preferredCategories" multiple>
                        <mat-option value="education">Education</mat-option>
                        <mat-option value="environment">Environment</mat-option>
                        <mat-option value="health">Healthcare</mat-option>
                        <mat-option value="poverty">Poverty Alleviation</mat-option>
                        <mat-option value="animals">Animal Welfare</mat-option>
                        <mat-option value="community">Community Development</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div class="checkbox-field">
                      <mat-checkbox formControlName="availableForEmergency">
                        Available for Emergency Response
                      </mat-checkbox>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Notification Preferences -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Notification Preferences</mat-card-title>
                  <mat-icon>notifications</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <div formGroupName="notificationPreferences">
                    <mat-slide-toggle formControlName="enabled">
                      Enable Notifications
                    </mat-slide-toggle>

                    <div class="notification-options" *ngIf="profileForm.get('notificationPreferences.enabled')?.value">
                      <mat-checkbox formControlName="email">Email Notifications</mat-checkbox>
                      <mat-checkbox formControlName="sms">SMS Notifications</mat-checkbox>
                      <mat-checkbox formControlName="push">Push Notifications</mat-checkbox>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Bio -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Bio</mat-card-title>
                  <mat-icon>description</mat-icon>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field class="full-width">
                    <mat-label>Tell us about yourself</mat-label>
                    <textarea matInput formControlName="bio" rows="4"></textarea>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>

              <div class="stepper-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-button matStepperNext>Next</button>
              </div>
            </form>
          </mat-step>

          <!-- Review Step -->
          <mat-step label="Review">
            <div class="review-content">
              <h2>Review Your Profile</h2>
              <p>Please review your information before saving. You can go back to any step to make changes.</p>
              
              <div class="stepper-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" (click)="onSubmit()" 
                        [disabled]="profileForm.invalid || isSubmitting">
                  <mat-icon class="mr-2">save</mat-icon>
                  Save Changes
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </div>

      <mat-progress-spinner
        *ngIf="loading"
        mode="indeterminate"
        diameter="50"
        class="loading-spinner"
      >
      </mat-progress-spinner>
    </div>
  `,
  styles: [`
    .edit-profile-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .edit-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .content-container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .error-message {
      color: #d32f2f;
      padding: 16px;
      margin-bottom: 24px;
      background-color: #ffebee;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-spinner {
      margin: 48px auto;
    }

    mat-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-card-content {
      padding: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .profile-picture-card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .profile-picture-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .profile-picture-wrapper {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .profile-picture {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-picture-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .profile-picture-wrapper:hover .profile-picture-overlay {
      opacity: 1;
    }

    .profile-picture-info {
      text-align: center;
      color: #666;
    }

    .day-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .notification-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-left: 16px;
    }

    .stepper-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .review-content {
      padding: 24px;
      text-align: center;
    }

    .review-content h2 {
      margin-bottom: 16px;
      color: #333;
    }

    .review-content p {
      color: #666;
      margin-bottom: 24px;
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .day-row {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  isSubmitting = false;
  error: string | null = null;
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  profilePictureUrl: SafeUrl | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private volunteerService: VolunteerService,
    private snackBar: MatSnackBar,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      address: [''],
      city: [''],
      country: [''],
      emergencyContact: ['', Validators.required],
      emergencyPhone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      skills: [[]],
      interests: [[]],
      preferredTimeOfDay: [''],
      preferredCategories: [[]],
      availableForEmergency: [false],
      notificationPreferences: this.fb.group({
        enabled: [false],
        email: [false],
        sms: [false],
        push: [false]
      }),
      availability: this.fb.group({
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false]
      }),
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;
    
    this.volunteerService.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        console.log('Profile picture URL:', profile.profilePicture);

        // Handle availability
        const availability = profile.availableDays || [];
        const availabilityData: { [key: string]: boolean } = {};
        this.weekDays.forEach(day => {
          const dayKey = day.toLowerCase();
          availabilityData[dayKey] = availability.includes(day.toUpperCase());
        });

        // Handle notification preferences
        const notificationPrefs = profile.notificationPreferences || [];
        const notificationData = {
          enabled: profile.receiveNotifications || false,
          email: notificationPrefs.includes('EMAIL'),
          sms: notificationPrefs.includes('SMS'),
          push: notificationPrefs.includes('PUSH')
        };

        // Update form with all data
        this.profileForm.patchValue({
          ...profile,
          availability: availabilityData,
          notificationPreferences: notificationData
        });

        // Handle profile picture
        if (profile.profilePicture) {
          const fullUrl = this.volunteerService.getProfilePictureUrl(profile.profilePicture);
          console.log('Full image URL:', fullUrl);
          this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
        } else {
          console.log('No profile picture found, using default');
          this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/default-avatar.png');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.error = 'Error loading profile: ' + error.message;
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.snackBar.open('File size must be less than 5MB', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      if (!file.type.match(/image\/(jpeg|png)/)) {
        this.snackBar.open('Only JPG and PNG files are allowed', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      this.selectedFile = file;
      this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      this.error = null;

      const formValue = this.profileForm.value;
      
      // Format phone numbers
      const phoneNumber = this.formatPhoneNumber(formValue.phoneNumber);
      const emergencyPhone = this.formatPhoneNumber(formValue.emergencyPhone);
      
      // Convert availability data to match backend format
      const availableDays = Object.entries(formValue.availability)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([day]) => day.toUpperCase());

      // Convert notification preferences to array format
      const notificationPreferences: string[] = [];
      if (formValue.notificationPreferences.enabled) {
        if (formValue.notificationPreferences.email) notificationPreferences.push('EMAIL');
        if (formValue.notificationPreferences.sms) notificationPreferences.push('SMS');
        if (formValue.notificationPreferences.push) notificationPreferences.push('PUSH');
      }

      const profileRequest: VolunteerProfileRequest = {
        bio: formValue.bio || '',
        phoneNumber: phoneNumber,
        address: formValue.address || '',
        city: formValue.city || '',
        country: formValue.country || '',
        emergencyContact: formValue.emergencyContact || '',
        emergencyPhone: emergencyPhone,
        preferredCategories: formValue.preferredCategories || [],
        skills: formValue.skills || [],
        interests: formValue.interests || [],
        availableDays: availableDays,
        preferredTimeOfDay: formValue.preferredTimeOfDay || '',
        certifications: [],
        languages: [],
        availableForEmergency: formValue.availableForEmergency || false,
        receiveNotifications: formValue.notificationPreferences.enabled || false,
        notificationPreferences: notificationPreferences,
        profileVisible: true
      };

      // First update the profile data
      this.volunteerService.updateProfile(profileRequest).subscribe({
        next: () => {
          // If there's a profile picture, upload it separately
          if (this.selectedFile) {
            this.volunteerService.uploadProfilePicture(this.selectedFile).subscribe({
              next: () => {
                this.snackBar.open('Profile updated successfully!', 'Close', {
                  duration: 5000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                });
                this.router.navigate(['/volunteer/profile']);
              },
              error: (error) => {
                this.isSubmitting = false;
                this.error = 'Error uploading profile picture: ' + error.message;
                this.snackBar.open(this.error, 'Close', {
                  duration: 5000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                });
              }
            });
          } else {
            this.snackBar.open('Profile updated successfully!', 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.router.navigate(['/volunteer/profile']);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.error?.errors) {
            Object.keys(error.error.errors).forEach(key => {
              const control = this.profileForm.get(key);
              if (control) {
                control.setErrors({ serverError: error.error.errors[key] });
              }
            });
            this.snackBar.open('Please fix the validation errors', 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          } else {
            this.error = 'Error updating profile: ' + error.message;
            this.snackBar.open(this.error, 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          }
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/volunteer/profile']);
  }

  isBasicInfoValid(): boolean {
    const basicInfo = this.profileForm.get('firstName')?.value &&
                     this.profileForm.get('lastName')?.value &&
                     this.profileForm.get('email')?.value;
    
    return !!basicInfo;
  }

  onImageError(event: Event): void {
    console.error('Error loading image:', event);
    // Prevent the target from triggering additional error events
    const target = event.target as HTMLImageElement;
    target.onerror = null; // Remove the error handler to prevent loops
    
    // Set default image
    this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/default-avatar.png');
    
    // Notify user
    this.snackBar.open('Could not load profile image. Using default image instead.', 'Close', {
      duration: 5000,
      panelClass: ['warning-snackbar']
    });
  }

  // Helper method to ensure phone numbers are correctly formatted
  private formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except the leading +
    let formatted = phone.trim();
    if (formatted.startsWith('+')) {
      // For international format starting with +
      formatted = '+' + formatted.substring(1).replace(/\D/g, '');
      
      // Ensure it starts with a non-zero digit after the +
      if (formatted.length > 1 && formatted.charAt(1) === '0') {
        formatted = '+' + formatted.substring(2); // Remove the 0 after +
      }
    } else {
      // For local format without +
      formatted = formatted.replace(/\D/g, '');
      
      // Remove leading zeros
      while (formatted.startsWith('0')) {
        formatted = formatted.substring(1);
      }
    }
    
    // Ensure the number isn't too long (max 15 digits including the +)
    if (formatted.startsWith('+') && formatted.length > 16) {
      formatted = formatted.substring(0, 16);
    } else if (!formatted.startsWith('+') && formatted.length > 15) {
      formatted = formatted.substring(0, 15);
    }
    
    return formatted;
  }
} 