import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { 
  OrganizationProfile, 
  OrganizationRequest, 
  OrganizationType, 
  OrganizationCategory, 
  OrganizationSize 
} from '../../../../../core/models/organization.model';
import { MapComponent } from '../../../../../shared/components/map/map.component';

interface Region {
  name: string;
  cities: string[];
}

@Component({
  selector: 'app-organization-profile-edit',
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
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MapComponent
  ],
  template: `
    <div class="container mx-auto p-2 sm:p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (organization) {
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4 sm:space-y-6">
          <!-- Header Section -->
          <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Edit Organization Profile</h1>
            <p class="text-sm sm:text-base text-gray-600">Update your organization's information below</p>
          </div>

          <!-- Basic Information -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Organization Name</mat-label>
                  <input matInput formControlName="name" required>
                  <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                    Name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="type" required>
                    @for (type of organizationTypes; track type) {
                      <mat-option [value]="type">{{type}}</mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="profileForm.get('type')?.hasError('required')">
                    Type is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category" required>
                    @for (category of organizationCategories; track category) {
                      <mat-option [value]="category">{{category}}</mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="profileForm.get('category')?.hasError('required')">
                    Category is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Size</mat-label>
                  <mat-select formControlName="size" required>
                    @for (size of organizationSizes; track size) {
                      <mat-option [value]="size">{{size}}</mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="profileForm.get('size')?.hasError('required')">
                    Size is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="sm:col-span-2">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3" required></textarea>
                  <mat-error *ngIf="profileForm.get('description')?.hasError('required')">
                    Description is required
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Location Information -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Location Information</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Address</mat-label>
                  <input matInput formControlName="address" required>
                  <mat-error *ngIf="profileForm.get('address')?.hasError('required')">
                    Address is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Country</mat-label>
                  <input matInput [value]="'Morocco'" readonly>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Province</mat-label>
                  <mat-select formControlName="province" required (selectionChange)="onProvinceChange()">
                    <mat-option value="">Select Province</mat-option>
                    @for (region of regions; track region.name) {
                      <mat-option [value]="region.name">{{region.name}}</mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="profileForm.get('province')?.hasError('required')">
                    Province is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>City</mat-label>
                  <mat-select formControlName="city" required [disabled]="!profileForm.get('province')?.value">
                    <mat-option value="">Select City</mat-option>
                    @for (city of availableCities; track city) {
                      <mat-option [value]="city">{{city}}</mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="profileForm.get('city')?.hasError('required')">
                    City is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Postal Code</mat-label>
                  <input matInput formControlName="postalCode" required>
                  <mat-error *ngIf="profileForm.get('postalCode')?.hasError('required')">
                    Postal code is required
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Location Map -->
              <div class="mt-4 sm:mt-6">
                <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-4">Select Location on Map</h3>
                <div class="h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-md">
                  <app-map
                    [coordinates]="profileForm.get('coordinates')?.value || [0, 0]"
                    (locationSelected)="onLocationSelected($event)">
                  </app-map>
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
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber" required>
                  <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                    Phone number is required
                  </mat-error>
                  <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('pattern')">
                    Please enter a valid phone number
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Website</mat-label>
                  <input matInput formControlName="website">
                  <mat-error *ngIf="profileForm.get('website')?.hasError('pattern')">
                    Please enter a valid URL
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Registration Number</mat-label>
                  <input matInput formControlName="registrationNumber">
                  <mat-error *ngIf="profileForm.get('registrationNumber')?.hasError('pattern')">
                    Please enter a valid registration number
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Mission & Vision -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Mission & Vision</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="space-y-4 sm:space-y-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Mission</mat-label>
                  <textarea matInput formControlName="mission" rows="3" required></textarea>
                  <mat-error *ngIf="profileForm.get('mission')?.hasError('required')">
                    Mission is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Vision</mat-label>
                  <textarea matInput formControlName="vision" rows="3" required></textarea>
                  <mat-error *ngIf="profileForm.get('vision')?.hasError('required')">
                    Vision is required
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Focus Areas -->
          <mat-card class="shadow-md">
            <mat-card-header class="bg-primary-50 p-3 sm:p-4 rounded-t-lg">
              <mat-card-title class="text-lg sm:text-xl font-semibold text-primary-700">Focus Areas</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4 sm:p-6">
              <div class="flex flex-wrap gap-2 mb-4">
                @for (area of focusAreas.controls; track area) {
                  <mat-chip (removed)="removeFocusArea($index)" class="bg-primary-100 text-primary-700">
                    {{area.value}}
                    <button matChipRemove>
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip>
                }
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Add Focus Area</mat-label>
                  <input matInput [formControl]="newFocusAreaControl" (keyup.enter)="addFocusArea()">
                </mat-form-field>
                <button mat-raised-button color="primary" type="button" (click)="addFocusArea()" class="shadow-md w-full sm:w-auto">
                  Add
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Submit Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <button mat-button type="button" (click)="resetForm()" class="shadow-md w-full sm:w-auto">
              Reset
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!profileForm.valid" class="shadow-md w-full sm:w-auto">
              Save Changes
            </button>
          </div>
        </form>
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
    :host ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 8px;
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
    }
  `]
})
export class OrganizationProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  organization: OrganizationProfile | null = null;
  newFocusAreaControl = this.fb.control('');
  focusAreas: FormArray;

  organizationTypes = Object.values(OrganizationType);
  organizationCategories = Object.values(OrganizationCategory);
  organizationSizes = Object.values(OrganizationSize);

  // Moroccan regions and cities data
  regions: Region[] = [
    {
      name: 'Casablanca-Settat',
      cities: ['Casablanca', 'Mohammedia', 'Settat', 'Benslimane', 'El Jadida', 'Nouaceur']
    },
    {
      name: 'Rabat-Salé-Kénitra',
      cities: ['Rabat', 'Salé', 'Kénitra', 'Skhirate', 'Témara', 'Sidi Kacem']
    },
    {
      name: 'Fès-Meknès',
      cities: ['Fès', 'Meknès', 'Sefrou', 'Moulay Yacoub', 'El Hajeb', 'Ifrane']
    },
    {
      name: 'Marrakech-Safi',
      cities: ['Marrakech', 'Safi', 'Essaouira', 'El Kelâa des Sraghna', 'Chichaoua', 'Youssoufia']
    },
    {
      name: 'Tanger-Tétouan-Al Hoceïma',
      cities: ['Tanger', 'Tétouan', 'Al Hoceïma', 'Larache', 'Chefchaouen', 'Ouezzane']
    },
    {
      name: 'Souss-Massa',
      cities: ['Agadir', 'Inezgane', 'Taroudant', 'Oulad Teima', 'Tiznit', 'Chtouka Ait Baha']
    },
    {
      name: 'Béni Mellal-Khénifra',
      cities: ['Béni Mellal', 'Khénifra', 'Fquih Ben Salah', 'Azilal', 'Khouribga', 'Settat']
    },
    {
      name: 'Oriental',
      cities: ['Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Figuig']
    },
    {
      name: 'Drâa-Tafilalet',
      cities: ['Errachidia', 'Ouarzazate', 'Zagora', 'Tinghir', 'Midelt', 'Erfoud']
    },
    {
      name: 'Laâyoune-Sakia El Hamra',
      cities: ['Laâyoune', 'El Marsa', 'Tarfaya', 'Boujdour', 'Sakia El Hamra', 'Foum El Oued']
    }
  ];

  availableCities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.focusAreas = this.fb.array([]);
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      category: ['', Validators.required],
      size: ['', Validators.required],
      description: ['', Validators.required],
      address: ['', Validators.required],
      country: ['Morocco'],
      province: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      coordinates: [[0, 0]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      website: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
      registrationNumber: ['', [Validators.pattern('^[A-Z0-9-]{5,20}$')]],
      mission: ['', Validators.required],
      vision: ['', Validators.required],
      focusAreas: this.focusAreas
    });
  }

  ngOnInit(): void {
    this.loadOrganizationProfile();
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
        this.focusAreas.clear();
        response.focusAreas?.forEach(area => this.focusAreas.push(this.fb.control(area)));
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
      type: organization.type || '',
      category: organization.category || '',
      size: organization.size || '',
      description: organization.description,
      address: organization.address,
      country: 'Morocco',
      province: organization.province || '',
      city: organization.city || '',
      postalCode: organization.postalCode || '',
      coordinates: organization.coordinates || [0, 0],
      phoneNumber: organization.phoneNumber,
      website: organization.website,
      registrationNumber: organization.registrationNumber,
      mission: organization.mission,
      vision: organization.vision
    });

    // Update available cities based on the organization's province
    if (organization.province) {
      const province = this.regions.find(r => r.name === organization.province);
      if (province) {
        this.availableCities = province.cities;
      }
    }
  }

  onLocationSelected(location: any): void {
    // Update form with location details
    this.profileForm.patchValue({
      coordinates: location.coordinates,
      address: location.address,
      city: location.city,
      province: location.region
    });

    // If we have a region (province), update available cities
    if (location.region) {
      const province = this.regions.find(r => r.name === location.region);
      if (province) {
        this.availableCities = province.cities;
        // If the city from the map is not in the available cities, clear it
        if (!province.cities.includes(location.city)) {
          this.profileForm.patchValue({ city: '' });
        }
      }
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.organization?.id) {
      this.loading = true;
      const formData = this.profileForm.value;
      
      const request: OrganizationRequest = {
        ...formData,
        logo: this.organization?.logo,
        focusAreas: this.focusAreas.value
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
      this.focusAreas.clear();
      this.updateForm(this.organization);
    }
  }

  addFocusArea(): void {
    const value = this.newFocusAreaControl.value?.trim();
    if (value && !this.focusAreas.value.includes(value)) {
      this.focusAreas.push(this.fb.control(value));
      this.newFocusAreaControl.reset();
    }
  }

  removeFocusArea(index: number): void {
    this.focusAreas.removeAt(index);
  }

  onProvinceChange(): void {
    const selectedProvince = this.profileForm.get('province')?.value;
    if (selectedProvince) {
      const province = this.regions.find(r => r.name === selectedProvince);
      if (province) {
        this.availableCities = province.cities;
        // Reset city selection when province changes
        this.profileForm.patchValue({ city: '' });
      } else {
        this.availableCities = [];
      }
    } else {
      this.availableCities = [];
    }
  }
}