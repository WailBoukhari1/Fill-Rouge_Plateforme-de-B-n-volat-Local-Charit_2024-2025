import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-event-feedback',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Event Feedback</h1>
        <p class="text-gray-600">Share your experience and help us improve future events</p>
      </div>

      <!-- Event Info -->
      <mat-card class="mb-8">
        <mat-card-content class="p-6">
          <div class="flex items-start">
            <img [src]="event.imageUrl" [alt]="event.title" 
                 class="w-24 h-24 rounded object-cover mr-6">
            <div>
              <h2 class="text-2xl font-bold mb-2">{{event.title}}</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center">
                  <mat-icon class="text-gray-400 mr-2">event</mat-icon>
                  <span>{{event.date | date:'mediumDate'}}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="text-gray-400 mr-2">location_on</mat-icon>
                  <span>{{event.location}}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="text-gray-400 mr-2">group</mat-icon>
                  <span>{{event.organization}}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Feedback Form -->
      <mat-card>
        <mat-card-content class="p-6">
          @if (isLoading) {
            <div class="flex justify-center py-12">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (submitted) {
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-green-500 mb-4">check_circle</mat-icon>
              <h2 class="text-2xl font-bold mb-2">Thank You for Your Feedback!</h2>
              <p class="text-gray-600 mb-6">Your feedback helps us improve future events.</p>
              <button mat-raised-button color="primary" routerLink="/events">
                View More Events
              </button>
            </div>
          } @else {
            <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Overall Rating -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                <div class="flex items-center space-x-2">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button 
                      type="button"
                      mat-icon-button 
                      [color]="rating >= star ? 'accent' : ''"
                      (click)="setRating(star)">
                      <mat-icon>{{rating >= star ? 'star' : 'star_border'}}</mat-icon>
                    </button>
                  }
                </div>
              </div>

              <!-- Experience -->
              <mat-form-field class="w-full">
                <mat-label>How was your experience?</mat-label>
                <textarea 
                  matInput 
                  formControlName="experience"
                  rows="4"
                  placeholder="Share your thoughts about the event..."></textarea>
                @if (feedbackForm.get('experience')?.hasError('required') && feedbackForm.get('experience')?.touched) {
                  <mat-error>Please share your experience</mat-error>
                }
              </mat-form-field>

              <!-- Impact -->
              <mat-form-field class="w-full">
                <mat-label>What impact did this event have?</mat-label>
                <textarea 
                  matInput 
                  formControlName="impact"
                  rows="4"
                  placeholder="Describe the impact of this event..."></textarea>
              </mat-form-field>

              <!-- Areas for Improvement -->
              <mat-form-field class="w-full">
                <mat-label>Areas for Improvement</mat-label>
                <mat-select formControlName="improvements" multiple>
                  <mat-option value="organization">Organization</mat-option>
                  <mat-option value="communication">Communication</mat-option>
                  <mat-option value="resources">Resources & Materials</mat-option>
                  <mat-option value="schedule">Schedule & Timing</mat-option>
                  <mat-option value="location">Location & Venue</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Would Volunteer Again -->
              <mat-form-field class="w-full">
                <mat-label>Would you volunteer for this organization again?</mat-label>
                <mat-select formControlName="wouldVolunteerAgain">
                  <mat-option value="yes">Yes, definitely</mat-option>
                  <mat-option value="maybe">Maybe</mat-option>
                  <mat-option value="no">No</mat-option>
                </mat-select>
                @if (feedbackForm.get('wouldVolunteerAgain')?.hasError('required') && feedbackForm.get('wouldVolunteerAgain')?.touched) {
                  <mat-error>Please select an option</mat-error>
                }
              </mat-form-field>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button 
                  mat-raised-button 
                  color="primary"
                  type="submit"
                  [disabled]="feedbackForm.invalid || isSubmitting">
                  @if (isSubmitting) {
                    <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                    Submitting...
                  } @else {
                    Submit Feedback
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class EventFeedbackComponent implements OnInit {
  event: any = {};
  feedbackForm: FormGroup;
  rating = 0;
  isLoading = true;
  isSubmitting = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.feedbackForm = this.fb.group({
      experience: ['', Validators.required],
      impact: [''],
      improvements: [[]],
      wouldVolunteerAgain: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEventData();
  }

  loadEventData() {
    // TODO: Implement data loading from service
    setTimeout(() => {
      this.event = {
        title: 'Beach Cleanup Drive',
        imageUrl: 'https://source.unsplash.com/random/800x600/?beach',
        date: new Date('2024-04-15T09:00:00'),
        location: 'Miami Beach',
        organization: 'Ocean Conservation Society'
      };
      this.isLoading = false;
    }, 1000);
  }

  setRating(value: number) {
    this.rating = value;
  }

  onSubmit() {
    if (this.feedbackForm.valid && this.rating > 0) {
      this.isSubmitting = true;
      
      // TODO: Implement feedback submission to service
      const feedback = {
        ...this.feedbackForm.value,
        rating: this.rating,
        eventId: 1, // TODO: Get from route params
        submittedAt: new Date()
      };

      console.log('Submitting feedback:', feedback);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitted = true;
        this.snackBar.open('Thank you for your feedback!', 'Close', { duration: 3000 });
      }, 1500);
    } else {
      if (this.rating === 0) {
        this.snackBar.open('Please provide a rating', 'Close', { duration: 3000 });
      }
      Object.keys(this.feedbackForm.controls).forEach(key => {
        const control = this.feedbackForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
} 