import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationService } from '../../../../core/services/organization.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrganizationProfile, OrganizationRequest, SocialMediaLinks } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-header>
            <mat-card-title>Organization Profile</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline">
                  <mat-label>Organization Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter organization name">
                  @if (profileForm.get('name')?.hasError('required') && profileForm.get('name')?.touched) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Registration Number</mat-label>
                  <input matInput formControlName="registrationNumber" placeholder="Enter registration number">
                  @if (profileForm.get('registrationNumber')?.hasError('required') && profileForm.get('registrationNumber')?.touched) {
                    <mat-error>Registration number is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="4" placeholder="Enter organization description"></textarea>
                  @if (profileForm.get('description')?.hasError('required') && profileForm.get('description')?.touched) {
                    <mat-error>Description is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Mission</mat-label>
                  <textarea matInput formControlName="mission" rows="4" placeholder="Enter organization mission"></textarea>
                  @if (profileForm.get('mission')?.hasError('required') && profileForm.get('mission')?.touched) {
                    <mat-error>Mission is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Vision</mat-label>
                  <textarea matInput formControlName="vision" rows="4" placeholder="Enter organization vision"></textarea>
                </mat-form-field>
              </div>

              <!-- Contact Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <mat-form-field appearance="outline">
                  <mat-label>Website</mat-label>
                  <input matInput formControlName="website" placeholder="Enter website URL">
                  @if (profileForm.get('website')?.hasError('pattern')) {
                    <mat-error>Please enter a valid URL</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
                  @if (profileForm.get('phoneNumber')?.hasError('pattern')) {
                    <mat-error>Please enter a valid phone number</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Address</mat-label>
                  <input matInput formControlName="address" placeholder="Enter address">
                  @if (profileForm.get('address')?.hasError('required') && profileForm.get('address')?.touched) {
                    <mat-error>Address is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" placeholder="Enter city">
                  @if (profileForm.get('city')?.hasError('required') && profileForm.get('city')?.touched) {
                    <mat-error>City is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Country</mat-label>
                  <input matInput formControlName="country" placeholder="Enter country">
                  @if (profileForm.get('country')?.hasError('required') && profileForm.get('country')?.touched) {
                    <mat-error>Country is required</mat-error>
                  }
                </mat-form-field>
              </div>

              <!-- Social Media Links -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" formGroupName="socialMediaLinks">
                <mat-form-field appearance="outline">
                  <mat-label>Facebook</mat-label>
                  <input matInput formControlName="facebook" placeholder="Enter Facebook URL">
                  @if (profileForm.get('socialMediaLinks.facebook')?.hasError('pattern')) {
                    <mat-error>Please enter a valid Facebook URL</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Twitter</mat-label>
                  <input matInput formControlName="twitter" placeholder="Enter Twitter URL">
                  @if (profileForm.get('socialMediaLinks.twitter')?.hasError('pattern')) {
                    <mat-error>Please enter a valid Twitter URL</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>LinkedIn</mat-label>
                  <input matInput formControlName="linkedin" placeholder="Enter LinkedIn URL">
                  @if (profileForm.get('socialMediaLinks.linkedin')?.hasError('pattern')) {
                    <mat-error>Please enter a valid LinkedIn URL</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Instagram</mat-label>
                  <input matInput formControlName="instagram" placeholder="Enter Instagram URL">
                  @if (profileForm.get('socialMediaLinks.instagram')?.hasError('pattern')) {
                    <mat-error>Please enter a valid Instagram URL</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="flex justify-end mt-4">
                <button mat-button type="button" (click)="resetForm()">Reset</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || loading">
                  Save Changes
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
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
  `]
})
export class OrganizationProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  organization?: OrganizationProfile;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadOrganizationProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      mission: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      vision: ['', [Validators.maxLength(1000)]],
      website: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
      phoneNumber: ['', [Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      registrationNumber: ['', [Validators.required, Validators.pattern('^[A-Z0-9-]{5,20}$')]],
      taxId: ['', [Validators.pattern('^[A-Z0-9-]{5,20}$')]],
      socialMediaLinks: this.fb.group({
        facebook: ['', [Validators.pattern('(https?://)?(www\\.)?facebook\\.com/[a-zA-Z0-9.\\-_]+/?')]],
        twitter: ['', [Validators.pattern('(https?://)?(www\\.)?twitter\\.com/[a-zA-Z0-9_]+/?')]],
        linkedin: ['', [Validators.pattern('(https?://)?(www\\.)?linkedin\\.com/(company/[a-zA-Z0-9\\-]+|in/[a-zA-Z0-9\\-]+)/?')]],
        instagram: ['', [Validators.pattern('(https?://)?(www\\.)?instagram\\.com/[a-zA-Z0-9_.]+/?')]]
      })
    });
  }

  private loadOrganizationProfile(): void {
    this.loading = true;
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.snackBar.open('Error loading profile: User ID not found', 'Close', { duration: 3000 });
      this.loading = false;
      return;
    }

    this.organizationService.getOrganization(userId).subscribe({
      next: (org) => {
        this.organization = org;
        this.updateForm(org);
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
      taxId: organization.taxId,
      socialMediaLinks: organization.socialMediaLinks || {}
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    const formValue = this.profileForm.value;
    const request: OrganizationRequest = {
      ...formValue,
      focusAreas: this.organization?.focusAreas || new Set(),
      acceptingVolunteers: this.organization?.acceptingVolunteers ?? true
    };

    if (this.organization?.id) {
      this.organizationService.updateOrganization(this.organization.id, request).subscribe({
        next: (updated) => {
          this.organization = updated;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating organization profile:', error);
          this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    if (this.organization) {
      this.updateForm(this.organization);
    } else {
      this.profileForm.reset();
    }
  }
} 