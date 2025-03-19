import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventService } from '../../../../../core/services/event.service';
import { Event, EventCategory } from '../../../../../core/models/event.model';
import { MapComponent, LocationData, Coordinates } from '../../../../../shared/components/map/map.component';
import { Store } from '@ngrx/store';
import * as EventActions from '../../../../../store/event/event.actions';
import { EventState } from '../../../../../store/event/event.reducer';
import { selectSelectedEvent } from '../../../../../store/event/event.selectors';

type EventFormData = {
  title: string;
  description: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  coordinates: [number, number];
  location: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
};

@Component({
  selector: 'app-edit-event',
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
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MapComponent
  ],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent implements OnInit, OnDestroy {
  eventForm!: FormGroup;
  categories = Object.values(EventCategory);
  event!: Event;
  loading = true;
  submitting = false;
  private destroy$ = new Subject<void>();
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private store: Store<{ event: EventState }>,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loading = true;
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.store.dispatch(EventActions.loadEvent({ id: eventId }));
      this.store.select(selectSelectedEvent).subscribe(event => {
        if (event) {
          this.initializeForm(event);
          this.loading = false;
        }
      });
    } else {
      this.snackBar.open('Event ID not found', 'Close', { duration: 3000 });
      this.router.navigate(['/organization/events']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private validateDates(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

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

  private initializeForm(eventData: Event): void {
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    this.eventForm = this.fb.group({
      title: [eventData.title, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: [eventData.description, [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      category: [eventData.category, [Validators.required]],
      startDate: [startDate, [Validators.required]],
      endDate: [endDate, [Validators.required]],
      maxParticipants: [eventData.maxParticipants, [Validators.required, Validators.min(1)]],
      coordinates: [eventData.coordinates, [Validators.required]],
      location: [eventData.location, [Validators.required]],
      contactPerson: [eventData.contactPerson, [Validators.required]],
      contactEmail: [eventData.contactEmail, [Validators.required, Validators.email]],
      contactPhone: [eventData.contactPhone, [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]]
    }, { validators: this.validateDates });

    // Subscribe to date changes to revalidate
    this.eventForm.get('startDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.eventForm.updateValueAndValidity();
    });

    this.eventForm.get('endDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.eventForm.updateValueAndValidity();
    });
  }

  onCoordinatesSelected(location: LocationData): void {
    this.eventForm.patchValue({
      coordinates: location.coordinates,
      location: location.address
    });
  }

  getMapCoordinates(): Coordinates | undefined {
    const coords = this.eventForm.get('coordinates')?.value;
    return coords ? { lat: coords[0], lng: coords[1] } : undefined;
  }

  onSubmit(): void {
    if (!this.eventForm.valid) {
      this.showValidationErrors();
      return;
    }

    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.snackBar.open('Event ID not found', 'Close', { duration: 3000 });
      return;
    }

    const startDateTime = this.combineDateTime(
      this.eventForm.get('startDate')?.value,
      this.eventForm.get('startTime')?.value
    );

    const endDateTime = this.combineDateTime(
      this.eventForm.get('endDate')?.value,
      this.eventForm.get('endTime')?.value
    );

    const eventData = {
      ...this.eventForm.value,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString()
    };

    console.log('Dispatching update event action with data:', eventData);
    this.store.dispatch(EventActions.updateEvent({ id: eventId, event: eventData }));
  }

  private showValidationErrors(): void {
    if (this.eventForm.errors?.['invalidDateRange']) {
      this.snackBar.open('End date must be after start date', 'Close', { duration: 3000 });
    } else if (this.eventForm.errors?.['pastStartDate']) {
      this.snackBar.open('Start date cannot be in the past', 'Close', { duration: 3000 });
    } else if (this.eventForm.errors?.['requiredDates']) {
      this.snackBar.open('Both start and end dates are required', 'Close', { duration: 3000 });
    } else {
      let errorMessage = 'Please fill in all required fields correctly';
      
      if (this.eventForm.get('title')?.errors?.['required']) {
        errorMessage = 'Title is required';
      } else if (this.eventForm.get('description')?.errors?.['required']) {
        errorMessage = 'Description is required';
      } else if (this.eventForm.get('category')?.errors?.['required']) {
        errorMessage = 'Category is required';
      } else if (this.eventForm.get('location')?.errors?.['required']) {
        errorMessage = 'Location is required';
      } else if (this.eventForm.get('coordinates')?.errors?.['required']) {
        errorMessage = 'Please select a location on the map';
      } else if (this.eventForm.get('maxParticipants')?.errors?.['required']) {
        errorMessage = 'Maximum participants is required';
      } else if (this.eventForm.get('contactPerson')?.errors?.['required']) {
        errorMessage = 'Contact person is required';
      } else if (this.eventForm.get('contactEmail')?.errors?.['required']) {
        errorMessage = 'Contact email is required';
      } else if (this.eventForm.get('contactEmail')?.errors?.['email']) {
        errorMessage = 'Invalid email format';
      } else if (this.eventForm.get('contactPhone')?.errors?.['required']) {
        errorMessage = 'Contact phone is required';
      } else if (this.eventForm.get('contactPhone')?.errors?.['pattern']) {
        errorMessage = 'Invalid phone number format';
      }
      
      this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
    }
  }

  private createForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      category: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      maxParticipants: ['', [Validators.required, Validators.min(1)]],
      coordinates: ['', [Validators.required]],
      location: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]]
    }, { validators: this.validateDates });

    // Subscribe to date changes to revalidate
    this.eventForm.get('startDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.eventForm.updateValueAndValidity();
    });

    this.eventForm.get('endDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.eventForm.updateValueAndValidity();
    });
  }

  private combineDateTime(date: Date | null, time: string | null): Date {
    if (!date || !time) {
      throw new Error('Invalid date or time format');
    }

    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate;
  }
} 