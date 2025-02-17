import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatStepperModule
  ],
  template: `
    <section class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button mat-icon-button routerLink="/dashboard/events">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode ? 'Edit Event' : 'Create Event' }}</h1>
            <p class="text-gray-600">{{ isEditMode ? 'Update your event details' : 'Create a new volunteer event' }}</p>
          </div>
        </div>
      </div>

      <!-- Stepper Form -->
      <mat-stepper [linear]="true" #stepper class="bg-white rounded-lg shadow-sm">
        <!-- Basic Information -->
        <mat-step [stepControl]="basicInfoForm">
          <ng-template matStepLabel>Basic Information</ng-template>
          <form [formGroup]="basicInfoForm" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Event Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter event title">
                <mat-error *ngIf="basicInfoForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="ENVIRONMENT">Environment</mat-option>
                  <mat-option value="EDUCATION">Education</mat-option>
                  <mat-option value="HEALTHCARE">Healthcare</mat-option>
                  <mat-option value="COMMUNITY">Community</mat-option>
                </mat-select>
                <mat-error *ngIf="basicInfoForm.get('category')?.hasError('required')">
                  Category is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4"
                          placeholder="Describe your event"></textarea>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Start Date & Time</mat-label>
                <input matInput formControlName="startDate" [matDatepicker]="startPicker">
                <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error *ngIf="basicInfoForm.get('startDate')?.hasError('required')">
                  Start date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>End Date & Time</mat-label>
                <input matInput formControlName="endDate" [matDatepicker]="endPicker">
                <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                <mat-error *ngIf="basicInfoForm.get('endDate')?.hasError('required')">
                  End date is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="flex justify-end mt-6">
              <button mat-raised-button color="primary" matStepperNext>
                Next
                <mat-icon class="ml-2">arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Location & Capacity -->
        <mat-step [stepControl]="locationForm">
          <ng-template matStepLabel>Location & Capacity</ng-template>
          <form [formGroup]="locationForm" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" placeholder="Event location">
                <mat-error *ngIf="locationForm.get('location')?.hasError('required')">
                  Location is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Maximum Participants</mat-label>
                <input matInput type="number" formControlName="maxParticipants">
                <mat-error *ngIf="locationForm.get('maxParticipants')?.hasError('required')">
                  Maximum participants is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Minimum Age</mat-label>
                <input matInput type="number" formControlName="minimumAge">
              </mat-form-field>

              <div class="md:col-span-2">
                <mat-slide-toggle formControlName="waitlistEnabled" class="mb-4">
                  Enable Waitlist
                </mat-slide-toggle>
              </div>

              @if (locationForm.get('waitlistEnabled')?.value) {
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Maximum Waitlist Size</mat-label>
                  <input matInput type="number" formControlName="maxWaitlistSize">
                </mat-form-field>
              }
            </div>

            <div class="flex justify-between mt-6">
              <button mat-button matStepperPrevious>
                <mat-icon class="mr-2">arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" matStepperNext>
                Next
                <mat-icon class="ml-2">arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Requirements & Impact -->
        <mat-step [stepControl]="requirementsForm">
          <ng-template matStepLabel>Requirements & Impact</ng-template>
          <form [formGroup]="requirementsForm" class="p-6">
            <div class="grid grid-cols-1 gap-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Required Skills</mat-label>
                <mat-chip-grid #chipGrid aria-label="Required skills">
                  @for (skill of skills; track skill) {
                    <mat-chip-row (removed)="removeSkill(skill)">
                      {{skill}}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  }
                </mat-chip-grid>
                <input placeholder="New skill..."
                       [matChipInputFor]="chipGrid"
                       (matChipInputTokenEnd)="addSkill($event)">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Impact Summary</mat-label>
                <textarea matInput formControlName="impactSummary" rows="4"
                          placeholder="Describe the impact of this event"></textarea>
              </mat-form-field>

              <div>
                <mat-slide-toggle formControlName="requiresBackground" class="mb-4">
                  Requires Background Check
                </mat-slide-toggle>
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <button mat-button matStepperPrevious>
                <mat-icon class="mr-2">arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" (click)="onSubmit()">
                {{ isEditMode ? 'Update' : 'Create' }} Event
                <mat-icon class="ml-2">check</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </section>
  `
})
export class EventFormComponent implements OnInit {
  isEditMode = false;
  basicInfoForm: FormGroup;
  locationForm: FormGroup;
  requirementsForm: FormGroup;
  skills: string[] = [];

  constructor(private fb: FormBuilder) {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.locationForm = this.fb.group({
      location: ['', Validators.required],
      maxParticipants: [null, [Validators.required, Validators.min(1)]],
      minimumAge: [0, Validators.min(0)],
      waitlistEnabled: [true],
      maxWaitlistSize: [50]
    });

    this.requirementsForm = this.fb.group({
      impactSummary: [''],
      requiresBackground: [false]
    });
  }

  ngOnInit(): void {
    // TODO: If in edit mode, fetch event details and patch form
  }

  addSkill(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.skills.push(value);
      event.chipInput!.clear();
    }
  }

  removeSkill(skill: string): void {
    const index = this.skills.indexOf(skill);
    if (index >= 0) {
      this.skills.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.basicInfoForm.valid && this.locationForm.valid && this.requirementsForm.valid) {
      const eventData = {
        ...this.basicInfoForm.value,
        ...this.locationForm.value,
        ...this.requirementsForm.value,
        requiredSkills: this.skills
      };
      
      // TODO: Submit to service
      console.log('Submitting event:', eventData);
    }
  }
} 