import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { EventCategory } from '../../../../core/models/event.model';

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
    MatIconModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">
          {{isEditMode ? 'Edit Event' : 'Create New Event'}}
        </h1>

        <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold mb-4">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Event Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter event title">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  @for(category of categories; track category) {
                    <mat-option [value]="category">{{category}}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4"></textarea>
              </mat-form-field>
            </div>
          </div>

          <!-- Date and Time -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold mb-4">Date and Time</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Registration Deadline</mat-label>
                <input matInput [matDatepicker]="deadlinePicker" formControlName="registrationDeadline">
                <mat-datepicker-toggle matSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
                <mat-datepicker #deadlinePicker></mat-datepicker>
              </mat-form-field>
            </div>
          </div>

          <!-- Location and Capacity -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold mb-4">Location and Capacity</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" placeholder="Event location">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Maximum Participants</mat-label>
                <input matInput type="number" formControlName="maxParticipants">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Minimum Age</mat-label>
                <input matInput type="number" formControlName="minimumAge">
              </mat-form-field>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-4">
            <a mat-button routerLink="..">Cancel</a>
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="eventForm.invalid || isSubmitting">
              {{isEditMode ? 'Update Event' : 'Create Event'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categories = Object.values(EventCategory);

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      registrationDeadline: ['', Validators.required],
      location: ['', Validators.required],
      maxParticipants: [20, [Validators.required, Validators.min(1)]],
      minimumAge: [18, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    // TODO: Load event data if in edit mode
  }

  onSubmit() {
    if (this.eventForm.valid) {
      console.log('Form data:', this.eventForm.value);
      // TODO: Implement event creation/update
    }
  }
} 