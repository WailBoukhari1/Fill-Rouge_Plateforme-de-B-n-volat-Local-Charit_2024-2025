import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  FormArray,
} from '@angular/forms';
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
import {
  OrganizationProfile,
  OrganizationRequest,
  OrganizationType,
  OrganizationCategory,
  OrganizationSize,
  DocumentType,
  OrganizationDocument,
} from '../../../../core/models/organization.model';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MapComponent, LocationData, Coordinates } from '../../../../shared/components/map/map.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models/auth.models';
import { Subject, takeUntil, throwError, take, catchError, of, map } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { OrganizationProfileData } from './resolvers/organization-profile.resolver';

declare const L: any; // For Leaflet map

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
    MatSnackBarModule,
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
    MatDialogModule,
    RouterModule,
    FileUploadComponent,
    MapComponent
  ],
  templateUrl: './organization-profile.component.html',
  styles: [`
    :host {
      display: block;
        min-height: 100vh;
      background-color: #f5f5f5;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
      padding: 1rem;
    }

    mat-form-field {
      width: 100%;
    }

    .profile-image-container {
        position: relative;
        margin: 0 auto;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.02);
        
        .overlay {
          opacity: 1;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }

    .overlay {
        position: absolute;
      top: 0;
      left: 0;
        right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 50%;

      mat-icon {
        transition: transform 0.2s ease;
      }

      &:hover mat-icon {
        transform: scale(1.1);
      }
    }

    .focus-areas {
        display: flex;
        flex-wrap: wrap;
      gap: 8px;
      margin: 1rem 0;
    }

    .mat-mdc-chip {
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .mat-mdc-card {
      margin-bottom: 1rem;
        border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }
    }

    // Responsive styles
    @media (max-width: 768px) {
      .container {
        padding: 0.75rem;
      }

      .mat-mdc-card {
        margin-bottom: 0.75rem;
      }

      .focus-areas {
        gap: 6px;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 0.5rem;
      }

      .mat-mdc-card {
        margin-bottom: 0.5rem;
      }

      .focus-areas {
        gap: 4px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.5rem;

        button {
          width: 100%;
        }
      }
    }

    // Loading animation
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .loading-container {
      animation: fadeIn 0.3s ease;
    }

    // Custom scrollbar
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #666;
    }
  `]
})
export class OrganizationProfileComponent implements OnInit, OnDestroy {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  profileForm: FormGroup;
  loading = true;
  organization: OrganizationProfile | null = null;
  newFocusArea = '';
  focusAreas: string[] = [];
  documents: OrganizationDocument[] = [];
  environment = environment;
  uploadProgress = 0;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();
  isProfileComplete = false;

  organizationTypes = Object.values(OrganizationType);
  organizationCategories = Object.values(OrganizationCategory);
  organizationSizes = Object.values(OrganizationSize);

  focusAreaOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Poverty Alleviation',
    'Animal Welfare',
    'Arts & Culture',
    'Community Development',
    'Disaster Relief',
    'Human Rights',
    'Youth Development',
    'Elder Care',
    'Mental Health',
    'Disability Support',
    'Sports & Recreation',
    'Technology & Innovation'
  ];
  selectedFocusArea = '';

  // Add marker property
  private marker: any; // MapboxGL marker

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loading = true;
    
    // Expose component to window for debugging
    (window as any).organizationProfileComponent = this;
    console.log('Debug: Component exposed to window.organizationProfileComponent for console access');
    
    // Get data from resolver
    this.route.data.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        console.log('Organization Profile Component - Full route data:', data);
        const profileData = data['profileData'] as OrganizationProfileData;
        
        console.log('Organization Profile Component - Profile data from resolver:', profileData);
        
        if (profileData) {
          this.organization = profileData.organization;
          this.currentUser = profileData.user;
          
          console.log('Organization Profile Component - Organization object after assignment:', this.organization);
          
          // Set focus areas from organization data
          if (this.organization.focusAreas) {
            this.focusAreas = [...this.organization.focusAreas];
          }
          
          // Set documents from organization data
          if (this.organization.documents && this.organization.documents.length > 0) {
            // Here you would fetch the actual document details if needed
            // For now just map the document IDs to dummy documents
            this.documents = this.organization.documents.map(docId => ({
              id: docId,
              name: `Document ${docId}`,
              type: DocumentType.OTHER,
              url: docId,
              uploadedAt: new Date()
            }));
          }

          // Check if profile is complete
          this.checkProfileCompleteness();
          
          // Initialize form with data
          this.initForm();
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organization profile:', error);
        this.snackBar.open('Failed to load organization profile', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      mission: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      vision: ['', [Validators.maxLength(1000)]],
      website: ['', [
        Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\/\\w-]*)*\\/?$')
      ]],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^(?:\\+212|0)[5-7]\\d{8}$') // Moroccan phone number format
      ]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: [''],
      registrationNumber: ['', [Validators.required, Validators.pattern('^[A-Z0-9-]{5,20}$')]],
      type: ['', [Validators.required]],
      category: ['', [Validators.required]],
      size: ['', [Validators.required]],
      foundedYear: ['', [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      coordinates: [''], // Changed from FormArray to a string control
      socialMediaLinks: this.fb.group({
        facebook: [''],
        twitter: [''],
        instagram: [''],
        linkedin: ['']
      })
    });
  }

  private checkProfileCompleteness(): void {
    if (!this.organization) {
      this.isProfileComplete = false;
      console.log('Component - No organization data, profile is incomplete');
      return;
    }

    // Log the actual profile data we're checking
    console.log('Component - Organization profile data to check:', {
      id: this.organization?.id,
      name: this.organization?.name,
      description: this.organization?.description,
      mission: this.organization?.mission,
      phoneNumber: this.organization?.phoneNumber,
      address: this.organization?.address,
      city: this.organization?.city,
      province: this.organization?.province,
      country: this.organization?.country,
      type: this.organization?.type,
      category: this.organization?.category,
      size: this.organization?.size,
      focusAreasLength: this.organization?.focusAreas?.length,
      registrationNumber: this.organization?.registrationNumber
    });

    // Log field values types for debugging
    console.log('Component - Field types:', {
      id: typeof this.organization?.id,
      name: typeof this.organization?.name,
      description: typeof this.organization?.description,
      mission: typeof this.organization?.mission,
      phoneNumber: typeof this.organization?.phoneNumber,
      address: typeof this.organization?.address,
      city: typeof this.organization?.city,
      province: typeof this.organization?.province,
      country: typeof this.organization?.country,
      type: typeof this.organization?.type,
      category: typeof this.organization?.category,
      size: typeof this.organization?.size,
      focusAreas: Array.isArray(this.organization?.focusAreas) ? 'array' : typeof this.organization?.focusAreas,
      registrationNumber: typeof this.organization?.registrationNumber
    });

    // Debug output of organization object type
    console.log('Component - Organization data type:', Object.prototype.toString.call(this.organization));
    // Safer check for Proxy that won't throw errors
    console.log('Component - Is organization a proxy?', 
      typeof Proxy !== 'undefined' && 
      Proxy !== null && 
      Proxy.constructor === Function && 
      this.organization !== null && 
      typeof this.organization === 'object' &&
      Object.prototype.toString.call(this.organization).includes('Proxy'));
    
    // Use same criteria as the guard for consistency with more robust checks
    this.isProfileComplete = !!(
      this.organization.id && 
      this.organization.name && this.organization.name.trim() !== '' &&
      this.organization.description && this.organization.description.trim() !== '' &&
      this.organization.mission && this.organization.mission.trim() !== '' &&
      this.organization.phoneNumber && this.organization.phoneNumber.trim() !== '' &&
      this.organization.address && this.organization.address.trim() !== '' &&
      this.organization.city && this.organization.city.trim() !== '' &&
      this.organization.province && this.organization.province.trim() !== '' &&
      this.organization.country && this.organization.country.trim() !== '' &&
      this.organization.type && this.organization.type.trim() !== '' &&
      this.organization.category && this.organization.category.trim() !== '' &&
      this.organization.size && this.organization.size.trim() !== '' &&
      this.organization.focusAreas && Array.isArray(this.organization.focusAreas) && this.organization.focusAreas.length > 0 &&
      this.organization.registrationNumber && this.organization.registrationNumber.trim() !== ''
    );

    // Log the status and any missing fields for debugging
    console.log('Component - Profile complete status:', this.isProfileComplete);
    if (!this.isProfileComplete) {
      const missingFields = [];
      if (!this.organization.id) missingFields.push('id');
      if (!this.organization.name || this.organization.name.trim() === '') missingFields.push('name');
      if (!this.organization.description || this.organization.description.trim() === '') missingFields.push('description');
      if (!this.organization.mission || this.organization.mission.trim() === '') missingFields.push('mission');
      if (!this.organization.phoneNumber || this.organization.phoneNumber.trim() === '') missingFields.push('phoneNumber');
      if (!this.organization.address || this.organization.address.trim() === '') missingFields.push('address');
      if (!this.organization.city || this.organization.city.trim() === '') missingFields.push('city');
      if (!this.organization.province || this.organization.province.trim() === '') missingFields.push('province');
      if (!this.organization.country || this.organization.country.trim() === '') missingFields.push('country');
      if (!this.organization.type || this.organization.type.trim() === '') missingFields.push('type');
      if (!this.organization.category || this.organization.category.trim() === '') missingFields.push('category');
      if (!this.organization.size || this.organization.size.trim() === '') missingFields.push('size');
      if (!this.organization.focusAreas || !Array.isArray(this.organization.focusAreas) || this.organization.focusAreas.length === 0) missingFields.push('focusAreas');
      if (!this.organization.registrationNumber || this.organization.registrationNumber.trim() === '') missingFields.push('registrationNumber');
      console.log('Component - Missing fields:', missingFields);
    }
  }

  private initForm(): void {
    if (!this.organization) {
      return;
    }

    this.profileForm = this.fb.group({
      name: [this.organization.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [this.organization.description || '', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      email: [{ value: this.currentUser?.email || '', disabled: true }],
      phoneNumber: [this.organization.phoneNumber || '', [Validators.required, Validators.pattern(/^(?:\+212|0)[5-7]\d{8}$/)]],
      website: [this.organization.website || '', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)]],
      address: [this.organization.address || '', Validators.required],
      city: [this.organization.city || '', Validators.required],
      province: [this.organization.province || '', Validators.required],
      country: [this.organization.country || '', Validators.required],
      postalCode: [this.organization.postalCode || ''],
      coordinates: [this.organization.coordinates ? JSON.stringify(this.organization.coordinates) : ''],
      type: [this.organization.type || '', Validators.required],
      category: [this.organization.category || '', Validators.required],
      size: [this.organization.size || '', Validators.required],
      foundedYear: [this.organization.foundedYear || null, [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      registrationNumber: [this.organization.registrationNumber || '', [Validators.required, Validators.pattern(/^[A-Z0-9-]{5,20}$/)]],
      mission: [this.organization.mission || '', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      vision: [this.organization.vision || '', [Validators.maxLength(1000)]],
      socialMediaLinks: this.fb.group({
        facebook: [this.organization.socialMediaLinks?.facebook || ''],
        twitter: [this.organization.socialMediaLinks?.twitter || ''],
        instagram: [this.organization.socialMediaLinks?.instagram || ''],
        linkedin: [this.organization.socialMediaLinks?.linkedin || '']
      })
    });
  }

  private validateCoordinates(coordinates: number[]): boolean {
    if (!coordinates || coordinates.length !== 2) return false;
    const [longitude, latitude] = coordinates;
    return (
      longitude >= -180 && longitude <= 180 &&
      latitude >= -90 && latitude <= 90
    );
  }

  onSubmit(): void {
    if (!this.organization?.id) {
      this.snackBar.open('Organization ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    // Mark all form controls as touched to trigger validation
    this.markFormGroupTouched(this.profileForm);
    
    if (this.profileForm.invalid) {
      const errors = this.getFormValidationErrors();
      this.snackBar.open(`Please fix the following errors: ${errors.join(', ')}`, 'Close', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.loading = true;
    const formValue = this.profileForm.getRawValue();

    // Parse coordinates if present
    let coordinates: number[] | undefined = undefined;
    if (formValue.coordinates) {
      try {
        const coords = JSON.parse(formValue.coordinates);
        if (Array.isArray(coords) && coords.length === 2 &&
            !isNaN(parseFloat(coords[0])) && !isNaN(parseFloat(coords[1]))) {
          coordinates = [parseFloat(coords[0]), parseFloat(coords[1])];
        }
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Build the request object with actual form data
    const organizationData: OrganizationRequest = {
      name: formValue.name,
      description: formValue.description,
      mission: formValue.mission,
      address: formValue.address,
      city: formValue.city,
      province: formValue.province,
      country: formValue.country,
      type: formValue.type,
      category: formValue.category,
      size: formValue.size,
      phoneNumber: formValue.phoneNumber,
      registrationNumber: formValue.registrationNumber,
      focusAreas: this.focusAreas,
      coordinates: coordinates || [0, 0], // Default coordinates if none provided
      postalCode: formValue.postalCode,
      website: formValue.website,
      vision: formValue.vision,
      foundedYear: formValue.foundedYear
    };
    
    // Add social media links if provided
    const socialMediaLinks: Record<string, string> = {};
    let hasSocialLinks = false;
    
    if (formValue.socialMediaLinks) {
      for (const platform of ['facebook', 'twitter', 'instagram', 'linkedin']) {
        const value = formValue.socialMediaLinks[platform];
        if (value) {
          socialMediaLinks[platform] = value;
          hasSocialLinks = true;
        }
      }
    }
    
    if (hasSocialLinks) {
      organizationData.socialMediaLinks = socialMediaLinks;
    }
    
    // Clean the request data by removing empty values
    Object.keys(organizationData).forEach(key => {
      const value = organizationData[key as keyof OrganizationRequest];
      if (
        value === undefined || 
        value === '' || 
        (Array.isArray(value) && value.length === 0) ||
        (value !== null && typeof value === 'object' && Object.keys(value).length === 0)
      ) {
        delete organizationData[key as keyof OrganizationRequest];
      }
    });
    
    // Check for image information in the current organization object
    // and preserve it in the update request to prevent loss
    if (this.organization.profilePicture) {
      organizationData.profilePicture = this.organization.profilePicture;
    }
    
    if (this.organization.logo) {
      organizationData.logo = this.organization.logo;
    }
    
    console.log('Updating organization with request:', organizationData);

    // Service now always preserves image IDs
    this.organizationService
      .updateOrganization(this.organization.id, organizationData)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.organization = response.data as unknown as OrganizationProfile;
            
            // Check profile completeness after update
            this.checkProfileCompleteness();
            console.log('Profile completeness after update:', this.isProfileComplete);
            
            // If profile is now complete, show specific success message
            if (this.isProfileComplete) {
              this.snackBar.open('Profile completed successfully! You can now access all features.', 'Close', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
            } else {
              this.snackBar.open('Profile updated successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          } else {
            // Handle case where response exists but data is missing
            console.warn('Update succeeded but response data is missing:', response);
            this.snackBar.open('Profile updated successfully. Refreshing data...', 'Close', {
              duration: 3000
            });
            
            // Load fresh data
            this.loadOrganizationProfile();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating organization profile:', error);
          let errorMessage = 'Error updating organization profile';

          if (error.error?.details) {
            const details = Object.values(error.error.details).join(', ');
            errorMessage = `Validation errors: ${details}`;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            // Extract message from JS Error object
            errorMessage = `Error: ${error.message}`;
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }

  // Debug function to quickly fill all required fields with default values
  fillRequiredFields(): void {
    if (!this.organization?.id) {
      this.snackBar.open('Organization ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    const DEFAULT_VALUE = 'Default value';
    const organizationData: OrganizationRequest = {
      name: this.organization.name || 'Organization Name',
      description: this.organization.description || 'This is a default description that meets the minimum length requirements for testing.',
      mission: this.organization.mission || 'This is a default mission statement that meets the minimum character requirements.',
      phoneNumber: this.organization.phoneNumber || '+212612345678',
      address: this.organization.address || 'Test Address',
      city: this.organization.city || 'Test City',
      province: this.organization.province || 'Test Province',
      country: this.organization.country || 'Morocco',
      type: this.organization.type || OrganizationType.NON_PROFIT,
      category: this.organization.category || OrganizationCategory.HEALTH,
      size: this.organization.size || OrganizationSize.SMALL,
      focusAreas: this.organization.focusAreas && this.organization.focusAreas.length > 0 ? 
        this.organization.focusAreas : ['Education'],
      registrationNumber: this.organization.registrationNumber || 'TEST12345',
      coordinates: this.organization.coordinates || [0, 0],
      vision: this.organization.vision || 'Default vision statement',
      postalCode: this.organization.postalCode || '10000'
    };
    
    console.log('Debug - Using default values to complete profile:', organizationData);
    
    this.loading = true;
    this.organizationService
      .updateOrganization(this.organization.id, organizationData)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.organization = response.data as unknown as OrganizationProfile;
            this.checkProfileCompleteness();
            this.initForm();
            this.focusAreas = this.organization ? [...this.organization.focusAreas] : [];
            
            this.snackBar.open('Default values applied successfully. Profile should now be complete.', 'Close', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error applying default values:', error);
          this.snackBar.open('Error applying default values', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }

  private isValidCoordinate(value: any, min: number, max: number): boolean {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  private isValidRegistrationNumber(value: string): boolean {
    return /^[A-Z0-9-]{5,20}$/.test(value);
  }

  private isValidWebsiteUrl(value: string): boolean {
    return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(value);
  }

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control?.errors) {
        if (control.errors['required']) {
          errors.push(`${key} is required`);
        }
        if (control.errors['pattern']) {
          if (key === 'website') {
            errors.push('Invalid website URL format');
          } else if (key === 'registrationNumber') {
            errors.push('Invalid registration number format (must be 5-20 characters, uppercase letters, numbers, and hyphens only)');
          }
        }
        if (control.errors['min'] || control.errors['max']) {
          errors.push(`Invalid ${key} value`);
        }
      }
    });
    return errors;
  }

  private markFormGroupTouched(formGroup: AbstractControl): void {
    if (formGroup instanceof FormGroup) {
      Object.values(formGroup.controls).forEach(control => {
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        } else {
          control.markAsTouched();
        }
        });
    }
  }

  resetForm(): void {
    if (this.organization) {
      this.initForm();
    }
  }

  addFocusArea(): void {
    if (this.selectedFocusArea && !this.focusAreas.includes(this.selectedFocusArea)) {
      this.focusAreas.push(this.selectedFocusArea);
      this.selectedFocusArea = '';
    }
  }

  removeFocusArea(area: string): void {
    this.focusAreas = this.focusAreas.filter((a) => a !== area);
  }

  onLogoSelected(event: any): void {
    if (event && this.organization?.id) {
      this.organizationService
        .uploadLogo(this.organization.id, event)
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              this.organization = response.data as OrganizationProfile;
              this.snackBar.open('Logo uploaded successfully', 'Close', {
                duration: 3000,
              });
            }
          },
          error: (error: any) => {
            console.error('Error uploading logo:', error);
            this.snackBar.open('Error uploading logo', 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const organizationId = this.organization?.id;

    if (!file) {
      console.log('No file selected');
      return;
    }

    if (!organizationId) {
      console.error('Organization ID not found');
      this.snackBar.open('Organization ID is required', 'Close', { duration: 3000 });
      return;
    }

    console.log('Starting file upload process...');
    const formData = new FormData();
    formData.append('file', file);

    // First upload the file to GridFS
    console.log('Uploading to GridFS...');
    this.http.post<{ fileId: string }>(`${environment.apiUrl}/files/upload`, formData)
      .pipe(
        switchMap(response => {
          console.log('File uploaded to GridFS successfully. FileId:', response.fileId);
          // Then associate the file with the organization using the returned fileId
          console.log('Associating document with organization...');
          const body = { documentUrl: response.fileId };
          return this.http.post(
            `${environment.apiUrl}/organizations/${organizationId}/documents`,
            body
          );
        }),
        finalize(() => {
          console.log('Upload process completed');
          input.value = '';
        })
      )
        .subscribe({
        next: () => {
          console.log('Document successfully associated with organization');
            this.snackBar.open('Document uploaded successfully', 'Close', {
              duration: 3000,
            verticalPosition: 'top'
            });
          this.loadOrganizationProfile();
          },
          error: (error) => {
          console.error('Error in document upload process:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.error?.message || error.message,
            error: error.error
          });
          
          let errorMessage = 'Failed to upload document';
          if (error.status === 413) {
            errorMessage = 'File size too large';
          } else if (error.status === 415) {
            errorMessage = 'Unsupported file type';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid request';
          } else if (error.status === 401) {
            errorMessage = 'Unauthorized - Please log in again';
          } else if (error.status === 403) {
            errorMessage = 'Permission denied';
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  getDocumentIconClass(type: string): string {
    return type.toLowerCase() === 'pdf' ? 'text-red-500' : 'text-blue-500';
  }

  getDocumentIcon(type: string): string {
    return type.toLowerCase() === 'pdf' ? 'picture_as_pdf' : 'image';
  }

  downloadDocument(url: string): void {
    window.open(url, '_blank');
  }

  deleteDocument(document: any): void {
    if (!this.organization?.id) {
      this.snackBar.open('Organization ID is required', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Document',
        message: 'Are you sure you want to delete this document?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.organizationService.deleteDocument(this.organization!.id, document.id)
          .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
              this.documents = this.documents.filter(doc => doc.id !== document.id);
              this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting document:', error);
              this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 });
            }
            });
      }
        });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Organization Account',
        message:
          'Are you sure you want to delete your organization account? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.organization?.id) {
        this.deleteOrganization();
      }
    });
  }

  private deleteOrganization(): void {
    this.organizationService
      .deleteOrganization(this.organization!.id)
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Organization account deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.authService.logout().subscribe();
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          this.snackBar.open('Error deleting organization account', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onProfilePictureSelected(file: File): void {
    if (this.organization?.id) {
      const formData = new FormData();
      formData.append('file', file);
      
      this.loading = true;
      this.organizationService
        .uploadProfilePicture(this.organization.id, formData)
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              this.organization = response.data as OrganizationProfile;
              this.loading = false;
              this.snackBar.open(
                'Profile picture updated successfully',
                'Close',
                { duration: 3000 }
              );
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error('Error uploading profile picture:', error);
            this.snackBar.open('Failed to upload profile picture', 'Close', {
              duration: 5000,
            });
          },
        });
    }
  }

  onProfilePictureUploaded(event: { url: string }): void {
    this.loading = false;
    if (this.organization) {
      this.organization.profilePicture = event.url;
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.organization?.id) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size should not exceed 5MB', 'Close', { duration: 3000 });
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Show loading indicator
      this.loading = true;

      // Upload the file
      this.organizationService
        .uploadProfilePicture(this.organization.id, formData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              this.organization = {
                ...this.organization,
                profilePicture: response.data.profilePicture
              } as OrganizationProfile;
              this.snackBar.open('Profile picture updated successfully', 'Close', { duration: 3000 });
            }
          },
          error: (error: any) => {
            console.error('Error uploading profile picture:', error);
            this.snackBar.open(
              error.error?.message || 'Error uploading profile picture',
              'Close',
              { duration: 3000 }
            );
          }
        });
    }
  }

  getProfilePictureUrl(fileId: string | undefined | null): string {
    if (!fileId) {
      return 'assets/images/default-profile.png';
    }
    return `${environment.apiUrl}/files/${fileId}`;
  }

  onImageError(event: Event): void {
    console.warn('Image failed to load:', event);
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-profile.png';
  }

  onEdit(): void {
    this.router.navigate(['/organization/profile/edit']);
  }

  onUploadError(error: string): void {
    this.loading = false;
    this.snackBar.open(error, 'Close', {
              duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onDocumentUploaded(event: { url: string }): void {
    this.loading = false;
    if (this.organization) {
      const newDocument: OrganizationDocument = {
        id: Date.now().toString(),
        name: 'New Document',
        url: event.url,
        type: DocumentType.OTHER,
        uploadedAt: new Date()
      };
      this.documents.push(newDocument);
    }
  }

  getLongitudeControl() {
    return this.profileForm.get('coordinates')?.get([0]);
  }

  getLatitudeControl() {
    return this.profileForm.get('coordinates')?.get([1]);
  }

  // Get the coordinates from the form
  public getCoordinates(): Coordinates | undefined {
    const coordinatesStr = this.profileForm.get('coordinates')?.value;
    if (!coordinatesStr) return undefined;
    
    try {
      const coords = JSON.parse(coordinatesStr);
      if (Array.isArray(coords) && coords.length === 2) {
        return { lng: Number(coords[0]), lat: Number(coords[1]) };
      }
      return undefined;
    } catch (e) {
      console.error('Error parsing coordinates:', e);
      return undefined;
    }
  }

  // Get the latitude coordinate
  private getLatitude(): number | undefined {
    const coords = this.getCoordinates();
    return coords ? coords.lat : undefined;
  }

  // Get the longitude coordinate
  private getLongitude(): number | undefined {
    const coords = this.getCoordinates();
    return coords ? coords.lng : undefined;
  }

  // Update location form values from coordinates
  updateLocationFromCoordinates(latitude: number, longitude: number): void {
    // Update form coordinates
    this.profileForm.patchValue({
      coordinates: JSON.stringify([longitude, latitude])
    });
    
    // Update map marker
    if (this.marker) {
      this.marker.setLngLat([longitude, latitude]);
    }
    
    // Show loading indicator for address lookup
    this.loading = true;
    
    // Get address from coordinates
    this.reverseGeocode(latitude, longitude).subscribe({
      next: (address) => {
        if (address && address.address) {
          const addressData = address.address;
          
          // Extract address components
          const street = [
            addressData.road || addressData.street || '',
            addressData.house_number || ''
          ].filter(Boolean).join(' ').trim();
          
          const city = addressData.city || 
                      addressData.town || 
                      addressData.village || 
                      addressData.suburb || 
                      addressData.hamlet || 
                      '';
                      
          const province = addressData.state || 
                          addressData.county || 
                          addressData.region || 
                          '';
                          
          const country = addressData.country || '';
          const postalCode = addressData.postcode || '';
          
          // Update form with address information
        this.profileForm.patchValue({
            address: street,
            city: city,
            province: province,
            country: country,
            postalCode: postalCode
          });
          
          console.log('Address filled:', { street, city, province, country, postalCode });
        } else {
          console.warn('No address data found for coordinates:', latitude, longitude);
          this.snackBar.open('Address information not available for this location', 'Close', {
            duration: 3000
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error in reverse geocoding:', error);
        this.snackBar.open('Error retrieving address information', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  onLocationSelected(event: LocationData): void {
    const coordinates = event.coordinates;
    if (coordinates && coordinates.length === 2) {
      const [longitude, latitude] = coordinates;
      // Update the form and map
      this.updateLocationFromCoordinates(latitude, longitude);
    }
  }

  // Function to update address fields from a fully typed address
  updateAddressFromFullAddress(fullAddress: string): void {
    if (!fullAddress) return;
    
    this.updateCoordinatesFromAddress(fullAddress);
  }

  // Reverse geocode coordinates to address
  private reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse`;
    const params = new HttpParams()
      .set('format', 'json')
      .set('lat', lat.toString())
      .set('lon', lng.toString())
      .set('addressdetails', '1')
      .set('zoom', '18')  // Higher zoom for more precise results
      .set('accept-language', 'en');  // Force English results

    return this.http.get<any>(url, { 
      params,
      headers: {
        'User-Agent': 'LocalCharityApp'  // Identify the app
      }
    }).pipe(
      take(1),
      catchError(error => {
        console.error('Error in reverse geocoding:', error);
        return of(null);
      })
    );
  }

  updateCoordinatesFromAddress(address: string): void {
    if (!address) return;
    
    // Show loading indicator
    this.loading = true;
    
    this.geocodeAddress(address).subscribe({
      next: (result) => {
        if (result && result.coordinates) {
          const [longitude, latitude] = result.coordinates;
          
          // If we also have address components, update them directly
          if (result.address) {
            const addressData = result.address;
            
            this.profileForm.patchValue({
              coordinates: JSON.stringify([longitude, latitude]),
              address: addressData.street || '',
              city: addressData.city || '',
              province: addressData.state || '',
              country: addressData.country || '',
              postalCode: addressData.postalCode || ''
            });
            
            // Update the map marker
            if (this.marker) {
              this.marker.setLngLat([longitude, latitude]);
            }
          } else {
            // If we only have coordinates, use reverse geocoding to get the address
            this.updateLocationFromCoordinates(latitude, longitude);
          }
        } else {
          this.snackBar.open('Could not find coordinates for this address', 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error converting address to coordinates:', error);
        this.snackBar.open('Error geocoding address', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  private geocodeAddress(address: string) {
    const url = `https://nominatim.openstreetmap.org/search`;
    const params = new HttpParams()
      .set('format', 'json')
      .set('q', address)
      .set('addressdetails', '1')
      .set('limit', '1');

    return this.http.get<any[]>(url, { 
      params,
      headers: {
        'User-Agent': 'LocalCharityApp'  // Identify the app
      }
    }).pipe(
      take(1),
      map(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const { lat, lon, address: addressDetails } = result;
          
          // Create a structured result with both coordinates and address components
          return {
            coordinates: [parseFloat(lon), parseFloat(lat)] as [number, number],
            address: addressDetails ? {
              street: addressDetails.road || addressDetails.street || '',
              city: addressDetails.city || addressDetails.town || addressDetails.village || '',
              state: addressDetails.state || addressDetails.county || '',
              country: addressDetails.country || '',
              postalCode: addressDetails.postcode || ''
            } : null
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Error in geocoding:', error);
        return of(null);
      })
    );
  }

  loadOrganizationProfile(): void {
    if (!this.organization?.id) return;
    
    this.loading = true;
    this.organizationService.getOrganization(this.organization.id)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            // The service automatically preserves images
            this.organization = response.data as OrganizationProfile;
            
            // Reinitialize the form with updated data
            this.initForm();
            
            // Update focus areas
            if (this.organization && this.organization.focusAreas) {
              this.focusAreas = [...this.organization.focusAreas];
            }
            
            // Update documents
            if (this.organization && this.organization.documents && this.organization.documents.length > 0) {
              this.documents = this.organization.documents.map(docId => ({
                id: docId,
                name: `Document ${docId}`,
                type: DocumentType.OTHER,
                url: docId,
                uploadedAt: new Date()
              }));
            }
            
            // Check if profile is complete
            this.checkProfileCompleteness();
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading organization profile:', error);
          this.snackBar.open('Failed to load organization profile', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }
}
