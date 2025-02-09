import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { EventService } from '../../services/event.service';
import { EventRequest } from '../../../../core/models/event.model';
import * as L from 'leaflet';

const MOROCCO_BOUNDS: L.LatLngBoundsExpression = [
  [35.9222, -13.1666], // North West
  [27.6666, -1.0000]   // South East
];

@Component({
  selector: 'app-event-form',
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
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterLink,
    MatSnackBarModule
  ],
  templateUrl: './event-form.component.html'
})
export class EventFormComponent implements OnInit, AfterViewInit {
  eventForm: FormGroup;
  isEditMode = false;
  loading = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // Map properties
  private map!: L.Map;
  private marker: L.Marker | null = null;
  mapCenter = { lat: 31.7917, lng: -7.0926 }; // Morocco center

  commonSkills = [
    'Teaching',
    'First Aid',
    'Organization',
    'Leadership',
    'Manual Labor',
    'Communication',
    'Technical',
    'Medical'
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      dateTime: ['', Validators.required],
      location: ['', Validators.required],
      requiredSkills: [[]],
      volunteersNeeded: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      latitude: [31.7917, [Validators.required, Validators.min(27.6666), Validators.max(35.9222)]],
      longitude: [-7.0926, [Validators.required, Validators.min(-13.1666), Validators.max(-1.0000)]]
    });
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.isEditMode = true;
      this.loadEvent(eventId);
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    const lat = this.eventForm.get('latitude')?.value || this.mapCenter.lat;
    const lng = this.eventForm.get('longitude')?.value || this.mapCenter.lng;

    this.map = L.map('map', {
      center: [lat, lng],
      zoom: 6,
      maxBounds: MOROCCO_BOUNDS,
      minZoom: 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    if (this.isEditMode && lat && lng) {
      this.addMarker([lat, lng]);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const latlng = e.latlng;
      if (this.isWithinMorocco(latlng)) {
        this.addMarker([latlng.lat, latlng.lng]);
        this.eventForm.patchValue({
          latitude: latlng.lat,
          longitude: latlng.lng
        });
      } else {
        this.snackBar.open('Please select a location within Morocco', 'Close', { duration: 3000 });
      }
    });
  }

  private addMarker(latlng: [number, number]): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker(latlng).addTo(this.map);
  }

  private isWithinMorocco(latlng: L.LatLng): boolean {
    return latlng.lat >= 27.6666 && latlng.lat <= 35.9222 &&
           latlng.lng >= -13.1666 && latlng.lng <= -1.0000;
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formValue = this.eventForm.value;
    const eventRequest: EventRequest = {
      title: formValue.title,
      description: formValue.description,
      dateTime: formValue.dateTime.toISOString(),
      location: formValue.location,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      requiredSkills: formValue.requiredSkills,
      volunteersNeeded: formValue.volunteersNeeded
    };

    const request$ = this.isEditMode
      ? this.eventService.updateEvent(this.route.snapshot.paramMap.get('id')!, eventRequest)
      : this.eventService.createEvent(eventRequest);

    request$.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Event updated successfully' : 'Event created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/events']);
      },
      error: (error) => {
        this.snackBar.open('Error: ' + error.message, 'Close', { duration: 3000 });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentSkills = this.eventForm.get('requiredSkills')?.value || [];
      if (!currentSkills.includes(value)) {
        this.eventForm.patchValue({
          requiredSkills: [...currentSkills, value]
        });
      }
    }
    event.chipInput!.clear();
  }

  removeSkill(skill: string): void {
    const currentSkills = this.eventForm.get('requiredSkills')?.value || [];
    const index = currentSkills.indexOf(skill);
    if (index >= 0) {
      const updatedSkills = [...currentSkills];
      updatedSkills.splice(index, 1);
      this.eventForm.patchValue({
        requiredSkills: updatedSkills
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

  private loadEvent(id: string) {
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
      error: (error) => {
        this.snackBar.open('Error loading event: ' + error.message, 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/events']);
      }
    });
  }
} 