import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
import {
  IEvent,
  EventCategory,
  EventStatus,
} from '../../../../../core/models/event.types';
import * as EventActions from '../../../../../store/event/event.actions';
import {
  MapComponent,
  LocationData,
  Coordinates,
} from '../../../../../shared/components/map/map.component';

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
    MapComponent,
  ],
  templateUrl: './create-event.component.html',
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
    `,
  ],
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
  
  // Make EventStatus available in the class scope
  EventStatus = EventStatus;

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
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(2000),
        ],
      ],
      category: ['', Validators.required],
      status: [EventStatus.DRAFT],
    });

    // Location Form
    this.locationForm = this.fb.group(
      {
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        location: ['', Validators.required],
        coordinates: [[0, 0], Validators.required],
      },
      { validators: this.validateDates }
    );

    // Contact Form
    this.contactForm = this.fb.group({
      contactPerson: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: [
        '',
        [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      ],
    });

    // Participant Form
    this.participantForm = this.fb.group({
      maxParticipants: [0, [Validators.required, Validators.min(1)]],
      minimumAge: [0, [Validators.required, Validators.min(0)]],
      pointsAwarded: [0, [Validators.required, Validators.min(0)]],
      durationHours: [0, [Validators.required, Validators.min(0)]],
      waitlistEnabled: [false],
      maxWaitlistSize: [0],
    });

    // Requirements Form
    this.requirementsForm = this.fb.group({
      requiredSkills: [''],
      difficulty: ['BEGINNER'],
      isVirtual: [false],
      requiresApproval: [false],
      requiresBackground: [false],
      isRecurring: [false],
      isSpecialEvent: [false],
    });

    // Additional Form
    this.additionalForm = this.fb.group({
      tags: [''],
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
      location: location.address,
    });
  }

  getMapCoordinates(): Coordinates {
    const coords = this.locationForm.get('coordinates')?.value;
    return {
      lat: coords?.[0] || 0,
      lng: coords?.[1] || 0,
    };
  }

  isFormValid(): boolean {
    return (
      this.basicInfoForm.valid &&
      this.locationForm.valid &&
      this.contactForm.valid &&
      this.participantForm.valid &&
      this.requirementsForm.valid &&
      this.additionalForm.valid
    );
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
        ...this.additionalForm.value,
      };

      const organizationId = this.authService.getCurrentOrganizationId();

      if (!organizationId) {
        this.snackBar.open('Organization ID not found', 'Close', {
          duration: 5000,
        });
        return;
      }

      // Format dates
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);

      // Format arrays and ensure they're not undefined
      const requiredSkills = formValue.requiredSkills
        ? formValue.requiredSkills
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

      const tags = formValue.tags
        ? formValue.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

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
        maxWaitlistSize: formValue.waitlistEnabled
          ? Number(formValue.maxWaitlistSize)
          : 0,

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
        status: formValue.status || EventStatus.PENDING,

        // Initialize empty arrays and counters
        registeredParticipants: [],
        waitlistedParticipants: [],
        averageRating: 0,
        numberOfRatings: 0,
      };

      // Log the processed event object
      console.log('========== PROCESSED EVENT DATA ==========');
      console.log('Event Object:', JSON.stringify(event, null, 2));
      console.log('=========================================');

      this.store.dispatch(EventActions.createEvent({ event }));
      
      // Show appropriate message based on status
      const statusMessage = event.status === 'DRAFT' 
        ? 'Event saved as draft' 
        : 'Event submitted for approval';
      
      this.snackBar.open(statusMessage, 'Close', {
        duration: 5000,
      });
      
      this.router.navigate(['/organization/events']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/organization/events']);
  }
}
