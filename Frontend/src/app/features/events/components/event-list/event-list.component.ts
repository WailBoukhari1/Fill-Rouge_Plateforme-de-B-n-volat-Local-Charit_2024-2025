import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EventService } from '../../services/event.service';
import { AuthService } from '@core/services/auth.service';
import { EventFilters } from '@core/models/event.model';
import { EventResponse } from '@core/models/event.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserRole } from '@core/models/user.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { EventFiltersComponent } from '../event-filters/event-filters.component';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    EventFiltersComponent,
    EventCardComponent
  ],
  templateUrl: './event-list.component.html',
  standalone: true,
})
export class EventListComponent implements OnInit {
  events: EventResponse[] = [];
  loading = false;
  error: string | null = null;
  isOrganization$ = this.authService.hasRole(UserRole.ORGANIZATION);


  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(filters?: EventFilters): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEvents(filters).subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load events. Please try again.';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
      }
    });
  }

  onFiltersChange(filters: EventFilters): void {
    this.loadEvents(filters);
  }
} 