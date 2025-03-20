import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Event, EventStatus, IEvent } from '../../../../core/models/event.model';
import { EventService } from '../../../../core/services/event.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FeedbackDialogComponent } from '../../../../shared/components/feedback-dialog/feedback-dialog.component';
import * as EventActions from '../../../../store/event/event.actions';
import { 
  selectSelectedEvent,
  selectEventLoading,
  selectEventError
} from '../../../../store/event/event.selectors';

@Component({
  selector: 'app-volunteer-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatListModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="event-details-container">
      <ng-container *ngIf="event$ | async as event; else loading">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ event.title }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip-set>
                <mat-chip [color]="getStatusColor(event.status)" selected>
                  {{ event.status }}
                </mat-chip>
              </mat-chip-set>
            </mat-card-subtitle>
          </mat-card-header>

          <img *ngIf="event.imageUrl" [src]="event.imageUrl" alt="Event image" mat-card-image>

          <mat-card-content>
            <div class="event-info">
              <p class="description">{{ event.description }}</p>

              <div class="details-grid">
                <div class="detail-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>{{ event.startDate | date:'medium' }} - {{ event.endDate | date:'medium' }}</span>
                </div>

                <div class="detail-item">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ event.location }}</span>
                </div>

                <div class="detail-item">
                  <mat-icon>business</mat-icon>
                  <span>{{ event.organizationName }}</span>
                </div>

                <div class="detail-item">
                  <mat-icon>group</mat-icon>
                  <span>{{ event.currentParticipants }} / {{ event.maxParticipants }} participants</span>
                </div>
              </div>

              <div class="skills-section" *ngIf="event.requiredSkills?.length">
                <h3>Required Skills</h3>
                <mat-chip-set>
                  <mat-chip *ngFor="let skill of event.requiredSkills">
                    {{ skill }}
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="schedule-section" *ngIf="event.schedule?.length">
                <h3>Schedule</h3>
                <mat-list>
                  <mat-list-item *ngFor="let item of event.schedule">
                    <mat-icon matListIcon>schedule</mat-icon>
                    <h4 matLine>{{ item.time }}</h4>
                    <p matLine>{{ item.activity }}</p>
                  </mat-list-item>
                </mat-list>
              </div>

              <div class="feedback-section" *ngIf="event.feedback">
                <h3>Your Feedback</h3>
                <mat-card>
                  <mat-card-content>
                    <div class="rating">
                      <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                              [class.filled]="star <= event.feedback.rating">
                        star
                      </mat-icon>
                    </div>
                    <p>{{ event.feedback.comment }}</p>
                    <small>Submitted on {{ event.feedback.createdAt | date }}</small>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button *ngIf="!event.isRegistered && canRegister(event)"
                    (click)="registerForEvent(event.id)">
              REGISTER
            </button>
            <button mat-button *ngIf="event.isRegistered"
                    (click)="cancelRegistration(event.id)">
              CANCEL REGISTRATION
            </button>
            <button mat-button *ngIf="event.status === 'COMPLETED' && !event.feedback"
                    (click)="submitFeedback(event.id)">
              SUBMIT FEEDBACK
            </button>
          </mat-card-actions>
        </mat-card>
      </ng-container>

      <ng-template #loading>
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      </ng-template>

      <mat-card *ngIf="error$ | async as error" class="error-card">
        <mat-card-content>
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .event-details-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .skills-section, .schedule-section, .feedback-section {
      margin: 2rem 0;
    }

    .rating {
      display: flex;
      gap: 4px;
      margin: 8px 0;
    }

    .rating .mat-icon {
      color: #ffd700;
    }

    .error-card {
      margin-top: 1rem;
      background-color: #ffebee;
    }

    .error-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class VolunteerEventDetailsComponent implements OnInit {
  event$: Observable<IEvent>;
  loading$: Observable<boolean>;
  error$ = new Observable<string>();
  EventStatus = EventStatus;
  feedbackForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.event$ = this.route.params.pipe(
      switchMap(params => this.eventService.getEventById(params['id'])),
      map(event => ({
        ...event,
        currentParticipants: event?.participantCount || 0,
        schedule: [],
        tags: Array.from(event?.tags || [])
      } as IEvent)),
      catchError(error => {
        this.error$ = of(error.message || 'Failed to load event details');
        return of({} as IEvent);
      })
    );
    this.loading$ = this.store.select(selectEventLoading);

    this.feedbackForm = this.fb.group({
      rating: ['', Validators.required],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.refreshEventDetails();
  }

  private refreshEventDetails(): void {
    this.event$ = this.route.params.pipe(
      switchMap(params => this.eventService.getEventById(params['id'])),
      map(event => ({
        ...event,
        currentParticipants: event?.participantCount || 0,
        schedule: [],
        tags: Array.from(event?.tags || [])
      } as IEvent)),
      catchError(error => {
        this.error$ = of(error.message || 'Failed to load event details');
        return of({} as IEvent);
      })
    );
  }

  getStatusColor(status: EventStatus): string {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'primary';
      case EventStatus.COMPLETED:
        return 'accent';
      case EventStatus.CANCELLED:
        return 'warn';
      default:
        return '';
    }
  }

  canRegister(event: IEvent): boolean {
    return event.status === EventStatus.ACTIVE && 
           event.currentParticipants < event.maxParticipants;
  }

  registerForEvent(eventId: string): void {
    this.eventService.registerForEvent(eventId).subscribe({
      next: () => {
        this.snackBar.open('Successfully registered for event', 'Close', {
          duration: 3000
        });
        this.refreshEventDetails();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to register for event', 'Close', {
          duration: 3000
        });
      }
    });
  }

  cancelRegistration(eventId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Registration',
        message: 'Are you sure you want to cancel your registration for this event?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.cancelRegistration(eventId).subscribe({
          next: () => {
            this.snackBar.open('Successfully cancelled registration', 'Close', {
              duration: 3000
            });
            this.refreshEventDetails();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to cancel registration', 'Close', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  submitFeedback(eventId: string): void {
    const dialogConfig: MatDialogConfig = {
      width: '500px',
      data: { eventId }
    };

    const dialogRef = this.dialog.open(FeedbackDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshEventDetails();
      }
    });
  }
} 
