import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Submit Event Feedback</h2>
    <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="rating-section">
          <label>Rating</label>
          <div class="stars">
            <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                     (click)="setRating(star)"
                     [class.filled]="star <= feedbackForm.get('rating')?.value">
              star
            </mat-icon>
          </div>
          <mat-slider min="1" max="5" step="1" discrete>
            <input matSliderThumb formControlName="rating">
          </mat-slider>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Your Feedback</mat-label>
          <textarea matInput
                    formControlName="comment"
                    rows="4"
                    placeholder="Share your experience with this event..."></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="!feedbackForm.valid || submitting">
          {{ submitting ? 'Submitting...' : 'Submit' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .rating-section {
      margin-bottom: 20px;
    }

    .stars {
      display: flex;
      gap: 4px;
      margin: 8px 0;
    }

    .stars .mat-icon {
      cursor: pointer;
      color: #ccc;
      transition: color 0.2s;

      &.filled {
        color: #ffd700;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 400px;
      max-width: 500px;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class FeedbackDialogComponent {
  feedbackForm: FormGroup;
  submitting = false;

  constructor(
    private dialogRef: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { eventId: string },
    private fb: FormBuilder,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {
    this.feedbackForm = this.fb.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  setRating(rating: number): void {
    this.feedbackForm.patchValue({ rating });
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      this.submitting = true;
      const { rating, comment } = this.feedbackForm.value;

      this.eventService.submitEventFeedback(this.data.eventId, {
        rating,
        comment
      }).subscribe({
        next: () => {
          this.snackBar.open('Feedback submitted successfully', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to submit feedback', 'Close', {
            duration: 3000
          });
        },
        complete: () => {
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 