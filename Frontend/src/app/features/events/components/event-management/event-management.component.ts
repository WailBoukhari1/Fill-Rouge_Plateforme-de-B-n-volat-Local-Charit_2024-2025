import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatChip } from '@angular/material/chips';
import { RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Event } from '../../../../core/models/event.model';
import { EventActions } from '../../store/event.actions';
import { selectAllEvents, selectEventsLoading, selectEventsError } from '../../store/event.selectors';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventState } from '../../store/event.state';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    RouterLink,
    MatProgressSpinnerModule
  ],
  templateUrl: './event-management.component.html',
})
export class EventManagementComponent implements OnInit {
  events$: Observable<Event[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  displayedColumns: string[] = [
    'title',
    'dateTime',
    'location',
    'status',
    'volunteersNeeded',
    'registeredVolunteers',
    'actions'
  ];

  constructor(
    private store: Store<{ events: EventState }>,
    private router: Router
  ) {
    this.events$ = this.store.select(selectAllEvents);
    this.loading$ = this.store.select(selectEventsLoading);
    this.error$ = this.store.select(selectEventsError);
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.store.dispatch(EventActions.loadEvents({}));
  }

  onCreateEvent(): void {
    this.router.navigate(['/dashboard/events/create']);
  }

  onDeleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.store.dispatch(EventActions.deleteEvent({ id }));
    }
  }

  getStatusChipColor(status: string): string {
    switch (status) {
      case 'UPCOMING':
        return 'primary';
      case 'IN_PROGRESS':
        return 'accent';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }
}