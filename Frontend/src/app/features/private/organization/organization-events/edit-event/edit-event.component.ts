import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../../../core/services/event.service';
import { IEvent, EventCategory, EventStatus } from '../../../../../core/models/event.types';
import * as EventActions from '../../../../../store/event/event.actions';
import { selectSelectedEvent } from '../../../../../store/event/event.selectors';
import { EventState } from '../../../../../store/event/event.reducer';
import { MapComponent, LocationData, Coordinates } from '../../../../../shared/components/map/map.component';
import { EventResolver } from '../resolvers/event.resolver';

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
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSlideToggleModule,
    RouterModule,
    MapComponent
  ],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  locationForm!: FormGroup;
  contactForm!: FormGroup;
  participantForm!: FormGroup;
  requirementsForm!: FormGroup;
  additionalForm!: FormGroup;
  bannerImageForm!: FormGroup;
  categories = Object.values(EventCategory);
  event!: IEvent;
  loading = true;
  submitting = false;
  private destroy$ = new Subject<void>();
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private store: Store<{ event: EventState }>,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private eventService: EventService,
    private eventResolver: EventResolver
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    this.loading = true;
    console.log('EditEventComponent initialized');
    
    // Get the resolved event data from the route
    this.route.data.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        console.log('Route data received:', data);
        if (data['event']) {
          // Extract the event data from the API response
          const eventData = data['event'].data || data['event'];
          console.log('Event data received:', eventData);
          
          // Store the event data with _id property
          this.event = {
            ...eventData,
            _id: eventData.id || eventData._id // Handle both id and _id
          };
          
          // Initialize forms with event data
          this.initializeForms(this.event);
          this.loading = false;
        } else {
          console.error('No event data found in route');
          this.snackBar.open('Event not found', 'Close', { duration: 3000 });
          this.router.navigate(['/organization/events']);
        }
      },
      error: (error) => {
        console.error('Error in route data subscription:', error);
        this.snackBar.open('Error loading event data', 'Close', { duration: 3000 });
        this.router.navigate(['/organization/events']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForms(): void {
    // Banner Image Form
    this.bannerImageForm = this.fb.group({
      bannerImage: ['']
    });

    // Basic Information Form
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      category: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    // Location Form
    this.locationForm = this.fb.group({
      location: ['', Validators.required],
      coordinates: [[0, 0], Validators.required]
    });

    // Contact Form
    this.contactForm = this.fb.group({
      contactPerson: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]]
    });

    // Participant Form
    this.participantForm = this.fb.group({
      maxParticipants: [0, [Validators.required, Validators.min(1)]],
      waitlistEnabled: [false],
      maxWaitlistSize: [0],
      requiredSkills: [[]]
    });

    // Requirements Form
    this.requirementsForm = this.fb.group({
      difficulty: ['BEGINNER', Validators.required],
      minimumAge: [0],
      requiresBackground: [false],
      requiresApproval: [false]
    });

    // Additional Form
    this.additionalForm = this.fb.group({
      durationHours: [0, [Validators.required, Validators.min(0)]],
      pointsAwarded: [0],
      isVirtual: [false],
      isRecurring: [false],
      isSpecialEvent: [false],
      tags: [[]]
    });
  }

  private initializeForms(eventData: IEvent): void {
    console.log('Initializing forms with event data:', eventData);
    
    // Banner Image
    this.bannerImageForm.patchValue({
      bannerImage: eventData.bannerImage || ''
    });

    // Basic Information
    this.basicInfoForm.patchValue({
      title: eventData.title || '',
      description: eventData.description || '',
      category: eventData.category || EventCategory.OTHER,
      startDate: eventData.startDate ? new Date(eventData.startDate) : null,
      endDate: eventData.endDate ? new Date(eventData.endDate) : null
    });

    // Location
    this.locationForm.patchValue({
      location: eventData.location || '',
      coordinates: eventData.coordinates || [0, 0]
    });

    // Contact Information
    this.contactForm.patchValue({
      contactPerson: eventData.contactPerson || '',
      contactEmail: eventData.contactEmail || '',
      contactPhone: eventData.contactPhone || ''
    });

    // Participant Information
    this.participantForm.patchValue({
      maxParticipants: eventData.maxParticipants || 0,
      waitlistEnabled: eventData.waitlistEnabled || false,
      maxWaitlistSize: eventData.maxWaitlistSize || 0,
      requiredSkills: eventData.requiredSkills || []
    });

    // Requirements
    this.requirementsForm.patchValue({
      difficulty: eventData.difficulty || 'BEGINNER',
      minimumAge: eventData.minimumAge || 0,
      requiresBackground: eventData.requiresBackground || false,
      requiresApproval: eventData.requiresApproval || false
    });

    // Additional Settings
    this.additionalForm.patchValue({
      durationHours: eventData.durationHours || 0,
      pointsAwarded: eventData.pointsAwarded || 0,
      isVirtual: eventData.isVirtual || false,
      isRecurring: eventData.isRecurring || false,
      isSpecialEvent: eventData.isSpecialEvent || false,
      tags: eventData.tags || []
    });

    console.log('Forms initialized with values:', {
      basicInfo: this.basicInfoForm.value,
      location: this.locationForm.value,
      contact: this.contactForm.value,
      participant: this.participantForm.value,
      requirements: this.requirementsForm.value,
      additional: this.additionalForm.value,
      bannerImage: this.bannerImageForm.value
    });
  }

  onLocationSelected(location: LocationData): void {
    this.locationForm.patchValue({
      coordinates: location.coordinates,
      location: location.address
    });
  }

  addSkill(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      const skills = this.participantForm.get('requiredSkills')?.value || [];
      this.participantForm.patchValue({ requiredSkills: [...skills, value] });
      event.chipInput!.clear();
    }
  }

  removeSkill(skill: string): void {
    const skills = this.participantForm.get('requiredSkills')?.value || [];
    const index = skills.indexOf(skill);
    if (index >= 0) {
      skills.splice(index, 1);
      this.participantForm.patchValue({ requiredSkills: skills });
    }
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      const tags = this.additionalForm.get('tags')?.value || [];
      this.additionalForm.patchValue({ tags: [...tags, value] });
      event.chipInput!.clear();
    }
  }

  removeTag(tag: string): void {
    const tags = this.additionalForm.get('tags')?.value || [];
    const index = tags.indexOf(tag);
    if (index >= 0) {
      tags.splice(index, 1);
      this.additionalForm.patchValue({ tags: tags });
    }
  }

  onImageUploadClick(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.snackBar.open('File must be an image', 'Close', { duration: 3000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.bannerImageForm.patchValue({
          bannerImage: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeBannerImage(): void {
    this.bannerImageForm.patchValue({
      bannerImage: ''
    });
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid &&
           this.locationForm.valid &&
           this.contactForm.valid &&
           this.participantForm.valid &&
           this.requirementsForm.valid &&
           this.additionalForm.valid &&
           this.bannerImageForm.valid;
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.submitting = true;
      console.log('Starting event update process');

      // Get the event ID, handling both id and _id
      const eventId = this.event?._id;
      if (!eventId) {
        console.error('No event ID found');
        this.snackBar.open('Error: Event ID not found', 'Close', { duration: 3000 });
        this.submitting = false;
        return;
      }

      // Collect all form data
      const eventData = {
        ...this.event, // Preserve all existing event data first
        ...this.basicInfoForm.value,
        ...this.locationForm.value,
        ...this.contactForm.value,
        ...this.participantForm.value,
        ...this.requirementsForm.value,
        ...this.additionalForm.value,
        bannerImage: this.bannerImageForm.get('bannerImage')?.value,
        startDate: this.basicInfoForm.get('startDate')?.value,
        endDate: this.basicInfoForm.get('endDate')?.value,
        updatedAt: new Date()
      };

      // Validate dates
      const startDate = new Date(eventData.startDate);
      const endDate = new Date(eventData.endDate);
      
      if (endDate <= startDate) {
        this.snackBar.open('End date must be after start date', 'Close', { duration: 3000 });
        this.submitting = false;
        return;
      }

      console.log('Submitting event update with data:', eventData);

      // Dispatch update action with the new data
      this.store.dispatch(EventActions.updateEvent({ 
        id: eventId, 
        event: eventData 
      }));

      // Create a subscription to handle the update completion
      const subscription = this.store.select(selectSelectedEvent)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedEvent) => {
            if (updatedEvent) {
              console.log('Event updated successfully:', updatedEvent);
              this.snackBar.open('Event updated successfully', 'Close', { duration: 3000 });
              subscription.unsubscribe(); // Clean up subscription
              this.router.navigate(['/organization/events']);
            }
          },
          error: (error) => {
            console.error('Error updating event:', error);
            let errorMessage = 'Error updating event. Please try again.';
            if (error.status === 400) {
              errorMessage = 'Invalid event data. Please check all required fields.';
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
            this.submitting = false;
            subscription.unsubscribe(); // Clean up subscription
          }
        });
    } else {
      console.error('Form validation failed:', {
        basicInfo: this.basicInfoForm.errors,
        location: this.locationForm.errors,
        contact: this.contactForm.errors,
        participant: this.participantForm.errors,
        requirements: this.requirementsForm.errors,
        additional: this.additionalForm.errors
      });
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }
} 