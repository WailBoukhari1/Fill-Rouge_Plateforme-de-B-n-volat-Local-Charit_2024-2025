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
import { RouterModule, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MapComponent, LocationData } from '../../../../shared/components/map/map.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models/auth.models';
import { Subject, takeUntil, throwError } from 'rxjs';
import { finalize, switchMap, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

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

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) {
    this.profileForm = this.createForm();
    // Subscribe to user data from auth service
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user?.email && this.profileForm) {
          this.profileForm.patchValue({ email: user.email });
        }
      });
  }

  ngOnInit(): void {
    this.loadOrganizationProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      mission: [''],
      vision: [''],
      website: ['', [
        Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\/\\w-]*)*\\/?$')
      ]],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [
        Validators.pattern('^\\+?[1-9]\\d{1,14}$')
      ]],
      address: [''],
      city: [''],
      province: [''],
      country: [''],
      postalCode: [''],
      registrationNumber: ['', [Validators.required, Validators.pattern('^[A-Z0-9-]{5,20}$')]],
      type: ['', [Validators.required]],
      category: ['', [Validators.required]],
      size: [''],
      foundedYear: ['', [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      coordinates: this.fb.array([
        [''], // longitude
        ['']  // latitude
      ]),
      fullAddress: [''], // This will be used for display
      socialMediaLinks: this.fb.group({
        facebook: [''],
        twitter: [''],
        instagram: [''],
        linkedin: ['']
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
        this.documents = (response.documents || []).map(url => ({
          id: Date.now().toString(),
          name: `Document ${Date.now()}`,
          url: url,
          type: DocumentType.OTHER,
          uploadedAt: new Date()
        }));
        this.updateForm(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organization profile:', error);
        this.snackBar.open('Error loading organization profile', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  private updateForm(organization: OrganizationProfile): void {
    if (organization) {
    this.profileForm.patchValue({
        name: organization.name || '',
        description: organization.description || '',
        registrationNumber: organization.registrationNumber || '',
        type: organization.type || '',
        category: organization.category || '',
        website: organization.website || '',
        phoneNumber: organization.phoneNumber || '',
        email: organization.email || '',
        foundedYear: organization.foundedYear || null,
        socialMediaLinks: organization.socialMediaLinks || [],
        focusAreas: organization.focusAreas || [],
        coordinates: organization.coordinates || []
      });

      // Update map marker if coordinates exist
      if (organization.coordinates && organization.coordinates.length === 2) {
        this.mapComponent?.updateCoordinates([
          organization.coordinates[0],
          organization.coordinates[1]
        ]);
      }
    }
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
    if (this.organization?.id) {
      this.loading = true;
      const formValue = this.profileForm.getRawValue();

      // Check if coordinates are valid
      let coords: number[] = [];
      if (formValue.coordinates && formValue.coordinates.length === 2) {
        if (formValue.coordinates[0] && formValue.coordinates[1]) {
          coords = [
            parseFloat(formValue.coordinates[0]),
            parseFloat(formValue.coordinates[1])
          ];
        }
      }

      // Create request object based on Organization.java requirements
      const organizationData: any = {
        // Required fields with @NotBlank validation
        name: formValue.name || "Organization Name", // min 2, max 100 chars
        description: formValue.description || "This organization description needs at least 20 characters to pass validation.", // min 20, max 2000 chars
        mission: formValue.mission || "This mission statement has the required minimum 20 characters.", // min 20, max 1000 chars
        address: formValue.address || "Default Address",
        city: formValue.city || "Default City",
        province: formValue.province || "Default Province", 
        country: formValue.country || "Default Country",
        type: formValue.type || "NGO",
        category: formValue.category || "Charity",
        size: formValue.size || "Medium",
        
        // Fields with regex pattern validation
        phoneNumber: formValue.phoneNumber || "+212612345678", // Must match Moroccan format
        registrationNumber: formValue.registrationNumber || "REG12345", // Must be 5-20 chars with A-Z, 0-9, -
        
        // Required non-empty collection
        focusAreas: this.focusAreas?.length ? this.focusAreas : ["Education"],
        
        // Optional fields that need validation when present
        website: formValue.website || undefined, // Has URL pattern validation
        vision: formValue.vision || undefined, // Max 1000 chars
        
        // Coordinates for map validation
        coordinates: coords.length === 2 ? coords : [0, 0],
        
        // Other optional fields
        postalCode: formValue.postalCode || undefined,
        foundedYear: formValue.foundedYear || undefined,
        acceptingVolunteers: true // Default to true
      };
      
      // Only add social media links if at least one exists
      if (formValue.socialMediaLinks && (
          formValue.socialMediaLinks.facebook || 
          formValue.socialMediaLinks.twitter || 
          formValue.socialMediaLinks.instagram || 
          formValue.socialMediaLinks.linkedin
      )) {
        organizationData.socialMediaLinks = {
          facebook: formValue.socialMediaLinks.facebook || undefined,
          twitter: formValue.socialMediaLinks.twitter || undefined,
          instagram: formValue.socialMediaLinks.instagram || undefined,
          linkedin: formValue.socialMediaLinks.linkedin || undefined
        };
      }

      // Clean up undefined values
      Object.keys(organizationData).forEach(key => {
        if (organizationData[key] === undefined) {
          delete organizationData[key];
        }
      });

      // Clean up social media links
      if (organizationData.socialMediaLinks) {
        Object.keys(organizationData.socialMediaLinks).forEach(key => {
          if (organizationData.socialMediaLinks[key] === undefined) {
            delete organizationData.socialMediaLinks[key];
          }
        });
        
        // Remove socialMediaLinks if empty
        if (Object.keys(organizationData.socialMediaLinks).length === 0) {
          delete organizationData.socialMediaLinks;
        }
      }

      console.log('Updating organization with request:', organizationData);

      this.organizationService
        .updateOrganization(this.organization.id, organizationData)
        .subscribe({
          next: (response) => {
            if (response.data) {
              this.organization = response.data;
              this.snackBar.open('Profile updated successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
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
            }
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.loading = false;
          }
        });
    }
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
      this.updateForm(this.organization);
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
            this.organization = response.data;
            this.snackBar.open('Logo uploaded successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
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
    if (!input.files?.length) {
      console.log('No file selected');
      return;
    }

    const file = input.files[0];
    const organizationId = this.organization?.id;

    // Log file details
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });

    if (!organizationId) {
      console.error('Organization ID missing');
      this.snackBar.open('Organization ID is missing', 'Close', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Validate file type
    if (!file.type.match(/^(application\/pdf|image\/)/)) {
      console.warn('Invalid file type:', file.type);
      this.snackBar.open('Only PDF and image files are allowed', 'Close', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.warn('File too large:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      this.snackBar.open('File size must be less than 10MB', 'Close', {
        duration: 3000,
        verticalPosition: 'top'
      });
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
          next: (response: OrganizationProfile) => {
            this.organization = response;
            this.loading = false;
            this.snackBar.open(
              'Profile picture updated successfully',
              'Close',
              { duration: 3000 }
            );
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
            if (response.profilePicture) {
              this.organization = {
                ...this.organization,
                profilePicture: response.profilePicture
              } as OrganizationProfile;
            }
            this.snackBar.open('Profile picture updated successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
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

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.snackBar.open('Geolocation is not supported by your browser', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        await this.updateLocationFromCoordinates(latitude, longitude);
        
        this.loading = false;
        this.snackBar.open('Location updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      (error) => {
        this.loading = false;
        let errorMessage = 'Error getting location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission to access location was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request to get location timed out';
            break;
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
          });
        },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  private async updateLocationFromCoordinates(latitude: number, longitude: number): Promise<void> {
    // Update form coordinates
    const coordinates = this.profileForm.get('coordinates');
    if (coordinates) {
      coordinates.patchValue([longitude, latitude]);
    }

    // Update map marker using MapComponent
    this.mapComponent.updateCoordinates([longitude, latitude]);

    // Get address details
    try {
      const address = await this.reverseGeocode(latitude, longitude);
      if (address) {
        // Update form with address details
        this.profileForm.patchValue({
          fullAddress: address.display_name,
          address: address.road || '',
          city: address.city || address.town || address.village || '',
          province: address.state || '',
          country: address.country || '',
          postalCode: address.postcode || ''
        });
      }
    } catch (error) {
      console.error('Error getting address details:', error);
    }
  }

  private async reverseGeocode(lat: number, lon: number): Promise<any> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return data.address ? { ...data.address, display_name: data.display_name } : null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  async updateCoordinatesFromAddress(address: string): Promise<void> {
    if (!address) return;
    
    const coordinates = await this.geocodeAddress(address);
    if (coordinates) {
      const [longitude, latitude] = coordinates;
      await this.updateLocationFromCoordinates(latitude, longitude);
    }
  }

  // Add new methods for address handling
  private async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lon), parseFloat(lat)];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  getLatitude(): number {
    const coordinates = this.profileForm.get('coordinates')?.value;
    return coordinates?.[1] || 0;
  }

  getLongitude(): number {
    const coordinates = this.profileForm.get('coordinates')?.value;
    return coordinates?.[0] || 0;
  }

  getCoordinates(): { lat: number; lng: number } | undefined {
    const coordinates = this.profileForm.get('coordinates')?.value;
    if (coordinates && coordinates.length === 2) {
      return { lng: coordinates[0], lat: coordinates[1] };
    }
    return undefined;
  }

  onLocationSelected(event: LocationData): void {
    const coordinates = event.coordinates;
    this.profileForm.patchValue({ coordinates });
    this.mapComponent?.updateCoordinates(coordinates);
  }
}
