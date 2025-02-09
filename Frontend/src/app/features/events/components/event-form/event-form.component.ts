import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule, MatChipGrid, MatChipInput } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../services/event.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

const MOROCCO_BOUNDS = {
  north: 35.9222, // Northern boundary
  south: 27.6666, // Southern boundary
  east: -1.0000,  // Eastern boundary
  west: -13.1666  // Western boundary
};

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    GoogleMapsModule
  ]
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  loading = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  commonSkills = [
    'Teaching',
    'Mentoring',
    'Healthcare',
    'Technology',
    'Environment',
    'Social Work',
    'Construction',
    'Arts & Culture',
    'Sports & Recreation',
    'Administration'
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.isEditMode = true;
      this.loadEvent(eventId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      dateTime: ['', Validators.required],
      location: ['', Validators.required],
      requiredSkills: [[]],
      volunteersNeeded: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      latitude: [31.7917, [Validators.required, Validators.min(MOROCCO_BOUNDS.south), Validators.max(MOROCCO_BOUNDS.north)]],
      longitude: [-7.0926, [Validators.required, Validators.min(MOROCCO_BOUNDS.west), Validators.max(MOROCCO_BOUNDS.east)]]
    });
  }

  private loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.eventForm.patchValue({
          title: event.title,
          description: event.description,
          dateTime: new Date(event.dateTime),
          location: event.location,
          requiredSkills: event.requiredSkills,
          volunteersNeeded: event.volunteersNeeded,
          latitude: event.latitude,
          longitude: event.longitude
        });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load event', 'Close', { duration: 3000 });
        this.router.navigate(['/events']);
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    this.loading = true;
    const eventData = this.eventForm.value;

    const request$ = this.isEditMode
      ? this.eventService.updateEvent(this.route.snapshot.paramMap.get('id')!, eventData)
      : this.eventService.createEvent(eventData);

    request$.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Event updated successfully' : 'Event created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.router.navigate(['/events']);
      },
      error: () => {
        const message = this.isEditMode ? 'Failed to update event' : 'Failed to create event';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentSkills = this.eventForm.get('requiredSkills')?.value || [];
      this.eventForm.patchValue({
        requiredSkills: [...currentSkills, value]
      });
    }
    event.chipInput!.clear();
  }

  removeSkill(skill: string): void {
    const currentSkills = this.eventForm.get('requiredSkills')?.value || [];
    this.eventForm.patchValue({
      requiredSkills: currentSkills.filter((s: string) => s !== skill)
    });
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.eventForm.patchValue({
        latitude: lat,
        longitude: lng
      });
    }
  }

  addCommonSkill(skill: string): void {
    const currentSkills = this.eventForm.get('requiredSkills')?.value || [];
    if (!currentSkills.includes(skill)) {
      this.eventForm.patchValue({
        requiredSkills: [...currentSkills, skill]
      });
    }
  }
} 