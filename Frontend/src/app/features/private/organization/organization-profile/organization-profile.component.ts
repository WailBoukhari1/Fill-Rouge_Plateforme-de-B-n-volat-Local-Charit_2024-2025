import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { OrganizationService } from '../../../../core/services/organization.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrganizationProfile, OrganizationRequest, OrganizationType, OrganizationCategory, OrganizationSize, DocumentType, OrganizationDocument } from '../../../../core/models/organization.model';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MapComponent } from '../../../../shared/components/map/map.component';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    FileUploadComponent,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    MapComponent
  ],
  template: `
    <div class="container mx-auto p-2 sm:p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (organization) {
        <!-- Header Section with Profile Picture -->
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            <!-- Profile Picture -->
            <div class="relative">
              <div class="profile-picture-wrapper">
                @if (organization.profilePicture) {
                  <img [src]="organization.profilePicture" 
                       alt="Organization profile" 
                       class="profile-picture"
                       (error)="onImageError($event)">
                } @else {
                  <div class="profile-picture-placeholder">
                    <mat-icon class="text-4xl sm:text-6xl text-primary-500">business</mat-icon>
                  </div>
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
                <p class="text-sm text-gray-500">Click to upload a new profile picture</p>
                <p class="text-xs text-gray-400">Supported formats: JPG, PNG. Max size: 5MB</p>
              </div>
            </div>

            <!-- Organization Info -->
            <div class="flex-1 text-center md:text-left">
              <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div>
                  <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">{{organization.name}}</h1>
                  <div class="flex items-center gap-2 mt-2">
                    @if (organization.verified) {
                      <mat-icon class="text-green-500">verified</mat-icon>
                      <span class="text-sm text-green-600">Verified Organization</span>
                    }
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2 sm:space-x-2 profile-actions">
                  <button mat-raised-button color="primary" routerLink="edit" class="shadow-md w-full sm:w-auto">
                    <mat-icon class="mr-2">edit</mat-icon>
                    Edit Profile
                  </button>
                  <button mat-raised-button color="warn" (click)="confirmDelete()" class="shadow-md w-full sm:w-auto">
                    <mat-icon class="mr-2">delete</mat-icon>
                    Delete Account
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 profile-info">
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">category</mat-icon>
                  <span>{{organization.type}}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">location_on</mat-icon>
                  <span>{{organization.city}}, {{organization.province}}</span>
                </div>
                @if (organization.foundedYear) {
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-primary-500">calendar_today</mat-icon>
                    <span>Founded {{organization.foundedYear}}</span>
                  </div>
                }
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-primary-500">people</mat-icon>
                  <span>{{organization.size}} Organization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <!-- About Section -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">About Us</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="space-y-4">
                <div>
                  <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-2">Description</h3>
                  <p class="text-sm sm:text-base text-gray-600">{{organization.description}}</p>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-2">Mission</h3>
                  <p class="text-sm sm:text-base text-gray-600">{{organization.mission}}</p>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-2">Vision</h3>
                  <p class="text-sm sm:text-base text-gray-600">{{organization.vision}}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Contact Information -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Contact Information</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="space-y-4">
                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-500 mt-1">phone</mat-icon>
                  <div>
                    <h3 class="font-semibold text-gray-700">Phone</h3>
                    <p class="text-sm sm:text-base text-gray-600">{{organization.phoneNumber}}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-500 mt-1">language</mat-icon>
                  <div>
                    <h3 class="font-semibold text-gray-700">Website</h3>
                    <a [href]="organization.website" target="_blank" 
                       class="text-sm sm:text-base text-primary-600 hover:text-primary-700 hover:underline">
                      {{organization.website}}
                    </a>
                  </div>
                </div>
                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-500 mt-1">location_on</mat-icon>
                  <div>
                    <h3 class="font-semibold text-gray-700">Address</h3>
                    <p class="text-sm sm:text-base text-gray-600">{{organization.address}}</p>
                    <p class="text-sm sm:text-base text-gray-600">{{organization.city}}, {{organization.province}}</p>
                    <p class="text-sm sm:text-base text-gray-600">{{organization.postalCode}}</p>
                  </div>
                </div>
                @if (organization.registrationNumber) {
                  <div class="flex items-start">
                    <mat-icon class="mr-3 text-primary-500 mt-1">badge</mat-icon>
                    <div>
                      <h3 class="font-semibold text-gray-700">Registration Number</h3>
                      <p class="text-sm sm:text-base text-gray-600">{{organization.registrationNumber}}</p>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Focus Areas -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Focus Areas</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="flex flex-wrap gap-2">
                @for (area of organization.focusAreas; track area) {
                  <mat-chip class="bg-primary-100 text-primary-700">{{area}}</mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Statistics -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Statistics</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="grid grid-cols-2 gap-4 sm:gap-6 statistics-grid">
                <div class="text-center p-3 sm:p-4 bg-primary-50 rounded-lg statistics-item">
                  <div class="text-2xl sm:text-3xl font-bold text-primary-600 statistics-value">{{organization.totalEventsHosted}}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1 statistics-label">Total Events</div>
                </div>
                <div class="text-center p-3 sm:p-4 bg-primary-50 rounded-lg statistics-item">
                  <div class="text-2xl sm:text-3xl font-bold text-primary-600 statistics-value">{{organization.activeVolunteers}}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1 statistics-label">Active Volunteers</div>
                </div>
                <div class="text-center p-3 sm:p-4 bg-primary-50 rounded-lg statistics-item">
                  <div class="text-2xl sm:text-3xl font-bold text-primary-600 statistics-value">{{organization.totalVolunteerHours}}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1 statistics-label">Total Hours</div>
                </div>
                <div class="text-center p-3 sm:p-4 bg-primary-50 rounded-lg statistics-item">
                  <div class="text-2xl sm:text-3xl font-bold text-primary-600 statistics-value">{{organization.rating | number:'1.1-1'}}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1 statistics-label">Rating</div>
                </div>
                <div class="text-center p-3 sm:p-4 bg-primary-50 rounded-lg statistics-item">
                  <div class="text-2xl sm:text-3xl font-bold text-primary-600 statistics-value">{{organization.numberOfRatings}}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1 statistics-label">Ratings Received</div>
                </div>
                <div class="text-center p-3 sm:p-4 bg-primary-50 rounded-lg statistics-item">
                  <div class="text-2xl sm:text-3xl font-bold text-primary-600 statistics-value">{{organization.impactScore | number:'1.1-1'}}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1 statistics-label">Impact Score</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Location Map -->
          <mat-card class="md:col-span-2 shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Location</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
                @if (organization.coordinates) {
                  <app-map [coordinates]="organization.coordinates"></app-map>
                } @else {
                  <div class="flex flex-col items-center justify-center h-full bg-gray-100">
                    <mat-icon class="text-3xl sm:text-4xl text-gray-400">location_off</mat-icon>
                    <p class="mt-2 text-sm sm:text-base text-gray-600">No location coordinates available</p>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Social Media Links -->
          @if (organization.socialMediaLinks) {
            <mat-card class="md:col-span-2 shadow-md">
              <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
                <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Social Media</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4 sm:p-6">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  @if (organization.socialMediaLinks.facebook) {
                    <a [href]="organization.socialMediaLinks.facebook" target="_blank" 
                       class="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <mat-icon class="text-blue-600">facebook</mat-icon>
                      <span class="text-sm text-blue-600">Facebook</span>
                    </a>
                  }
                  @if (organization.socialMediaLinks.twitter) {
                    <a [href]="organization.socialMediaLinks.twitter" target="_blank"
                       class="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <mat-icon class="text-blue-400">twitter</mat-icon>
                      <span class="text-sm text-blue-400">Twitter</span>
                    </a>
                  }
                  @if (organization.socialMediaLinks.instagram) {
                    <a [href]="organization.socialMediaLinks.instagram" target="_blank"
                       class="flex items-center gap-2 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                      <mat-icon class="text-pink-600">photo_camera</mat-icon>
                      <span class="text-sm text-pink-600">Instagram</span>
                    </a>
                  }
                  @if (organization.socialMediaLinks.linkedin) {
                    <a [href]="organization.socialMediaLinks.linkedin" target="_blank"
                       class="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <mat-icon class="text-blue-700">linkedin</mat-icon>
                      <span class="text-sm text-blue-700">LinkedIn</span>
                    </a>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- Documents -->
          @if (organization.documents && organization.documents.length > 0) {
            <mat-card class="md:col-span-2 shadow-md">
              <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
                <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Documents</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4 sm:p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (doc of organization.documents; track doc) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-gray-600">description</mat-icon>
                        <span class="text-sm text-gray-600">{{doc}}</span>
                      </div>
                      <button mat-icon-button color="primary" (click)="downloadDocument(doc)">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="text-center py-8">
          <p class="text-gray-500">Organization profile not found</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
    mat-form-field {
      width: 100%;
    }
    .mat-mdc-tab-body-wrapper {
      padding: 20px 0;
    }
    :host ::ng-deep .mat-mdc-card-header-text {
      margin: 0;
    }
    :host ::ng-deep .mat-mdc-card {
      border-radius: 12px;
    }
    :host ::ng-deep .mat-mdc-raised-button {
      border-radius: 8px;
    }
    :host ::ng-deep .mat-mdc-chip {
      border-radius: 16px;
    }
    .profile-picture-wrapper {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border: 4px solid var(--primary-color, #3b82f6);
    }
    .profile-picture {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profile-picture-placeholder {
      width: 100%;
      height: 100%;
      background-color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
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
      transition: opacity 0.3s ease;
    }
    .profile-picture-wrapper:hover .profile-picture-overlay {
      opacity: 1;
    }
    .profile-picture-info {
      text-align: center;
      margin-top: 8px;
    }
    @media (max-width: 640px) {
      :host ::ng-deep .mat-mdc-card-header {
        padding: 8px 16px;
      }
      :host ::ng-deep .mat-mdc-card-content {
        padding: 16px;
      }
      :host ::ng-deep .mat-mdc-form-field {
        margin-bottom: 8px;
      }
      :host ::ng-deep .mat-mdc-raised-button {
        width: 100%;
      }
      .statistics-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .statistics-item {
        padding: 8px;
      }
      .statistics-value {
        font-size: 1.25rem;
      }
      .statistics-label {
        font-size: 0.75rem;
      }
      .profile-picture-wrapper {
        width: 120px;
        height: 120px;
      }
    }
    @media (max-width: 480px) {
      .statistics-grid {
        grid-template-columns: 1fr;
      }
      .profile-header {
        text-align: center;
      }
      .profile-actions {
        width: 100%;
        margin-top: 1rem;
      }
      .profile-info {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }
      .profile-picture-wrapper {
        width: 100px;
        height: 100px;
      }
    }
  `]
})
export class OrganizationProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  organization: OrganizationProfile | null = null;
  newFocusArea = '';
  focusAreas: string[] = [];
  documents: OrganizationDocument[] = [];

  organizationTypes = Object.values(OrganizationType);
  organizationCategories = Object.values(OrganizationCategory);
  organizationSizes = Object.values(OrganizationSize);

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: RouterModule
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadOrganizationProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      mission: ['', [Validators.required]],
      vision: ['', [Validators.required]],
      website: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      registrationNumber: ['', [Validators.pattern('^[A-Z0-9-]{5,20}$')]],
      type: ['', [Validators.required]],
      category: ['', [Validators.required]],
      size: ['', [Validators.required]],
      foundedYear: [''],
      coordinates: [[], [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      socialMediaLinks: this.fb.group({
        facebook: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
        twitter: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
        instagram: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
        linkedin: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]]
      })
    });
  }

  private loadOrganizationProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    this.organizationService.getOrganizationByUserId(userId).subscribe({
      next: (response) => {
        this.organization = response;
        this.focusAreas = response.focusAreas || [];
        this.updateForm(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organization profile:', error);
        this.snackBar.open('Error loading organization profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private updateForm(organization: OrganizationProfile): void {
    this.profileForm.patchValue({
      name: organization.name,
      description: organization.description,
      mission: organization.mission,
      vision: organization.vision,
      website: organization.website,
      phoneNumber: organization.phoneNumber,
      address: organization.address,
      city: organization.city,
      country: organization.country,
      registrationNumber: organization.registrationNumber,
      socialMediaLinks: organization.socialMediaLinks || {}
    });
  }

  private validateCoordinates(coordinates: number[]): boolean {
    if (!coordinates || coordinates.length !== 2) return false;
    const [latitude, longitude] = coordinates;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.organization?.id) {
      this.loading = true;
      const formData = this.profileForm.value;
      
      // Validate coordinates before submission
      if (formData.coordinates && !this.validateCoordinates(formData.coordinates)) {
        this.snackBar.open('Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.', 'Close', { duration: 5000 });
        this.loading = false;
        return;
      }

    const request: OrganizationRequest = {
        ...formData,
        logo: this.organization?.logo,
        focusAreas: this.focusAreas
      };

      this.organizationService.updateOrganization(this.organization.id, request).subscribe({
        next: (response) => {
          if (response.data) {
            this.organization = response.data;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating organization profile:', error);
          let errorMessage = 'Error updating organization profile';
          
          if (error.error?.details) {
            const details = error.error.details;
            if (details.website) errorMessage = 'Invalid website URL format';
            if (details.registrationNumber) errorMessage = 'Invalid registration number format';
            if (details.validCoordinates) errorMessage = 'Invalid coordinates. Please check latitude and longitude values.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    if (this.organization) {
      this.updateForm(this.organization);
    }
  }

  addFocusArea(): void {
    if (this.newFocusArea && !this.focusAreas.includes(this.newFocusArea)) {
      this.focusAreas.push(this.newFocusArea);
      this.newFocusArea = '';
    }
  }

  removeFocusArea(area: string): void {
    this.focusAreas = this.focusAreas.filter(a => a !== area);
  }

  onLogoSelected(event: any): void {
    if (event && this.organization?.id) {
      this.organizationService.uploadLogo(this.organization.id, event).subscribe({
        next: (response) => {
          this.organization = response.data;
          this.snackBar.open('Logo uploaded successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error uploading logo:', error);
          this.snackBar.open('Error uploading logo', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDocumentSelected(event: any): void {
    if (event && this.organization?.id) {
      this.organizationService.uploadDocument(this.organization.id, event, DocumentType.OTHER).subscribe({
        next: (response) => {
          this.documents.push(response.data);
          this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          this.snackBar.open('Error uploading document', 'Close', { duration: 3000 });
        }
      });
    }
  }

  downloadDocument(docUrl: string): void {
    window.open(docUrl, '_blank');
  }

  deleteDocument(doc: OrganizationDocument): void {
    if (this.organization?.id) {
      this.organizationService.deleteDocument(this.organization.id, doc.id).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== doc.id);
          this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.snackBar.open('Error deleting document', 'Close', { duration: 3000 });
        }
      });
    }
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Organization Account',
        message: 'Are you sure you want to delete your organization account? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.organization?.id) {
        this.deleteOrganization();
      }
    });
  }

  private deleteOrganization(): void {
    this.organizationService.deleteOrganization(this.organization!.id).subscribe({
      next: () => {
        this.snackBar.open('Organization account deleted successfully', 'Close', { duration: 3000 });
        this.authService.logout().subscribe();
      },
      error: (error) => {
        console.error('Error deleting organization:', error);
        this.snackBar.open('Error deleting organization account', 'Close', { duration: 3000 });
      }
    });
  }

  onProfilePictureSelected(file: File): void {
    if (this.organization?.id) {
      this.organizationService.uploadProfilePicture(this.organization.id, file)
        .subscribe({
          next: (response: OrganizationProfile) => {
            this.organization = response;
            this.snackBar.open('Profile picture updated successfully', 'Close', { duration: 3000 });
          },
          error: (error: any) => {
            console.error('Error uploading profile picture:', error);
            this.snackBar.open('Failed to upload profile picture', 'Close', { duration: 5000 });
          }
        });
    }
  }

  onProfilePictureUploaded(event: { url: string }): void {
    if (this.organization) {
      this.organization.profilePicture = event.url;
    }
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

      this.onProfilePictureSelected(file);
    }
  }

  onImageError(event: Event): void {
    console.error('Error loading image:', event);
    if (this.organization) {
      this.organization.profilePicture = undefined;
    }
  }
} 