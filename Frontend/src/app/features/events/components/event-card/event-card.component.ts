import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { EventStatus } from '../../../../core/models/event-status.enum';
import { EventResponse } from '@core/models/event.model';
import { EventService } from '../../services/event.service';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './event-card.component.html'
})
export class EventCardComponent {
  @Input() event!: EventResponse;
  
  EventStatus = EventStatus;
  isVolunteer$ = this.authService.hasRole(UserRole.VOLUNTEER);

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  onRegister(): void {
    this.eventService.registerForEvent(this.event.id).subscribe({
      next: (updatedEvent) => {
        this.event = updatedEvent;
      },
      error: (error) => {
        console.error('Failed to register for event:', error);
      }
    });
  }

  onCancelRegistration(): void {
    this.eventService.cancelRegistration(this.event.id).subscribe({
      next: () => {
        this.event.isRegistered = false;
        this.event.registeredVolunteers--;
      },
      error: (error) => {
        console.error('Failed to cancel registration:', error);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 