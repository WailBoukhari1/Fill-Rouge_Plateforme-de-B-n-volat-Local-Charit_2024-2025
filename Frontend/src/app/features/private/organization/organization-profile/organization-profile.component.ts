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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { OrganizationService } from '../../../../core/services/organization.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrganizationProfile, OrganizationRequest, OrganizationType, OrganizationCategory, OrganizationSize, DocumentType, OrganizationDocument } from '../../../../core/models/organization.model';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MapComponent } from '../../../../shared/components/map/map.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatExpansionModule,
    MatBadgeModule,
    MatMenuModule,
    FileUploadComponent,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    MapComponent,
    HttpClientModule
  ],
  template: `
    <div class="profile-container">
      @if (loading) {
        <div class="loading-wrapper">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (organization) {
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-info">
              <div class="profile-header">
                <div class="profile-image-wrapper">
                @if (organization.profilePicture) {
                    <img [src]="getProfilePictureUrl(organization.profilePicture)" 
                       alt="Organization profile" 
                         class="profile-image"
                       (error)="onImageError($event)">
                } @else {
                    <div class="profile-image-placeholder">
                      <mat-icon>business</mat-icon>
                  </div>
                }
                  <button mat-fab color="primary" class="upload-button" (click)="fileInput.click()">
                    <mat-icon>camera_alt</mat-icon>
                  </button>
                  <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none">
                </div>
                <div class="profile-title">
                  <h1>{{organization.name}}</h1>
                    @if (organization.verified) {
                    <div class="verified-badge">
                      <mat-icon>verified</mat-icon>
                      <span>Verified Organization</span>
                      </div>
                    }
                  </div>
                </div>
              <div class="profile-actions">
                <button mat-raised-button color="primary" routerLink="edit">
                  <mat-icon>edit</mat-icon>
                  Edit Profile
                </button>
                <button mat-raised-button color="primary" routerLink="../events">
                  <mat-icon>event</mat-icon>
                  Manage Events
                </button>
                <button mat-raised-button color="warn" (click)="confirmDelete()">
                  <mat-icon>delete</mat-icon>
                  Delete Account
                </button>
              </div>
              </div>
            <div class="organization-stats">
              <div class="stat-card">
                <mat-icon>event</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">{{organization.totalEventsHosted}}</span>
                  <span class="stat-label">Events</span>
                </div>
                </div>
              <div class="stat-card">
                <mat-icon>people</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">{{organization.activeVolunteers}}</span>
                  <span class="stat-label">Volunteers</span>
                  </div>
                </div>
              <div class="stat-card">
                <mat-icon>star</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">{{organization.rating | number:'1.1-1'}}</span>
                  <span class="stat-label">Rating</span>
                </div>
              </div>
              <div class="stat-card">
                <mat-icon>trending_up</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">{{organization.impactScore | number:'1.1-1'}}</span>
                  <span class="stat-label">Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div class="content-grid">
          <!-- About Section -->
            <mat-card class="content-card about-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>info</mat-icon>
                  About Us
                </mat-card-title>
            </mat-card-header>
              <mat-card-content>
                <div class="about-content">
                  <div class="about-section">
                    <h3>Description</h3>
                    <p>{{organization.description}}</p>
                </div>
                  <div class="about-section">
                    <h3>Mission</h3>
                    <p>{{organization.mission}}</p>
                </div>
                  <div class="about-section">
                    <h3>Vision</h3>
                    <p>{{organization.vision}}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Contact Information -->
            <mat-card class="content-card contact-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>contact_mail</mat-icon>
                  Contact Information
                </mat-card-title>
            </mat-card-header>
              <mat-card-content>
                <div class="contact-list">
                  <div class="contact-item">
                    <mat-icon>phone</mat-icon>
                    <div class="contact-info">
                      <span class="contact-label">Phone</span>
                      <span class="contact-value">{{organization.phoneNumber}}</span>
                  </div>
                </div>
                  <div class="contact-item">
                    <mat-icon>language</mat-icon>
                    <div class="contact-info">
                      <span class="contact-label">Website</span>
                      <a [href]="organization.website" target="_blank" class="contact-value">{{organization.website}}</a>
                  </div>
                </div>
                  <div class="contact-item">
                    <mat-icon>location_on</mat-icon>
                    <div class="contact-info">
                      <span class="contact-label">Address</span>
                      <span class="contact-value">{{organization.address}}</span>
                      <span class="contact-value">{{organization.city}}, {{organization.province}} {{organization.postalCode}}</span>
                  </div>
                </div>
                @if (organization.registrationNumber) {
                    <div class="contact-item">
                      <mat-icon>badge</mat-icon>
                      <div class="contact-info">
                        <span class="contact-label">Registration Number</span>
                        <span class="contact-value">{{organization.registrationNumber}}</span>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Focus Areas -->
            <mat-card class="content-card focus-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>category</mat-icon>
                  Focus Areas
                </mat-card-title>
            </mat-card-header>
              <mat-card-content>
                <div class="focus-areas">
                @for (area of organization.focusAreas; track area) {
                    <mat-chip color="primary" selected>{{area}}</mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Location Map -->
            <mat-card class="content-card map-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>map</mat-icon>
                  Location
                </mat-card-title>
            </mat-card-header>
              <mat-card-content>
                @if (organization.coordinates) {
                  <app-map [coordinates]="{ lat: organization.coordinates[0], lng: organization.coordinates[1] }"></app-map>
                } @else {
                  <div class="no-map">
                    <mat-icon>location_off</mat-icon>
                    <p>No location coordinates available</p>
                  </div>
                }
            </mat-card-content>
          </mat-card>

            <!-- Social Media -->
          @if (organization.socialMediaLinks) {
              <mat-card class="content-card social-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>share</mat-icon>
                    Social Media
                  </mat-card-title>
              </mat-card-header>
                <mat-card-content>
                  <div class="social-links">
                  @if (organization.socialMediaLinks.facebook) {
                      <a [href]="organization.socialMediaLinks.facebook" target="_blank" class="social-link facebook">
                        <mat-icon>facebook</mat-icon>
                        <span>Facebook</span>
                    </a>
                  }
                  @if (organization.socialMediaLinks.twitter) {
                      <a [href]="organization.socialMediaLinks.twitter" target="_blank" class="social-link twitter">
                        <mat-icon>twitter</mat-icon>
                        <span>Twitter</span>
                    </a>
                  }
                  @if (organization.socialMediaLinks.instagram) {
                      <a [href]="organization.socialMediaLinks.instagram" target="_blank" class="social-link instagram">
                        <mat-icon>photo_camera</mat-icon>
                        <span>Instagram</span>
                    </a>
                  }
                  @if (organization.socialMediaLinks.linkedin) {
                      <a [href]="organization.socialMediaLinks.linkedin" target="_blank" class="social-link linkedin">
                        <mat-icon>linkedin</mat-icon>
                        <span>LinkedIn</span>
                    </a>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- Documents -->
          @if (organization.documents && organization.documents.length > 0) {
              <mat-card class="content-card documents-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>folder</mat-icon>
                    Documents
                  </mat-card-title>
              </mat-card-header>
                <mat-card-content>
                  <div class="documents-list">
                  @for (doc of organization.documents; track doc) {
                      <div class="document-item">
                        <mat-icon>description</mat-icon>
                        <span class="document-name">{{doc}}</span>
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
        </div>
      } @else {
        <div class="error-wrapper">
          <mat-icon>error_outline</mat-icon>
          <p>Organization profile not found</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background-color: #f5f7fa;
    }

    .loading-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .hero-section {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      padding: 2rem 0;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .hero-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .profile-image-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
    }

    .profile-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .profile-image-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4px solid rgba(255, 255, 255, 0.8);
    }

    .profile-image-placeholder mat-icon {
      font-size: 3rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .upload-button {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: white;
      color: #2196f3;
    }

    .profile-title h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 500;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      margin-top: 0.5rem;
      backdrop-filter: blur(4px);
    }

    .verified-badge mat-icon {
      color: #4caf50;
    }

    .profile-actions {
      display: flex;
      gap: 1rem;
    }

    .organization-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 8px;
      backdrop-filter: blur(4px);
    }

    .stat-card mat-icon {
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 500;
      color: white;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .main-content {
      max-width: 1200px;
      margin: -2rem auto 2rem;
      padding: 0 1rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .content-card {
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .content-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .content-card mat-card-header {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .content-card mat-card-header mat-icon {
      margin-right: 0.5rem;
      color: #2196f3;
    }

    .content-card mat-card-content {
      padding: 1.5rem;
    }

    .about-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .about-section h3 {
      margin: 0 0 0.5rem;
      color: #1976d2;
      font-size: 1.1rem;
    }

    .about-section p {
      margin: 0;
      color: #424242;
      line-height: 1.6;
    }

    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.3s ease;
    }

    .contact-item:hover {
      background-color: #f5f5f5;
    }

    .contact-item mat-icon {
      color: #2196f3;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-label {
      font-size: 0.875rem;
      color: #757575;
    }

    .contact-value {
      color: #424242;
      text-decoration: none;
    }

    .focus-areas {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .map-card {
      grid-column: 1 / -1;
      height: 400px;
    }

    .no-map {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #757575;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .no-map mat-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #9e9e9e;
    }

    .social-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: white;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .social-link.facebook {
      background-color: #1877f2;
    }

    .social-link.twitter {
      background-color: #1da1f2;
    }

    .social-link.instagram {
      background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    }

    .social-link.linkedin {
      background-color: #0077b5;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      transition: background-color 0.3s ease;
    }

    .document-item:hover {
      background-color: #eeeeee;
    }

    .document-item mat-icon {
      color: #2196f3;
    }

    .document-name {
      flex: 1;
      color: #424242;
    }

    .error-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: #757575;
    }

    .error-wrapper mat-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #f44336;
    }

    @media (max-width: 768px) {
      .hero-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .profile-actions {
        width: 100%;
        justify-content: center;
      }

      .organization-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
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
  environment = environment;

  organizationTypes = Object.values(OrganizationType);
  organizationCategories = Object.values(OrganizationCategory);
  organizationSizes = Object.values(OrganizationSize);

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: RouterModule,
    private http: HttpClient
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

      // Ensure focusAreas is an array
      const focusAreas = Array.isArray(this.focusAreas) ? this.focusAreas : [];

    const request: OrganizationRequest = {
        ...formData,
        logo: this.organization?.logo,
        focusAreas: focusAreas
      };

      console.log('Sending request:', request); // Debug log

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
    if (!file) {
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

    // Validate file type
      if (!file.type.match(/image\/(jpeg|png)/)) {
        this.snackBar.open('Only JPG and PNG files are allowed', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

    // Create FormData and append the file
    const formData = new FormData();
    formData.append('file', file);

    // Upload the file using the file upload API
    this.http.post<{ fileId: string }>(`${environment.apiUrl}/files/upload`, formData, {
      headers: {
        'Accept': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        console.log('File upload response:', response); // Debug log
        if (!response.fileId) {
          console.error('No fileId in response:', response);
          this.snackBar.open('Invalid response from server', 'Close', { duration: 5000 });
          return;
        }

        // Update the organization profile with the new file ID
        if (this.organization?.id && this.organization.type && this.organization.category && this.organization.size) {
          // Ensure focusAreas is initialized as an array
          const focusAreas = this.organization.focusAreas || [];
          
          const request: OrganizationRequest = {
            name: this.organization.name,
            description: this.organization.description,
            mission: this.organization.mission,
            vision: this.organization.vision,
            website: this.organization.website || '',
            phoneNumber: this.organization.phoneNumber,
            address: this.organization.address,
            city: this.organization.city,
            province: this.organization.province,
            country: this.organization.country,
            postalCode: this.organization.postalCode,
            registrationNumber: this.organization.registrationNumber || '',
            type: this.organization.type,
            category: this.organization.category,
            size: this.organization.size,
            foundedYear: this.organization.foundedYear || 0,
            coordinates: this.organization.coordinates || [0, 0],
            socialMediaLinks: this.organization.socialMediaLinks || {},
            focusAreas: focusAreas,
            profilePicture: response.fileId,
            logo: this.organization.logo || ''
          };

          console.log('Sending organization update request:', request); // Debug log

          this.organizationService.updateOrganization(this.organization.id, request).subscribe({
            next: (response) => {
              if (response.data) {
                console.log('Organization update response:', response.data); // Debug log
                this.organization = response.data;
                this.snackBar.open('Profile picture updated successfully', 'Close', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error updating organization profile:', error);
              this.snackBar.open('Failed to update organization profile', 'Close', { duration: 5000 });
            }
          });
        } else {
          console.error('Organization data is incomplete:', this.organization); // Debug log
          this.snackBar.open('Organization data is incomplete', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.snackBar.open('Failed to upload file', 'Close', { duration: 5000 });
      }
    });
  }

  onImageError(event: Event): void {
    console.error('Error loading image:', event);
    if (this.organization?.profilePicture) {
      console.log('Current profile picture URL:', this.getProfilePictureUrl(this.organization.profilePicture));
      this.organization.profilePicture = undefined;
    }
  }

  getProfilePictureUrl(fileId: string): string {
    return `${environment.apiUrl}/files/${fileId}`;
  }
} 