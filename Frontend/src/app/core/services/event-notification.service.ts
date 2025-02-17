import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventNotificationService {
  constructor(
    private snackBar: MatSnackBar,
    private store: Store
  ) {}

  notifyEventCreated(): void {
    this.snackBar.open(
      'Event created successfully! It will be reviewed by our team.',
      'Close',
      { duration: 5000 }
    );
  }

  notifyEventUpdated(): void {
    this.snackBar.open(
      'Event updated successfully!',
      'Close',
      { duration: 3000 }
    );
  }

  notifyRegistrationSuccess(): void {
    this.snackBar.open(
      'Successfully registered for the event!',
      'Close',
      { duration: 3000 }
    );
  }

  notifyRegistrationPending(): void {
    this.snackBar.open(
      'Registration request submitted. Awaiting organizer approval.',
      'Close',
      { duration: 5000 }
    );
  }

  notifyUnregistrationSuccess(): void {
    this.snackBar.open(
      'Successfully unregistered from the event.',
      'Close',
      { duration: 3000 }
    );
  }

  notifyWaitlistJoined(): void {
    this.snackBar.open(
      'Added to the waitlist. We\'ll notify you if a spot becomes available.',
      'Close',
      { duration: 5000 }
    );
  }

  notifyWaitlistLeft(): void {
    this.snackBar.open(
      'Removed from the waitlist.',
      'Close',
      { duration: 3000 }
    );
  }

  notifyCheckInSuccess(): void {
    this.snackBar.open(
      'Successfully checked in to the event!',
      'Close',
      { duration: 3000 }
    );
  }

  notifyPointsAwarded(points: number): void {
    this.snackBar.open(
      `Congratulations! You've earned ${points} points!`,
      'Close',
      { duration: 5000 }
    );
  }

  notifyEventCancelled(): void {
    this.snackBar.open(
      'Event has been cancelled. Registered participants will be notified.',
      'Close',
      { duration: 5000 }
    );
  }

  notifyError(error: string): void {
    this.snackBar.open(
      `Error: ${error}`,
      'Close',
      { 
        duration: 5000,
        panelClass: ['error-snackbar']
      }
    );
  }

  notifyOrganizer(message: string): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      if (user?.role === 'ORGANIZATION') {
        this.snackBar.open(
          message,
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  notifyVolunteer(message: string): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      if (user?.role === 'VOLUNTEER') {
        this.snackBar.open(
          message,
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
} 