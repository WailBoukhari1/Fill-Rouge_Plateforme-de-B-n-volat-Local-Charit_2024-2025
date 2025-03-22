import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { VolunteerService, VolunteerProfile, VolunteerStatistics } from '../../../../core/services/volunteer.service';
import { CloseAccountDialogComponent } from './close-account-dialog.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-volunteer-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  template: `
    <div class="profile-container">
      <!-- Top Toolbar -->
      <mat-toolbar color="primary" class="profile-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>My Profile</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="editProfile()" matTooltip="Edit Profile">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button (click)="closeProfile()" matTooltip="Close Account">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>

      <div class="content-container">
        <div *ngIf="error" class="error-message">
          <mat-icon>error_outline</mat-icon>
          {{ error }}
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        </div>

        <div *ngIf="!loading && profile" class="profile-content">
          <!-- Profile Header -->
          <mat-card class="profile-header">
            <mat-card-content>
              <div class="profile-picture-container">
                <div class="profile-picture-wrapper">
                  <div class="profile-picture" [class.no-image]="!profilePictureUrl">
                    <img *ngIf="profilePictureUrl" [src]="profilePictureUrl" alt="Profile Picture">
                    <mat-icon *ngIf="!profilePictureUrl">account_circle</mat-icon>
                    <div class="profile-picture-overlay">
                      <input
                        type="file"
                        #fileInput
                        accept="image/*"
                        (change)="onFileSelected($event)"
                        style="display: none"
                      >
                      <button mat-icon-button (click)="fileInput.click()" matTooltip="Change Profile Picture">
                        <mat-icon>camera_alt</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="profile-info">
                  <h1>{{ profile.firstName }} {{ profile.lastName }}</h1>
                  <p class="email">{{ profile.email }}</p>
                  <p class="phone" *ngIf="profile.phoneNumber">{{ profile.phoneNumber }}</p>
                  <div class="status-badge" [class.active]="profile.isActive">
                    {{ profile.isActive ? 'Active' : 'Inactive' }}
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Statistics -->
          <mat-card class="stats-card">
            <mat-card-content>
              <div class="stats-grid">
                <div class="stat-item">
                  <mat-icon class="stat-icon">event</mat-icon>
                  <div class="stat-info">
                    <span class="stat-value">{{ stats?.totalEventsAttended || 0 }}</span>
                    <span class="stat-label">Events Attended</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon class="stat-icon">schedule</mat-icon>
                  <div class="stat-info">
                    <span class="stat-value">{{ stats?.totalHoursVolunteered || 0 }}</span>
                    <span class="stat-label">Hours Volunteered</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon class="stat-icon">star</mat-icon>
                  <div class="stat-info">
                    <span class="stat-value">{{ stats?.averageRating || 0 | number:'1.1-1' }}</span>
                    <span class="stat-label">Average Rating</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon class="stat-icon">trending_up</mat-icon>
                  <div class="stat-info">
                    <span class="stat-value">{{ stats?.reliabilityScore || 0 }}%</span>
                    <span class="stat-label">Reliability Score</span>
                  </div>
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
              <div class="info-grid">
                <div class="info-item">
                  <label>Phone</label>
                  <span>{{ profile.phoneNumber || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Address</label>
                  <span>{{ profile.address || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>City</label>
                  <span>{{ profile.city || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Country</label>
                  <span>{{ profile.country || 'Not provided' }}</span>
                </div>
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
              <div class="info-grid">
                <div class="info-item">
                  <label>Name</label>
                  <span>{{ profile.emergencyContact || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Phone</label>
                  <span>{{ profile.emergencyPhone || 'Not provided' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Skills & Interests -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Skills & Interests</mat-card-title>
              <mat-icon>psychology</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="skills-section">
                <h3>Skills</h3>
                <div class="chips-container">
                  <mat-chip *ngFor="let skill of profile.skills" color="primary" selected>
                    {{ skill }}
                  </mat-chip>
                  <span *ngIf="!profile.skills?.length" class="no-data">No skills listed</span>
                </div>
              </div>
              <div class="skills-section">
                <h3>Interests</h3>
                <div class="chips-container">
                  <mat-chip *ngFor="let interest of profile.interests" color="accent" selected>
                    {{ interest }}
                  </mat-chip>
                  <span *ngIf="!profile.interests?.length" class="no-data">No interests listed</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Availability -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Availability</mat-card-title>
              <mat-icon>schedule</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="availability-grid">
                <div *ngFor="let day of weekDays" class="day-row">
                  <div class="day-name">{{ day }}</div>
                  <div class="day-availability">
                    <span *ngIf="profile.availableDays.includes(day.toUpperCase())" class="time-slot">
                      Available
                    </span>
                    <span *ngIf="!profile.availableDays.includes(day.toUpperCase())" class="unavailable">
                      Not Available
                    </span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Preferences -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Preferences</mat-card-title>
              <mat-icon>settings</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Max Hours per Week</label>
                  <span>{{ profile.maxHoursPerWeek || 'Not specified' }}</span>
                </div>
                <div class="info-item">
                  <label>Preferred Radius</label>
                  <span>{{ profile.preferredRadius ? profile.preferredRadius + ' km' : 'Not specified' }}</span>
                </div>
                <div class="info-item">
                  <label>Preferred Time of Day</label>
                  <span>{{ profile.preferredTimeOfDay || 'Not specified' }}</span>
                </div>
              </div>
              <div class="preferences-section">
                <h3>Preferred Categories</h3>
                <div class="chips-container">
                  <mat-chip *ngFor="let category of profile.preferredCategories" color="primary" selected>
                    {{ category }}
                  </mat-chip>
                  <span *ngIf="!profile.preferredCategories?.length" class="no-data">No categories selected</span>
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
              <div class="notification-preferences">
                <div class="preference-item">
                  <label>Notifications Enabled</label>
                  <span>{{ profile.receiveNotifications ? 'Yes' : 'No' }}</span>
                </div>
                <div *ngIf="profile.receiveNotifications" class="preference-options">
                  <div class="preference-item">
                    <label>Email Notifications</label>
                    <span>{{ profile.notificationPreferences.includes('EMAIL') ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="preference-item">
                    <label>SMS Notifications</label>
                    <span>{{ profile.notificationPreferences.includes('SMS') ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="preference-item">
                    <label>Push Notifications</label>
                    <span>{{ profile.notificationPreferences.includes('PUSH') ? 'Yes' : 'No' }}</span>
                  </div>
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
              <div class="bio-content">
                {{ profile.bio || 'No bio provided' }}
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .profile-toolbar {
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

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-header {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .profile-picture-container {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
    }

    .profile-picture-wrapper {
      position: relative;
    }

    .profile-picture {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      background-color: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .profile-picture img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-picture mat-icon {
      width: 100%;
      height: 100%;
      font-size: 150px;
      color: #757575;
    }

    .profile-picture-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .profile-picture:hover .profile-picture-overlay {
      opacity: 1;
    }

    .profile-picture-overlay button {
      color: white;
    }

    .profile-info {
      flex: 1;
    }

    .profile-info h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .profile-info .email, .profile-info .phone {
      margin: 8px 0 0;
      color: #666;
      font-size: 1.1rem;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      background-color: #e0e0e0;
      color: #666;
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .status-badge.active {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .stats-card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      padding: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      transition: transform 0.2s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      color: #1976d2;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 500;
      color: #333;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
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

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
    }

    .info-item span {
      color: #333;
    }

    .skills-section {
      margin-bottom: 24px;
    }

    .skills-section:last-child {
      margin-bottom: 0;
    }

    .skills-section h3 {
      margin: 0 0 16px;
      color: #333;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .availability-grid {
      display: grid;
      gap: 16px;
    }

    .day-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .day-name {
      min-width: 100px;
      font-weight: 500;
    }

    .day-availability {
      flex: 1;
    }

    .time-slot {
      color: #2e7d32;
    }

    .unavailable {
      color: #666;
      font-style: italic;
    }

    .preferences-section {
      margin-top: 24px;
    }

    .preferences-section h3 {
      margin: 0 0 16px;
      color: #333;
    }

    .notification-preferences {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .preference-options {
      margin-left: 16px;
    }

    .bio-content {
      white-space: pre-wrap;
      color: #333;
      line-height: 1.6;
    }

    .no-data {
      color: #666;
      font-style: italic;
    }

    @media (max-width: 600px) {
      .profile-picture-container {
        flex-direction: column;
        text-align: center;
      }

      .profile-info {
        text-align: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .day-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .day-name {
        min-width: auto;
      }
    }
  `]
})
export class VolunteerProfileComponent implements OnInit {
  profile: VolunteerProfile | null = null;
  stats: VolunteerStatistics | null = null;
  loading = true;
  error: string | null = null;
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  profilePictureUrl: SafeUrl | null = null;

  constructor(
    private volunteerService: VolunteerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadStatistics();
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;
    
    this.volunteerService.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        this.profile = profile;
        if (profile.profilePicture) {
          // Add timestamp to prevent browser caching
          const timestamp = new Date().getTime();
          const pictureUrl = this.volunteerService.getProfilePictureUrl(profile.profilePicture) + '?t=' + timestamp;
          console.log('Profile picture URL with timestamp:', pictureUrl);
          this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(pictureUrl);
          console.log('Sanitized URL:', this.profilePictureUrl);
        } else {
          console.log('No profile picture found in profile data');
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

  private loadStatistics(): void {
    this.volunteerService.getStatistics().subscribe({
      next: (stats: VolunteerStatistics) => {
        this.stats = stats;
      },
      error: (error: Error) => {
        console.error('Error loading statistics:', error);
      },
    });
  }

  editProfile(): void {
    this.router.navigate(['/volunteer/profile/edit']);
  }

  closeProfile(): void {
    const dialogRef = this.dialog.open(CloseAccountDialogComponent, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.volunteerService.closeAccount().subscribe({
          next: () => {
            this.snackBar.open('Account closed successfully', 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.router.navigate(['/auth/login']);
          },
          error: (error: Error) => {
            this.error = 'Error closing account: ' + error.message;
            this.snackBar.open(this.error, 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          },
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/volunteer/dashboard']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      // Create a local preview of the image before uploading
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Create a temporary local preview while the image uploads
        this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      this.loading = true;
      this.volunteerService.uploadProfilePicture(file).subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          
          // Force refresh the image by adding a timestamp to prevent caching
          if (updatedProfile.profilePicture) {
            const timestamp = new Date().getTime();
            const pictureUrl = this.volunteerService.getProfilePictureUrl(updatedProfile.profilePicture) + '?t=' + timestamp;
            this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(pictureUrl);
          }
          
          this.snackBar.open('Profile picture updated successfully', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error uploading profile picture: ' + error.message;
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.loading = false;
        },
      });
    }
  }
} 