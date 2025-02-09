import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Event, EventStatus } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user.model';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class EventCardComponent {
  @Input() event!: Event;
  
  isVolunteer$ = this.authService.getCurrentUser().pipe(
    map(user => user?.roles?.includes(UserRole.VOLUNTEER)),
    shareReplay(1)
  );
  EventStatus = EventStatus; // For template usage

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister(): void {
    this.eventService.registerForEvent(this.event.id).subscribe({
      next: () => {
        this.event.isRegistered = true;
        this.event.registeredVolunteers++;
        this.snackBar.open('Successfully registered for event', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to register for event', 'Close', { duration: 3000 });
      }
    });
  }

  onCancelRegistration(): void {
    this.eventService.cancelRegistration(this.event.id).subscribe({
      next: () => {
        this.event.isRegistered = false;
        this.event.registeredVolunteers--;
        this.snackBar.open('Registration cancelled', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to cancel registration', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 