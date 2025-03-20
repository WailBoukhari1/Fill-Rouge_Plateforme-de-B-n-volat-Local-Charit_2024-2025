import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { EventService } from '../../../../core/services/event.service';
import { IEvent, IEventFilters, EventCategory } from '../../../../core/models/event.types';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    RouterLink,
    RouterModule,
    MatPaginatorModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  // Filter form
  filterForm = new FormGroup({
    search: new FormControl<string | undefined>(undefined),
    category: new FormControl<EventCategory | undefined>(undefined),
    startDate: new FormControl<Date | undefined>(undefined),
    location: new FormControl<string | undefined>(undefined)
  });

  // Categories for filter
  categories = Object.values(EventCategory);

  events: IEvent[] = [];
  filteredEvents: IEvent[] = [];
  isLoading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  totalEvents = 0;

  constructor(
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadEvents();
    
    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadEvents(filters?: IEventFilters) {
    this.isLoading = true;
    this.error = null;

    this.eventService.getEvents(filters || {}, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.events = response.content;
        this.totalEvents = response.totalElements;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Failed to load events. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    const filters = this.filterForm.getRawValue();
    
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !filters.search || 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase());
        
      const matchesCategory = !filters.category || 
        event.category === filters.category;
        
      const matchesDate = !filters.startDate || 
        new Date(event.startDate).toDateString() === new Date(filters.startDate).toDateString();
        
      const matchesLocation = !filters.location || 
        event.location.toLowerCase().includes(filters.location.toLowerCase());
        
      return matchesSearch && matchesCategory && matchesDate && matchesLocation;
    });
  }

  clearFilters() {
    this.filterForm.reset();
    this.filteredEvents = [...this.events];
  }

  registerForEvent(eventId: string) {
    this.isLoading = true;
    
    this.eventService.registerForEvent(eventId)
      .pipe(
        catchError(error => {
          const errorMessage = error.error?.message || 'Failed to register for event. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.snackBar.open('Successfully registered for event!', 'Close', { duration: 3000 });
          this.loadEvents(); // Reload events to get updated data
        }
      });
  }

  joinWaitlist(eventId: string) {
    this.eventService.joinWaitlist(eventId)
      .pipe(
        catchError(error => {
          const errorMessage = error.error?.message || 'Failed to join waitlist. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.snackBar.open('Successfully joined the waitlist!', 'Close', { duration: 3000 });
          this.loadEvents();
        }
      });
  }

  getAvailableSpots(event: IEvent): number {
    return event.maxParticipants - (event.registeredParticipants?.length || 0);
  }

  isEventFull(event: IEvent): boolean {
    return (event.registeredParticipants?.length || 0) >= event.maxParticipants;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }
} 