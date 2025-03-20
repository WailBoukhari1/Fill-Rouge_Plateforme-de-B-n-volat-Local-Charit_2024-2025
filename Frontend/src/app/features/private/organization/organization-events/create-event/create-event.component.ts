import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { IEvent, EventCategory, EventStatus } from '../../../../../core/models/event.types';
import * as EventActions from '../../../../../store/event/event.actions';
import { MapComponent, LocationData, Coordinates } from '../../../../../shared/components/map/map.component';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatStepperModule,
    MapComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Create New Event</h1>
      
      <mat-stepper linear #stepper>
        <!-- Step 1: Basic Information -->
        <mat-step [stepControl]="basicInfoForm" label="Basic Information">
          <form [formGroup]="basicInfoForm">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field class="w-full">
                  <mat-label>Event Title</mat-label>
                  <input matInput formControlName="title" required>
                  <mat-error *ngIf="basicInfoForm.get('title')?.hasError('required')">
                    Title is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category" required>
                    <mat-option *ngFor="let category of categories" [value]="category">
                      {{category}}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="basicInfoForm.get('category')?.hasError('required')">
                    Category is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field class="w-full mt-4">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4" required></textarea>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('minlength')">
                  Description must be at least 20 characters
                </mat-error>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('maxlength')">
                  Description cannot exceed 2000 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="flex justify-end mt-4">
              <button mat-raised-button color="primary" matStepperNext [disabled]="!basicInfoForm.valid">
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Dates and Location -->
        <mat-step [stepControl]="locationForm" label="Dates and Location">
          <form [formGroup]="locationForm">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field class="w-full">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                  <mat-error *ngIf="locationForm.get('startDate')?.hasError('required')">
                    Start date is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate" required>
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                  <mat-error *ngIf="locationForm.get('endDate')?.hasError('required')">
                    End date is required
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Map Component -->
              <div class="mt-4">
                <h3 class="text-lg font-semibold mb-2">Select Location</h3>
                <app-map
                  [coordinates]="getMapCoordinates()"
                  (locationSelected)="onLocationSelected($event)">
                </app-map>
                <mat-form-field class="w-full mt-4">
                  <mat-label>Location Address</mat-label>
                  <input matInput formControlName="location" required>
                  <mat-error *ngIf="locationForm.get('location')?.hasError('required')">
                    Location is required
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <div class="flex justify-between mt-4">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="!locationForm.valid">
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Contact Information -->
        <mat-step [stepControl]="contactForm" label="Contact Information">
          <form [formGroup]="contactForm">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <mat-form-field class="w-full">
                  <mat-label>Contact Person</mat-label>
                  <input matInput formControlName="contactPerson" required>
                  <mat-error *ngIf="contactForm.get('contactPerson')?.hasError('required')">
                    Contact person is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Contact Email</mat-label>
                  <input matInput formControlName="contactEmail" type="email" required>
                  <mat-error *ngIf="contactForm.get('contactEmail')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('contactEmail')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Contact Phone</mat-label>
                  <input matInput formControlName="contactPhone" required>
                  <mat-error *ngIf="contactForm.get('contactPhone')?.hasError('required')">
                    Phone number is required
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('contactPhone')?.hasError('pattern')">
                    Please enter a valid phone number (e.g., +1234567890 or 1234567890)
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <div class="flex justify-between mt-4">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="!contactForm.valid">
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Participant Settings -->
        <mat-step [stepControl]="participantForm" label="Participant Settings">
          <form [formGroup]="participantForm">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field class="w-full">
                  <mat-label>Maximum Participants</mat-label>
                  <input matInput type="number" formControlName="maxParticipants" required>
                  <mat-error *ngIf="participantForm.get('maxParticipants')?.hasError('required')">
                    Maximum participants is required
                  </mat-error>
                  <mat-error *ngIf="participantForm.get('maxParticipants')?.hasError('min')">
                    Must be at least 1
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Minimum Age</mat-label>
                  <input matInput type="number" formControlName="minimumAge" required>
                  <mat-error *ngIf="participantForm.get('minimumAge')?.hasError('required')">
                    Minimum age is required
                  </mat-error>
                  <mat-error *ngIf="participantForm.get('minimumAge')?.hasError('min')">
                    Must be at least 0
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Points Awarded</mat-label>
                  <input matInput type="number" formControlName="pointsAwarded" required>
                  <mat-error *ngIf="participantForm.get('pointsAwarded')?.hasError('required')">
                    Points awarded is required
                  </mat-error>
                  <mat-error *ngIf="participantForm.get('pointsAwarded')?.hasError('min')">
                    Must be at least 0
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Duration (hours)</mat-label>
                  <input matInput type="number" formControlName="durationHours" required>
                  <mat-error *ngIf="participantForm.get('durationHours')?.hasError('required')">
                    Duration is required
                  </mat-error>
                  <mat-error *ngIf="participantForm.get('durationHours')?.hasError('min')">
                    Must be at least 0
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="flex items-center space-x-4 mt-4">
                <mat-checkbox formControlName="waitlistEnabled">Enable Waitlist</mat-checkbox>
                <mat-form-field *ngIf="participantForm.get('waitlistEnabled')?.value">
                  <mat-label>Maximum Waitlist Size</mat-label>
                  <input matInput type="number" formControlName="maxWaitlistSize">
                </mat-form-field>
              </div>
            </div>

            <div class="flex justify-between mt-4">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="!participantForm.valid">
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 5: Event Requirements -->
        <mat-step [stepControl]="requirementsForm" label="Event Requirements">
          <form [formGroup]="requirementsForm">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="space-y-4">
                <mat-form-field class="w-full">
                  <mat-label>Required Skills (comma-separated)</mat-label>
                  <input matInput formControlName="requiredSkills" placeholder="skill1,skill2,skill3">
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Difficulty Level</mat-label>
                  <mat-select formControlName="difficulty">
                    <mat-option value="BEGINNER">Beginner</mat-option>
                    <mat-option value="INTERMEDIATE">Intermediate</mat-option>
                    <mat-option value="ADVANCED">Advanced</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <mat-checkbox formControlName="isVirtual">Virtual Event</mat-checkbox>
                  <mat-checkbox formControlName="requiresApproval">Requires Approval</mat-checkbox>
                  <mat-checkbox formControlName="requiresBackground">Requires Background Check</mat-checkbox>
                  <mat-checkbox formControlName="isRecurring">Recurring Event</mat-checkbox>
                  <mat-checkbox formControlName="isSpecialEvent">Special Event</mat-checkbox>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-4">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="!requirementsForm.valid">
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 6: Additional Information -->
        <mat-step [stepControl]="additionalForm" label="Additional Information">
          <form [formGroup]="additionalForm">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <mat-form-field class="w-full">
                <mat-label>Tags (comma-separated)</mat-label>
                <input matInput formControlName="tags" placeholder="tag1,tag2,tag3">
              </mat-form-field>
            </div>

            <div class="flex justify-between mt-4">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!isFormValid()">
                Create Event
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class CreateEventComponent implements OnInit {
  basicInfoForm!: FormGroup;
  locationForm!: FormGroup;
  contactForm!: FormGroup;
  participantForm!: FormGroup;
  requirementsForm!: FormGroup;
  additionalForm!: FormGroup;
  categories = Object.values(EventCategory);
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    // Add any initialization logic here
  }

  private createForms(): void {
    // Basic Information Form
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      category: ['', Validators.required]
    });

    // Location Form
    this.locationForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      location: ['', Validators.required],
      coordinates: [[0, 0], Validators.required]
    }, { validators: this.validateDates });

    // Contact Form
    this.contactForm = this.fb.group({
      contactPerson: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]]
    });

    // Participant Form
    this.participantForm = this.fb.group({
      maxParticipants: [0, [Validators.required, Validators.min(1)]],
      minimumAge: [0, [Validators.required, Validators.min(0)]],
      pointsAwarded: [0, [Validators.required, Validators.min(0)]],
      durationHours: [0, [Validators.required, Validators.min(0)]],
      waitlistEnabled: [false],
      maxWaitlistSize: [0]
    });

    // Requirements Form
    this.requirementsForm = this.fb.group({
      requiredSkills: [''],
      difficulty: ['BEGINNER'],
      isVirtual: [false],
      requiresApproval: [false],
      requiresBackground: [false],
      isRecurring: [false],
      isSpecialEvent: [false]
    });

    // Additional Form
    this.additionalForm = this.fb.group({
      tags: ['']
    });
  }

  private validateDates(group: AbstractControl): ValidationErrors | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (!startDate || !endDate) {
      return { requiredDates: true };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return { pastStartDate: true };
    }

    if (end <= start) {
      return { invalidDateRange: true };
    }

    return null;
  }

  onLocationSelected(location: LocationData): void {
    this.locationForm.patchValue({
      coordinates: location.coordinates,
      location: location.address
    });
  }

  getMapCoordinates(): Coordinates {
    const coords = this.locationForm.get('coordinates')?.value;
    return {
      lat: coords?.[0] || 0,
      lng: coords?.[1] || 0
    };
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid &&
           this.locationForm.valid &&
           this.contactForm.valid &&
           this.participantForm.valid &&
           this.requirementsForm.valid &&
           this.additionalForm.valid;
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      // Log raw form values
      console.log('========== FORM VALUES ==========');
      console.log('Basic Info:', this.basicInfoForm.value);
      console.log('Location:', this.locationForm.value);
      console.log('Contact:', this.contactForm.value);
      console.log('Participant:', this.participantForm.value);
      console.log('Requirements:', this.requirementsForm.value);
      console.log('Additional:', this.additionalForm.value);
      console.log('================================');

      const formValue = {
        ...this.basicInfoForm.value,
        ...this.locationForm.value,
        ...this.contactForm.value,
        ...this.participantForm.value,
        ...this.requirementsForm.value,
        ...this.additionalForm.value
      };

      const organizationId = this.authService.getCurrentOrganizationId();
      
      if (!organizationId) {
        this.snackBar.open('Organization ID not found', 'Close', { duration: 5000 });
        return;
      }

      // Format dates
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);

      // Format arrays and ensure they're not undefined
      const requiredSkills = formValue.requiredSkills ? 
        formValue.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : 
        [];
      
      const tags = formValue.tags ? 
        formValue.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : 
        [];

      // Create the event object with all required fields
      const event: Partial<IEvent> = {
        // Basic Information
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,

        // Location and Dates
        location: formValue.location,
        coordinates: formValue.coordinates,
        startDate: startDate,
        endDate: endDate,

        // Contact Information
        contactPerson: formValue.contactPerson,
        contactEmail: formValue.contactEmail,
        contactPhone: formValue.contactPhone,

        // Participant Settings
        maxParticipants: Number(formValue.maxParticipants),
        minimumAge: Number(formValue.minimumAge),
        pointsAwarded: Number(formValue.pointsAwarded),
        durationHours: Number(formValue.durationHours),
        waitlistEnabled: Boolean(formValue.waitlistEnabled),
        maxWaitlistSize: formValue.waitlistEnabled ? Number(formValue.maxWaitlistSize) : 0,

        // Requirements
        requiredSkills: requiredSkills,
        difficulty: formValue.difficulty,
        isVirtual: Boolean(formValue.isVirtual),
        requiresApproval: Boolean(formValue.requiresApproval),
        requiresBackground: Boolean(formValue.requiresBackground),
        isRecurring: Boolean(formValue.isRecurring),
        isSpecialEvent: Boolean(formValue.isSpecialEvent),

        // Additional Information
        tags: tags,

        // Organization and Status
        organizationId: organizationId,
        status: EventStatus.DRAFT,

        // Initialize empty arrays and counters
        registeredParticipants: [],
        waitlistedParticipants: [],
        participations: [],
        averageRating: 0,
        numberOfRatings: 0
      };

      // Log the processed event object
      console.log('========== PROCESSED EVENT DATA ==========');
      console.log('Event Object:', JSON.stringify(event, null, 2));
      console.log('=========================================');

      this.store.dispatch(EventActions.createEvent({ event }));
      this.snackBar.open('Event created successfully', 'Close', { duration: 5000 });
      this.router.navigate(['/organization/events']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/organization/events']);
  }
} 