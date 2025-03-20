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
import { MatStepperModule } from '@angular/material/stepper';
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
    MatStepperModule,
    MapComponent
  ],
  template: `
    <div class="container mx-auto p-2 sm:p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (organization) {
        <div class="space-y-4 sm:space-y-6">
          <!-- Header Section -->
          <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Edit Organization Profile</h1>
            <p class="text-sm sm:text-base text-gray-600">Update your organization's information step by step</p>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <mat-stepper linear #stepper>
              <!-- Step 1: Basic Information -->
              <mat-step [stepControl]="basicInfoForm" label="Basic Information">
                <div class="space-y-4">
                  <mat-card class="shadow-md">
                    <mat-card-content class="p-4 sm:p-6">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <mat-form-field class="w-full">
                          <mat-label>Organization Name</mat-label>
                          <input matInput formControlName="name" required>
                          <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                            Name is required
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field class="w-full">
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

                        <mat-form-field class="w-full">
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

                        <mat-form-field class="w-full">
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

                        <mat-form-field class="sm:col-span-2">
                          <mat-label>Description</mat-label>
                          <textarea matInput formControlName="description" rows="3" required></textarea>
                          <mat-error *ngIf="profileForm.get('description')?.hasError('required')">
                            Description is required
                          </mat-error>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <div class="flex justify-end">
                    <button mat-raised-button color="primary" type="button" matStepperNext>Next</button>
                  </div>
                </div>
              </mat-step>

              <!-- Step 2: Location Information -->
              <mat-step [stepControl]="locationForm" label="Location">
                <div class="space-y-4">
                  <mat-card class="shadow-md">
                    <mat-card-content class="p-4 sm:p-6">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <mat-form-field class="w-full">
                          <mat-label>Address</mat-label>
                          <input matInput formControlName="address" required>
                          <mat-error *ngIf="profileForm.get('address')?.hasError('required')">
                            Address is required
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field class="w-full">
                          <mat-label>Country</mat-label>
                          <input matInput [value]="'Morocco'" readonly>
                        </mat-form-field>

                        <mat-form-field class="w-full">
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

                        <mat-form-field class="w-full">
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

                        <mat-form-field class="w-full">
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

                  <div class="flex justify-between">
                    <button mat-button type="button" matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" type="button" matStepperNext>Next</button>
                  </div>
                </div>
              </mat-step>

              <!-- Step 3: Contact Information -->
              <mat-step [stepControl]="contactForm" label="Contact">
                <div class="space-y-4">
                  <mat-card class="shadow-md">
                    <mat-card-content class="p-4 sm:p-6">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <mat-form-field class="w-full">
                          <mat-label>Phone Number</mat-label>
                          <input matInput formControlName="phoneNumber" required>
                          <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                            Phone number is required
                          </mat-error>
                          <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('pattern')">
                            Please enter a valid phone number
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field class="w-full">
                          <mat-label>Website</mat-label>
                          <input matInput formControlName="website">
                          <mat-error *ngIf="profileForm.get('website')?.hasError('pattern')">
                            Please enter a valid URL
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field class="w-full">
                          <mat-label>Registration Number</mat-label>
                          <input matInput formControlName="registrationNumber">
                          <mat-error *ngIf="profileForm.get('registrationNumber')?.hasError('pattern')">
                            Please enter a valid registration number
                          </mat-error>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <div class="flex justify-between">
                    <button mat-button type="button" matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" type="button" matStepperNext>Next</button>
                  </div>
                </div>
              </mat-step>

              <!-- Step 4: Mission & Vision -->
              <mat-step [stepControl]="missionVisionForm" label="Mission & Vision">
                <div class="space-y-4">
                  <mat-card class="shadow-md">
                    <mat-card-content class="p-4 sm:p-6">
                      <div class="space-y-4 sm:space-y-6">
                        <mat-form-field class="w-full">
                          <mat-label>Mission</mat-label>
                          <textarea matInput formControlName="mission" rows="3" required></textarea>
                          <mat-error *ngIf="profileForm.get('mission')?.hasError('required')">
                            Mission is required
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field class="w-full">
                          <mat-label>Vision</mat-label>
                          <textarea matInput formControlName="vision" rows="3" required></textarea>
                          <mat-error *ngIf="profileForm.get('vision')?.hasError('required')">
                            Vision is required
                          </mat-error>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <div class="flex justify-between">
                    <button mat-button type="button" matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" type="button" matStepperNext>Next</button>
                  </div>
                </div>
              </mat-step>

              <!-- Step 5: Focus Areas -->
              <mat-step [stepControl]="focusAreasForm" label="Focus Areas">
                <div class="space-y-4">
                  <mat-card class="shadow-md">
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
                        <mat-form-field class="w-full">
                          <mat-label>Select Focus Areas</mat-label>
                          <mat-select [formControl]="newFocusAreaControl" (selectionChange)="addFocusArea()">
                            <mat-option value="">Select a focus area</mat-option>
                            @for (option of focusAreaOptions; track option) {
                              <mat-option [value]="option" [disabled]="focusAreas.value.includes(option)">
                                {{option}}
                              </mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <div class="flex justify-between">
                    <button mat-button type="button" matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" type="button" matStepperNext>Next</button>
                  </div>
                </div>
              </mat-step>

              <!-- Step 6: Review & Submit -->
              <mat-step label="Review & Submit">
                <div class="space-y-4">
                  <mat-card class="shadow-md">
                    <mat-card-content class="p-4 sm:p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Review Your Information</h3>
                      <div class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 class="font-medium text-gray-700">Basic Information</h4>
                            <p class="text-sm text-gray-600">Name: {{profileForm.get('name')?.value}}</p>
                            <p class="text-sm text-gray-600">Type: {{profileForm.get('type')?.value}}</p>
                            <p class="text-sm text-gray-600">Category: {{profileForm.get('category')?.value}}</p>
                            <p class="text-sm text-gray-600">Size: {{profileForm.get('size')?.value}}</p>
                          </div>
                          <div>
                            <h4 class="font-medium text-gray-700">Location</h4>
                            <p class="text-sm text-gray-600">{{profileForm.get('address')?.value}}</p>
                            <p class="text-sm text-gray-600">{{profileForm.get('city')?.value}}, {{profileForm.get('province')?.value}}</p>
                            <p class="text-sm text-gray-600">{{profileForm.get('postalCode')?.value}}</p>
                          </div>
                          <div>
                            <h4 class="font-medium text-gray-700">Contact</h4>
                            <p class="text-sm text-gray-600">Phone: {{profileForm.get('phoneNumber')?.value}}</p>
                            <p class="text-sm text-gray-600">Website: {{profileForm.get('website')?.value || 'Not provided'}}</p>
                            <p class="text-sm text-gray-600">Registration: {{profileForm.get('registrationNumber')?.value || 'Not provided'}}</p>
                          </div>
                          <div>
                            <h4 class="font-medium text-gray-700">Focus Areas</h4>
                            <div class="flex flex-wrap gap-1">
                              @for (area of focusAreas.controls; track area) {
                                <span class="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                  {{area.value}}
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <div class="flex justify-between">
                    <button mat-button type="button" matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="!profileForm.valid">
                      Save Changes
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </form>
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
    :host ::ng-deep .mat-horizontal-stepper-header {
      pointer-events: none !important;
    }
    :host ::ng-deep .mat-step-header .mat-step-icon-selected {
      background-color: #1976d2;
    }
    :host ::ng-deep .mat-step-header .mat-step-icon-state-done {
      background-color: #4caf50;
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
  basicInfoForm: FormGroup;
  locationForm: FormGroup;
  contactForm: FormGroup;
  missionVisionForm: FormGroup;
  focusAreasForm: FormGroup;
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

  // Add this property to the class
  focusAreaOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Poverty Alleviation',
    'Human Rights',
    'Animal Welfare',
    'Arts & Culture',
    'Community Development',
    'Disaster Relief',
    'Food Security',
    'Gender Equality',
    'Mental Health',
    'Refugee Support',
    'Social Justice',
    'Youth Development'
  ];

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.focusAreas = this.fb.array([]);
    this.newFocusAreaControl = this.fb.control('');
    
    // Initialize step forms
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      category: ['', Validators.required],
      size: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      country: ['Morocco'],
      province: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      coordinates: [[0, 0]]
    });

    this.contactForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      website: ['', [Validators.pattern('^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$')]],
      registrationNumber: ['', [Validators.pattern('^[A-Z0-9-]{5,20}$')]]
    });

    this.missionVisionForm = this.fb.group({
      mission: ['', Validators.required],
      vision: ['', Validators.required]
    });

    this.focusAreasForm = this.fb.group({
      focusAreas: this.focusAreas
    });

    // Initialize main form
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

  ngOnInit() {
    this.loadOrganizationProfile();
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions() {
    // Sync basic info form with main form
    this.basicInfoForm.valueChanges.subscribe(value => {
      Object.keys(value).forEach(key => {
        this.profileForm.patchValue({ [key]: value[key] }, { emitEvent: false });
      });
    });

    // Sync location form with main form
    this.locationForm.valueChanges.subscribe(value => {
      Object.keys(value).forEach(key => {
        this.profileForm.patchValue({ [key]: value[key] }, { emitEvent: false });
      });
    });

    // Sync contact form with main form
    this.contactForm.valueChanges.subscribe(value => {
      Object.keys(value).forEach(key => {
        this.profileForm.patchValue({ [key]: value[key] }, { emitEvent: false });
      });
    });

    // Sync mission vision form with main form
    this.missionVisionForm.valueChanges.subscribe(value => {
      Object.keys(value).forEach(key => {
        this.profileForm.patchValue({ [key]: value[key] }, { emitEvent: false });
      });
    });

    // Sync focus areas form with main form
    this.focusAreasForm.valueChanges.subscribe(value => {
      this.profileForm.patchValue({ focusAreas: value.focusAreas }, { emitEvent: false });
    });
  }

  private loadOrganizationProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    this.organizationService.getOrganizationByUserId(userId).subscribe({
      next: (response: OrganizationProfile) => {
        this.organization = response;
        this.initializeForms(response);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading organization profile:', error);
        this.snackBar.open('Error loading organization profile', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  private initializeForms(profile: OrganizationProfile): void {
    // Initialize basic info form
    this.basicInfoForm.patchValue({
      name: profile.name,
      type: profile.type,
      category: profile.category,
      size: profile.size,
      description: profile.description
    });

    // Initialize location form
    this.locationForm.patchValue({
      address: profile.address,
      country: profile.country,
      province: profile.province,
      city: profile.city,
      postalCode: profile.postalCode,
      coordinates: profile.coordinates
    });

    // Initialize contact form
    this.contactForm.patchValue({
      phoneNumber: profile.phoneNumber,
      website: profile.website,
      registrationNumber: profile.registrationNumber
    });

    // Initialize mission vision form
    this.missionVisionForm.patchValue({
      mission: profile.mission,
      vision: profile.vision
    });

    // Clear existing focus areas and initialize with profile data
    this.focusAreas.clear();
    if (profile.focusAreas && profile.focusAreas.length > 0) {
      console.log('Initializing focus areas from profile:', profile.focusAreas); // Debug log
      profile.focusAreas.forEach(area => {
        this.focusAreas.push(this.fb.control(area));
      });
    }

    // Initialize main form
    this.profileForm.patchValue({
      ...profile,
      focusAreas: this.focusAreas.value
    });

    // Update available cities based on the organization's province
    if (profile.province) {
      const province = this.regions.find(r => r.name === profile.province);
      if (province) {
        this.availableCities = province.cities;
      }
    }

    console.log('Initialized focus areas:', this.focusAreas.value); // Debug log
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
      const formValue = this.profileForm.value;
      // Create request object without profile picture
      const { profilePicture, ...requestData } = formValue;
      
      // Get focus areas as a simple array
      const focusAreasArray = this.focusAreas.controls.map(control => control.value);
      
      // Create request object
      const request: OrganizationRequest = {
        ...requestData,
        focusAreas: focusAreasArray, // Send as array instead of Set
        profilePicture: this.organization.profilePicture // Preserve the existing profile picture
      };

      console.log('Submitting request with focus areas:', request.focusAreas); // Debug log

      this.organizationService.updateOrganization(this.organization.id, request).subscribe({
        next: (response: { data: OrganizationProfile }) => {
          console.log('Response from server:', response.data); // Debug log
          this.organization = response.data;
          this.snackBar.open('Organization profile updated successfully', 'Close', { duration: 5000 });
          this.router.navigate(['/organization/profile']);
        },
        error: (error: any) => {
          console.error('Error updating organization profile:', error);
          this.snackBar.open('Error updating organization profile', 'Close', { duration: 5000 });
        }
      });
    }
  }

  resetForm(): void {
    if (this.organization) {
      this.focusAreas.clear();
      this.initializeForms(this.organization);
    }
  }

  addFocusArea(): void {
    const value = this.newFocusAreaControl.value;
    if (value && !this.focusAreas.value.includes(value)) {
      this.focusAreas.push(this.fb.control(value));
      this.newFocusAreaControl.reset('');
      // Update the main form with the new focus areas
      this.profileForm.patchValue({
        focusAreas: this.focusAreas.value
      }, { emitEvent: false });
      console.log('Added focus area:', value); // Debug log
      console.log('Current focus areas:', this.focusAreas.value); // Debug log
    }
  }

  removeFocusArea(index: number): void {
    this.focusAreas.removeAt(index);
    // Update the main form with the updated focus areas
    this.profileForm.patchValue({
      focusAreas: this.focusAreas.value
    }, { emitEvent: false });
    console.log('Removed focus area at index:', index); // Debug log
    console.log('Current focus areas:', this.focusAreas.value); // Debug log
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