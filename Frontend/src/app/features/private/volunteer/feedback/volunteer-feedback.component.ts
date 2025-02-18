import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { EventService } from '../../../../core/services/event.service';
import { RatingComponent } from '../../../../shared/components/rating/rating.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IEvent } from '../../../../core/models/event.types';
import * as EventActions from '../../../../store/event/event.actions';
import * as EventSelectors from '../../../../store/event/event.selectors';

@Component({
  selector: 'app-volunteer-feedback',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RatingComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Event Feedback</mat-card-title>
          <mat-card-subtitle>{{eventDetails?.title}}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()" class="space-y-4 p-4">
            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
              <app-rating [value]="feedbackForm.get('rating')?.value" 
                         (valueChange)="feedbackForm.get('rating')?.setValue($event)">
              </app-rating>
            </div>

            <!-- Feedback Text -->
            <mat-form-field class="w-full">
              <mat-label>Your Feedback</mat-label>
              <textarea matInput formControlName="feedback" rows="4" 
                        placeholder="Share your experience about this event..."></textarea>
              <mat-error *ngIf="feedbackForm.get('feedback')?.hasError('required')">
                Feedback is required
              </mat-error>
            </mat-form-field>

            <!-- Areas for Improvement -->
            <mat-form-field class="w-full">
              <mat-label>Areas for Improvement</mat-label>
              <mat-select formControlName="improvementAreas" multiple>
                <mat-option value="organization">Organization</mat-option>
                <mat-option value="communication">Communication</mat-option>
                <mat-option value="resources">Resources</mat-option>
                <mat-option value="schedule">Schedule</mat-option>
                <mat-option value="facilities">Facilities</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Highlights -->
            <mat-form-field class="w-full">
              <mat-label>Event Highlights</mat-label>
              <mat-select formControlName="highlights" multiple>
                <mat-option value="teamwork">Teamwork</mat-option>
                <mat-option value="impact">Community Impact</mat-option>
                <mat-option value="learning">Learning Experience</mat-option>
                <mat-option value="networking">Networking</mat-option>
                <mat-option value="organization">Organization</mat-option>
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
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions class="p-4">
          <button mat-raised-button color="primary" 
                  [disabled]="!feedbackForm.valid || loading"
                  (click)="onSubmit()">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Submit Feedback</span>
          </button>
          <button mat-button (click)="goBack()">Cancel</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class VolunteerFeedbackComponent implements OnInit {
  feedbackForm: FormGroup;
  loading = false;
  eventDetails: IEvent | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.feedbackForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      feedback: ['', Validators.required],
      improvementAreas: [[]],
      highlights: [[]],
      wouldVolunteerAgain: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.params['eventId'];
    if (eventId) {
      this.loadEventDetails(eventId);
    } else {
      this.router.navigate(['/dashboard/events']);
    }
  }

  loadEventDetails(eventId: string): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (event: IEvent) => this.eventDetails = event,
      error: (error: any) => {
        console.error('Error loading event details:', error);
        this.snackBar.open('Error loading event details', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.valid && this.eventDetails) {
      this.loading = true;
      this.eventService.submitEventFeedback(this.eventDetails.id, this.feedbackForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard/events']);
        },
        error: (error) => {
          console.error('Error submitting feedback:', error);
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/events']);
  }
} 