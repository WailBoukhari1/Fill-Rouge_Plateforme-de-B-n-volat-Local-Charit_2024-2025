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
import { EventService, Event, EventFilter } from '../../../../core/services/event.service';
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
    search: new FormControl(''),
    category: new FormControl(''),
    date: new FormControl(null),
    location: new FormControl('')
  });

  // Categories for filter
  categories = [
    'Environmental',
    'Education',
    'Healthcare',
    'Community Service',
    'Animal Welfare',
    'Arts & Culture',
    'Sports & Recreation'
  ];

  events: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = false;
  error: string | null = null;

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

  loadEvents() {
    this.isLoading = true;
    this.error = null;

    this.eventService.getEvents()
      .pipe(
        catchError(error => {
          this.error = 'Failed to load events. Please try again later.';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(events => {
        this.events = events;
        this.applyFilters();
      });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !filters.search || 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase());
        
      const matchesCategory = !filters.category || 
        event.category === filters.category;
        
      const matchesDate = !filters.date || 
        new Date(event.date).toDateString() === new Date(filters.date).toDateString();
        
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

  getAvailableSpots(event: Event): number {
    return event.maxParticipants - event.registeredParticipants.length;
  }

  isEventFull(event: Event): boolean {
    return event.registeredParticipants.length >= event.maxParticipants;
  }

  onPageChange(event: PageEvent): void {
    // TODO: Implement pagination
    console.log(event);
  }
} 