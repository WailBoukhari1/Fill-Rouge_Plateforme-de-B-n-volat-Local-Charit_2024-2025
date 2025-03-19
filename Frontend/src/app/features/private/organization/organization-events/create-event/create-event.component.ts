import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { EventCategory, EventStatus } from '../../../../../core/models/event.types';
import { MapComponent, LocationData } from '../../../../../shared/components/map/map.component';
import * as EventActions from '../../../../../store/event/event.actions';
import { EventState } from '../../../../../store/event/event.reducer';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MapComponent
  ],
  template: `
    <div class="stepper-container">
      <mat-horizontal-stepper #stepper>
        <!-- Basic Information Step -->
        <mat-step [stepControl]="basicInfoForm">
          <ng-template matStepLabel>Basic Information</ng-template>
          <form [formGroup]="basicInfoForm">
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" required>
                <mat-error *ngIf="basicInfoForm.get('title')?.hasError('required')">Title is required</mat-error>
                <mat-error *ngIf="basicInfoForm.get('title')?.hasError('minlength')">Title must be at least 5 characters</mat-error>
                <mat-error *ngIf="basicInfoForm.get('title')?.hasError('maxlength')">Title cannot exceed 100 characters</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Category</mat-label>
                <mat-select formControlName="category" required>
                  @for (category of categories; track category) {
                    <mat-option [value]="category">{{formatCategory(category)}}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4" required></textarea>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('required')">Description is required</mat-error>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('minlength')">Description must be at least 20 characters</mat-error>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('maxlength')">Description cannot exceed 2000 characters</mat-error>
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button matStepperNext [disabled]="!basicInfoForm.valid">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Date and Time Step -->
        <mat-step [stepControl]="dateTimeForm">
          <ng-template matStepLabel>Date & Time</ng-template>
          <form [formGroup]="dateTimeForm">
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error *ngIf="dateTimeForm.get('startDate')?.hasError('required')">Start date is required</mat-error>
                <mat-error *ngIf="dateTimeForm.get('startDate')?.hasError('futureDate')">Start date must be in the future</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Start Time</mat-label>
                <input matInput type="time" formControlName="startTime" required>
              </mat-form-field>

              <mat-form-field>
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate" required>
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                <mat-error *ngIf="dateTimeForm.get('endDate')?.hasError('required')">End date is required</mat-error>
                <mat-error *ngIf="dateTimeForm.get('endDate')?.hasError('futureDate')">End date must be in the future</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>End Time</mat-label>
                <input matInput type="time" formControlName="endTime" required>
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext [disabled]="!dateTimeForm.valid">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Location Step -->
        <mat-step [stepControl]="locationForm">
          <ng-template matStepLabel>Location</ng-template>
          <form [formGroup]="locationForm">
            <div class="form-grid">
              <mat-form-field class="full-width">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" required>
                <mat-error *ngIf="locationForm.get('location')?.hasError('required')">Location is required</mat-error>
              </mat-form-field>

              <div class="map-container">
                <app-map 
                  [selectable]="true"
                  (locationSelected)="onCoordinatesSelected($event)">
                </app-map>
              </div>

              <div class="coordinates-display" *ngIf="locationForm.get('coordinates')?.value">
                <p>Selected coordinates: {{formatCoordinates(locationForm.get('coordinates')?.value)}}</p>
              </div>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext [disabled]="!locationForm.valid">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Capacity and Requirements Step -->
        <mat-step [stepControl]="capacityForm">
          <ng-template matStepLabel>Capacity & Requirements</ng-template>
          <form [formGroup]="capacityForm">
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Maximum Participants</mat-label>
                <input matInput type="number" formControlName="maxParticipants" required>
                <mat-error *ngIf="capacityForm.get('maxParticipants')?.hasError('required')">Maximum participants is required</mat-error>
                <mat-error *ngIf="capacityForm.get('maxParticipants')?.hasError('min')">Minimum 1 participant required</mat-error>
                <mat-error *ngIf="capacityForm.get('maxParticipants')?.hasError('max')">Maximum 100 participants allowed</mat-error>
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext [disabled]="!capacityForm.valid">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Contact Information Step -->
        <mat-step [stepControl]="contactForm">
          <ng-template matStepLabel>Contact Information</ng-template>
          <form [formGroup]="contactForm">
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Contact Person</mat-label>
                <input matInput formControlName="contactPerson" required>
                <mat-error *ngIf="contactForm.get('contactPerson')?.hasError('required')">Contact person is required</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Contact Email</mat-label>
                <input matInput type="email" formControlName="contactEmail" required>
                <mat-error *ngIf="contactForm.get('contactEmail')?.hasError('required')">Contact email is required</mat-error>
                <mat-error *ngIf="contactForm.get('contactEmail')?.hasError('email')">Invalid email format</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Contact Phone</mat-label>
                <input matInput formControlName="contactPhone" required>
                <mat-error *ngIf="contactForm.get('contactPhone')?.hasError('required')">Contact phone is required</mat-error>
                <mat-error *ngIf="contactForm.get('contactPhone')?.hasError('pattern')">Invalid phone number format</mat-error>
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext [disabled]="!contactForm.valid">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Review Step -->
        <mat-step>
          <ng-template matStepLabel>Review & Submit</ng-template>
          <div class="review-section">
            <h3>Event Summary</h3>
            <div class="review-grid">
              <div class="review-item">
                <strong>Title:</strong>
                <span>{{basicInfoForm.get('title')?.value}}</span>
              </div>
              <div class="review-item">
                <strong>Category:</strong>
                <span>{{formatCategory(basicInfoForm.get('category')?.value)}}</span>
              </div>
              <div class="review-item full-width">
                <strong>Description:</strong>
                <p>{{basicInfoForm.get('description')?.value}}</p>
              </div>
              <div class="review-item">
                <strong>Start:</strong>
                <span>{{formatDateTime(dateTimeForm.get('startDate')?.value, dateTimeForm.get('startTime')?.value)}}</span>
              </div>
              <div class="review-item">
                <strong>End:</strong>
                <span>{{formatDateTime(dateTimeForm.get('endDate')?.value, dateTimeForm.get('endTime')?.value)}}</span>
              </div>
              <div class="review-item">
                <strong>Location:</strong>
                <span>{{locationForm.get('location')?.value}}</span>
              </div>
              <div class="review-item">
                <strong>Maximum Participants:</strong>
                <span>{{capacityForm.get('maxParticipants')?.value}}</span>
              </div>
              <div class="review-item">
                <strong>Contact Person:</strong>
                <span>{{contactForm.get('contactPerson')?.value}}</span>
              </div>
              <div class="review-item">
                <strong>Contact Email:</strong>
                <span>{{contactForm.get('contactEmail')?.value}}</span>
              </div>
              <div class="review-item">
                <strong>Contact Phone:</strong>
                <span>{{contactForm.get('contactPhone')?.value}}</span>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!isFormsValid()">
              Create Event
            </button>
          </div>
        </mat-step>
      </mat-horizontal-stepper>
    </div>
  `,
  styles: [`
    .stepper-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .map-container {
      grid-column: 1 / -1;
      height: 400px;
      margin: 1rem 0;
      border-radius: 4px;
      overflow: hidden;
    }

    .coordinates-display {
      grid-column: 1 / -1;
      padding: 0.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .review-section {
      background-color: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .review-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .review-item.full-width {
      grid-column: 1 / -1;
    }

    .review-item strong {
      color: #666;
      font-size: 0.9rem;
    }

    .review-item p {
      margin: 0;
      white-space: pre-wrap;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class CreateEventComponent implements OnInit {
  @ViewChild('stepper') stepper: any;

  basicInfoForm!: FormGroup;
  dateTimeForm!: FormGroup;
  locationForm!: FormGroup;
  capacityForm!: FormGroup;
  contactForm!: FormGroup;

  categories = Object.values(EventCategory);

  constructor(
    private fb: FormBuilder,
    private store: Store<{ event: EventState }>,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    this.createForms();
  }

  private createForms(): void {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      category: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]]
    });

    this.dateTimeForm = this.fb.group({
      startDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]]
    }, { validators: this.validateDates });

    this.locationForm = this.fb.group({
      location: ['', [Validators.required]],
      coordinates: [null, [Validators.required]]
    });

    this.capacityForm = this.fb.group({
      maxParticipants: [20, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.contactForm = this.fb.group({
      contactPerson: ['', [Validators.required]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]]
    });
  }

  private validateDates(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const startTime = control.get('startTime')?.value;
    const endDate = control.get('endDate')?.value;
    const endTime = control.get('endTime')?.value;

    if (!startDate || !startTime || !endDate || !endTime) {
      return { requiredDates: true };
    }

    const start = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    start.setHours(parseInt(startHours), parseInt(startMinutes));

    const end = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    end.setHours(parseInt(endHours), parseInt(endMinutes));

    const now = new Date();

    if (start < now) {
      return { pastStartDate: true };
    }

    if (end <= start) {
      return { invalidDateRange: true };
    }

    return null;
  }

  onCoordinatesSelected(location: LocationData): void {
    this.locationForm.patchValue({
      coordinates: location.coordinates,
      location: location.address
    });
  }

  formatCategory(category: string): string {
    return category?.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDateTime(date: Date, time: string): string {
    if (!date || !time) return '';
    const [hours, minutes] = time.split(':');
    const datetime = new Date(date);
    datetime.setHours(parseInt(hours), parseInt(minutes));
    return datetime.toLocaleString();
  }

  formatCoordinates(coordinates: [number, number]): string {
    if (!coordinates) return '';
    return `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`;
  }

  isFormsValid(): boolean {
    return (
      this.basicInfoForm.valid &&
      this.dateTimeForm.valid &&
      this.locationForm.valid &&
      this.capacityForm.valid &&
      this.contactForm.valid
    );
  }

  onSubmit(): void {
    if (!this.isFormsValid()) {
      this.showValidationErrors();
      return;
    }

    const startDateTime = this.combineDateTime(
      this.dateTimeForm.get('startDate')?.value,
      this.dateTimeForm.get('startTime')?.value
    );

    const endDateTime = this.combineDateTime(
      this.dateTimeForm.get('endDate')?.value,
      this.dateTimeForm.get('endTime')?.value
    );

    const eventData = {
      ...this.basicInfoForm.value,
      ...this.locationForm.value,
      ...this.capacityForm.value,
      ...this.contactForm.value,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      status: EventStatus.PENDING
    };

    console.log('Dispatching create event action with data:', eventData);
    this.store.dispatch(EventActions.createEvent({ event: eventData }));
  }

  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':');
    const datetime = new Date(date);
    datetime.setHours(parseInt(hours), parseInt(minutes));
    return datetime;
  }

  private showValidationErrors(): void {
    let errorMessage = '';

    if (this.basicInfoForm.invalid) {
      if (this.basicInfoForm.get('title')?.errors?.['required']) {
        errorMessage = 'Title is required';
      } else if (this.basicInfoForm.get('description')?.errors?.['required']) {
        errorMessage = 'Description is required';
      } else if (this.basicInfoForm.get('category')?.errors?.['required']) {
        errorMessage = 'Category is required';
      }
    } else if (this.dateTimeForm.invalid) {
      if (this.dateTimeForm.errors?.['invalidDateRange']) {
        errorMessage = 'End date must be after start date';
      } else if (this.dateTimeForm.errors?.['pastStartDate']) {
        errorMessage = 'Start date cannot be in the past';
      } else if (this.dateTimeForm.errors?.['requiredDates']) {
        errorMessage = 'Both start and end dates are required';
      }
    } else if (this.locationForm.invalid) {
      if (this.locationForm.get('location')?.errors?.['required']) {
        errorMessage = 'Location is required';
      } else if (this.locationForm.get('coordinates')?.errors?.['required']) {
        errorMessage = 'Please select a location on the map';
      }
    } else if (this.capacityForm.invalid) {
      if (this.capacityForm.get('maxParticipants')?.errors?.['required']) {
        errorMessage = 'Maximum participants is required';
      } else if (this.capacityForm.get('maxParticipants')?.errors?.['min']) {
        errorMessage = 'Minimum 1 participant required';
      } else if (this.capacityForm.get('maxParticipants')?.errors?.['max']) {
        errorMessage = 'Maximum 100 participants allowed';
      }
    } else if (this.contactForm.invalid) {
      if (this.contactForm.get('contactPerson')?.errors?.['required']) {
        errorMessage = 'Contact person is required';
      } else if (this.contactForm.get('contactEmail')?.errors?.['required']) {
        errorMessage = 'Contact email is required';
      } else if (this.contactForm.get('contactEmail')?.errors?.['email']) {
        errorMessage = 'Invalid email format';
      } else if (this.contactForm.get('contactPhone')?.errors?.['required']) {
        errorMessage = 'Contact phone is required';
      } else if (this.contactForm.get('contactPhone')?.errors?.['pattern']) {
        errorMessage = 'Invalid phone number format';
      }
    }

    if (errorMessage) {
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    }
  }
} 