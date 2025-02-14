import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Store } from '@ngrx/store';
import { EventActions } from '../../store/event.actions';
import { EventRequest } from '@core/models/event.model';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { FileService } from '@core/services/file.service';
import * as L from 'leaflet';

// Update icon URLs to use CDN
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

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
    MatSnackBarModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './event-form.component.html',
  styles: [`
    .map-container {
      height: 400px;
      width: 100%;
      position: relative;
      z-index: 0;
    }
  `]
})
export class EventFormComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('map') mapElement!: ElementRef;
  
  eventForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  readonly separatorKeysCodes = [ENTER, COMMA];
  requiredSkills: string[] = [];
  maxSkills = 5; // Maximum number of skills that can be selected
  
  // Multi-step form properties
  currentStep = 0;
  minDate = new Date();
  
  // Map properties
  marker: L.Marker | null = null;
  private map!: L.Map;
  mapCenter = { lat: 31.7917, lng: -6.0926 }; // Centered more on Morocco mainland
  mapZoom = 6;
  
  // Image properties
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // Fixed skills list with categories
  skillCategories = [
    {
      name: 'Healthcare',
      skills: ['First Aid', 'Medical Care', 'Mental Health Support', 'Elder Care']
    },
    {
      name: 'Education',
      skills: ['Teaching', 'Tutoring', 'Child Care', 'Training']
    },
    {
      name: 'Technical',
      skills: ['IT Support', 'Graphic Design', 'Social Media', 'Photography']
    },
    {
      name: 'Professional',
      skills: ['Administrative', 'Legal Aid', 'Accounting', 'Project Management']
    },
    {
      name: 'Community',
      skills: ['Event Planning', 'Food Distribution', 'Disaster Response', 'Fundraising']
    },
    {
      name: 'Practical',
      skills: ['Cooking', 'Driving', 'Construction', 'Manual Labor']
    },
    {
      name: 'Creative',
      skills: ['Writing', 'Music', 'Public Speaking', 'Translation']
    }
  ];

  // Flatten skills for search
  availableSkills = this.skillCategories.reduce((acc, category) => [...acc, ...category.skills], [] as string[]);
  filteredSkills: string[] = [];
  skillInputCtrl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store,
    private fileService: FileService
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      startDate: ['', [Validators.required, this.futureDateValidator()]],
      endDate: ['', [Validators.required, this.futureDateValidator()]],
      location: ['', Validators.required],
      maxParticipants: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      category: ['', Validators.required],
      requiredSkills: [[]],
      imageUrl: [''],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required]
    }, { validators: this.dateRangeValidator });

    // Initialize filtered skills
    this.filteredSkills = this.availableSkills;
  }

  // Multi-step form methods
  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    } else {
      this.markStepFieldsAsTouched();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    const controls = this.eventForm.controls;
    switch (step) {
      case 0: // Basic Info
        return controls['title'].valid && 
               controls['description'].valid && 
               controls['startDate'].valid && 
               controls['endDate'].valid && 
               controls['maxParticipants'].valid;
      case 1: // Location
        return controls['location'].valid && 
               controls['latitude'].valid && 
               controls['longitude'].valid;
      case 2: // Skills
        return this.requiredSkills.length > 0;
      case 3: // Image
        return true; // Image is optional
      default:
        return false;
    }
  }

  markStepFieldsAsTouched(): void {
    const controls = this.eventForm.controls;
    switch (this.currentStep) {
      case 0:
        controls['title'].markAsTouched();
        controls['description'].markAsTouched();
        controls['startDate'].markAsTouched();
        controls['endDate'].markAsTouched();
        controls['maxParticipants'].markAsTouched();
        break;
      case 1:
        controls['location'].markAsTouched();
        controls['latitude'].markAsTouched();
        controls['longitude'].markAsTouched();
        break;
      case 2:
        controls['requiredSkills'].markAsTouched();
        break;
    }
  }

  getWordCount(text: string): number {
    return text ? text.trim().split(/\s+/).length : 0;
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.isEditing = true;
      this.loadEvent(eventId);
    }

    // Set up skill filtering
    this.skillInputCtrl.valueChanges.subscribe(value => {
      this.filteredSkills = this._filterSkills(value || '');
    });
  }

  ngAfterViewInit() {
    // Delay map initialization to ensure the container is ready
    setTimeout(() => {
      this.initializeMap();
    }, 0);
  }

  private initializeMap() {
    try {
      if (this.mapElement && this.mapElement.nativeElement) {
        // Initialize the map
        this.map = L.map(this.mapElement.nativeElement).setView(
          [this.mapCenter.lat, this.mapCenter.lng],
          this.mapZoom
        );

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add click handler
        this.map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          this.updateMarker(lat, lng);
        });

        // Force a resize after a short delay
        setTimeout(() => {
          this.map.invalidateSize();
        }, 200);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private updateMarker(lat: number, lng: number) {
    try {
      // Remove existing marker if any
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      // Create marker icon
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add new marker
      this.marker = L.marker([lat, lng], { icon }).addTo(this.map);

      // Update form values
      this.eventForm.patchValue({
        latitude: lat,
        longitude: lng
      });
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          this.selectedImage = file;
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreview = reader.result as string;
          };
          reader.readAsDataURL(file);
        } else {
          this.snackBar.open('Image size must be less than 10MB', 'Close', { duration: 3000 });
        }
      } else {
        this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      }
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.fileInput.nativeElement.value = '';
  }

  private async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await firstValueFrom(this.fileService.uploadFile(formData));
      if (!response || !response.data) {
        throw new Error('Invalid upload response');
      }
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      this.snackBar.open('Failed to upload image. Please try again.', 'Close', { duration: 3000 });
      throw error;
    }
  }

  async onSubmit() {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.eventForm.value;
    
    try {
      let imageUrl: string | undefined;
      if (this.selectedImage) {
        try {
          imageUrl = await this.uploadImage(this.selectedImage);
        } catch (error) {
          this.errorMessage = 'Failed to upload image. Please try again.';
          this.isSubmitting = false;
          return;
        }
      }
      
      const eventRequest: EventRequest = {
        title: formValue.title,
        description: formValue.description,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        location: formValue.location,
        maxParticipants: formValue.maxParticipants,
        category: formValue.category,
        requiredSkills: this.requiredSkills,
        imageUrl: imageUrl,
        latitude: formValue.latitude,
        longitude: formValue.longitude
      };

      if (this.isEditing) {
        const eventId = this.route.snapshot.paramMap.get('id')!;
        this.store.dispatch(EventActions.updateEvent({ id: eventId, event: eventRequest }));
      } else {
        this.store.dispatch(EventActions.createEvent({ event: eventRequest }));
      }

      this.router.navigate(['/events']);
    } catch (error) {
      this.errorMessage = 'An error occurred while saving the event. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  addSkill(event: any): void {
    const value = (event.value || '').trim();
    
    if (value && this.availableSkills.includes(value)) {
      if (this.requiredSkills.length >= this.maxSkills) {
        this.snackBar.open(`Maximum ${this.maxSkills} skills allowed`, 'Close', { duration: 3000 });
        return;
      }
      
      if (!this.requiredSkills.includes(value)) {
        this.requiredSkills.push(value);
        this.eventForm.get('requiredSkills')?.setValue(this.requiredSkills);
      }
    }

    // Clear the input
    if (event.chipInput) {
      event.chipInput.clear();
    }
    this.skillInputCtrl.setValue('');
  }

  removeSkill(skill: string): void {
    const index = this.requiredSkills.indexOf(skill);
    if (index >= 0) {
      this.requiredSkills.splice(index, 1);
      this.eventForm.get('requiredSkills')?.setValue(this.requiredSkills);
    }
  }

  onCancel(): void {
    this.router.navigate(['/events']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.eventForm.get(fieldName);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control.hasError('pastDate')) {
      return 'Date must be in the future';
    }
    if (control.hasError('min')) {
      return 'Value must be at least 1';
    }
    if (control.hasError('max')) {
      return 'Value must not exceed 1000';
    }
    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control.hasError('maxlength')) {
      return `Maximum length is ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    if (fieldName === 'endDate' && this.eventForm.hasError('dateRange')) {
      return 'End date must be after start date';
    }
    return '';
  }

  private loadEvent(id: string) {
    // Load event logic here
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private futureDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const date = new Date(control.value);
      const now = new Date();
      return date > now ? null : { pastDate: true };
    };
  }

  private dateRangeValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;
    return new Date(start) < new Date(end) ? null : { dateRange: true };
  }

  private _filterSkills(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableSkills
      .filter(skill => skill.toLowerCase().includes(filterValue))
      .filter(skill => !this.requiredSkills.includes(skill));
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
} 