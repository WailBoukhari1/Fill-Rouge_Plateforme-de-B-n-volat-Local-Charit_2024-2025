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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { EventService } from '../../../../core/services/event.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  IEvent,
  IEventFilters,
  EventCategory,
  EventStatus,
} from '../../../../core/models/event.types';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

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
    MatTooltipModule,
    RouterLink,
    RouterModule,
    MatPaginatorModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4">
        <!-- Header with Create Event Button -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Events</h1>
          @if (canCreateEvent()) {
            <button
              mat-raised-button
              color="primary"
              [routerLink]="['/events/create']"
            >
              <mat-icon>add</mat-icon>
              Create Event
            </button>
          }
        </div>

        <!-- Search and Filter Section -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form
            [formGroup]="filterForm"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <!-- Search Input -->
            <mat-form-field class="w-full">
              <mat-label>Search Events</mat-label>
              <input
                matInput
                formControlName="search"
                placeholder="Search by title or description"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Category Filter -->
            <mat-form-field class="w-full">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">All Categories</mat-option>
                @for(category of categories; track category) {
                  <mat-option [value]="category">{{ category }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Date Filter -->
            <mat-form-field class="w-full">
              <mat-label>Date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                formControlName="startDate"
              />
              <mat-datepicker-toggle
                matSuffix
                [for]="picker"
              ></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <!-- Location Filter -->
            <mat-form-field class="w-full">
              <mat-label>Location</mat-label>
              <input
                matInput
                formControlName="location"
                placeholder="Filter by location"
              />
              <mat-icon matSuffix>location_on</mat-icon>
            </mat-form-field>
          </form>

          <!-- Clear Filters Button -->
          <div class="flex justify-end mt-4">
            <button mat-button color="primary" (click)="clearFilters()">
              <mat-icon class="mr-2">clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if(isLoading) {
          <div class="flex justify-center items-center py-12">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <!-- Error State -->
        @if(error) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-red-500 mb-4">error_outline</mat-icon>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Events
            </h3>
            <p class="text-gray-600">{{ error }}</p>
            <button
              mat-raised-button
              color="primary"
              class="mt-4"
              (click)="loadEvents()"
            >
              <mat-icon class="mr-2">refresh</mat-icon>
              Retry
            </button>
          </div>
        }

        <!-- Events Grid -->
        @if(!isLoading && !error) {
          @if(filteredEvents.length === 0) {
            <div class="text-center py-12 bg-white rounded-lg shadow-sm">
              <mat-icon class="text-6xl text-gray-400 mb-4">event_busy</mat-icon>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                No Events Found
              </h3>
              <p class="text-gray-600 mb-6">There are no events matching your search criteria.</p>
              <button
                mat-raised-button
                color="primary"
                class="mt-4"
                (click)="clearFilters()"
              >
                <mat-icon class="mr-2">refresh</mat-icon>
                Clear Filters
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for(event of filteredEvents; track event.id) {
                <mat-card class="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  @if(event.bannerImage || event.imageUrl) {
                    <div class="h-48 overflow-hidden">
                      <img 
                        [src]="event.bannerImage || event.imageUrl" 
                        [alt]="event.title"
                        class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        onerror="this.src='assets/images/default-event.jpg'; this.onerror=null;"
                      >
                    </div>
                  } @else {
                    <div class="h-48 bg-gray-200 flex items-center justify-center">
                      <mat-icon class="text-6xl text-gray-400">event</mat-icon>
                    </div>
                  }
                  
                  <mat-card-content class="p-4 flex-grow">
                    <!-- Event Title and Admin Actions -->
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="text-xl font-semibold">
                        <a
                          [routerLink]="['/events', event.id]"
                          class="hover:text-primary-500 transition-colors"
                        >
                          {{ event.title }}
                        </a>
                      </h3>
                      <!-- Admin/Organizer Actions -->
                      @if (canEditEvent(event)) {
                        <div class="flex gap-1">
                          <button
                            mat-icon-button
                            [routerLink]="['/events', event.id, 'edit']"
                            matTooltip="Edit Event"
                          >
                            <mat-icon class="text-gray-600">edit</mat-icon>
                          </button>
                          @if (canDeleteEvent(event)) {
                            <button
                              mat-icon-button
                              (click)="deleteEvent(event)"
                              matTooltip="Delete Event"
                            >
                              <mat-icon class="text-red-500">delete</mat-icon>
                            </button>
                          }
                        </div>
                      }
                    </div>

                    <!-- Category and Status Chips -->
                    <div class="flex flex-wrap gap-2 mb-3">
                      <mat-chip color="primary">{{ event.category }}</mat-chip>
                      <mat-chip [color]="getStatusColor(event.status)" [ngClass]="getStatusClass(event.status)">
                        {{ event.status }}
                      </mat-chip>
                    </div>

                    <!-- Event Description -->
                    <p class="text-gray-600 mb-4 line-clamp-3">{{ event.description }}</p>

                    <!-- Event Details -->
                    <div class="space-y-2 text-gray-500">
                      <div class="flex items-center">
                        <mat-icon class="mr-2 text-primary-400">calendar_today</mat-icon>
                        <span>{{ event.startDate | date : 'EEE, MMM d, y' }}</span>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="mr-2 text-primary-400">schedule</mat-icon>
                        <span>{{ event.startDate | date : 'h:mm a' }}</span>
                        <span class="mx-1">•</span>
                        <span>{{ event.durationHours }} hours</span>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="mr-2 text-primary-400">location_on</mat-icon>
                        <span class="truncate">{{ event.location }}</span>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="mr-2 text-primary-400">group</mat-icon>
                        <span [ngClass]="{'text-red-500': isEventFull(event), 'text-green-500': !isEventFull(event) && event.currentParticipants > 0}">
                          {{ event.currentParticipants }}/{{ event.maxParticipants }}
                          participants
                        </span>
                      </div>
                      @if(event.averageRating && event.numberOfRatings) {
                        <div class="flex items-center">
                          <mat-icon class="mr-2 text-yellow-500">star</mat-icon>
                          <span>{{ event.averageRating.toFixed(1) }} ({{ event.numberOfRatings }} reviews)</span>
                        </div>
                      }
                    </div>
                  </mat-card-content>

                  <mat-card-actions class="p-4 pt-0 border-t mt-auto">
                    <div class="flex justify-between items-center">
                      <a mat-button [routerLink]="['/events', event.id]" color="primary">
                        View Details
                      </a>
                      @if (!event.isRegistered) {
                        @if (isEventFull(event)) {
                          @if (event.waitlistEnabled) {
                            <button
                              mat-raised-button
                              color="accent"
                              (click)="joinWaitlist(event.id!)"
                              [disabled]="isLoading"
                            >
                              Join Waitlist
                            </button>
                          } @else {
                            <button
                              mat-raised-button
                              disabled
                            >
                              Full
                            </button>
                          }
                        } @else {
                          <button
                            mat-raised-button
                            color="primary"
                            (click)="registerForEvent(event)"
                            [disabled]="isLoading || event.status === 'COMPLETED' || event.status === 'CANCELLED'"
                          >
                            Register
                          </button>
                        }
                      } @else {
                        <button
                          mat-raised-button
                          color="primary"
                          disabled
                        >
                          Registered
                        </button>
                      }
                    </div>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
            
            <!-- Pagination -->
            @if(totalEvents > pageSize) {
              <div class="mt-6 flex justify-center">
                <mat-paginator
                  [length]="totalEvents"
                  [pageSize]="pageSize"
                  [pageIndex]="currentPage"
                  [pageSizeOptions]="[6, 12, 24, 48]"
                  (page)="onPageChange($event)"
                  aria-label="Select page"
                  class="bg-white rounded-lg shadow-sm"
                >
                </mat-paginator>
              </div>
            }
          }
        }
      </div>
    </div>
  `,
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  // Filter form
  filterForm: FormGroup;

  // Categories for filter
  categories = Object.values(EventCategory);

  events: IEvent[] = [];
  filteredEvents: IEvent[] = [];
  isLoading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  totalEvents = 0;
  userRole: string | null = null;
  isAdmin: boolean = false;
  isOrganizer: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.userRole = this.authService.getCurrentUserRole();
    this.isAdmin = this.userRole === 'ADMIN';
    this.isOrganizer = this.userRole === 'ORGANIZER';

    this.filterForm = this.formBuilder.group({
      search: [''],
      category: [''],
      startDate: [null],
      location: [''],
    });
  }

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

    this.eventService
      .getEvents(this.currentPage, this.pageSize)
      .subscribe({
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
        },
      });
  }

  applyFilters() {
    const filters = this.filterForm.getRawValue();

    this.filteredEvents = this.events.filter((event) => {
      const matchesSearch =
        !filters.search ||
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category || event.category === filters.category;

      const matchesDate =
        !filters.startDate ||
        new Date(event.startDate).toDateString() ===
          new Date(filters.startDate).toDateString();

      const matchesLocation =
        !filters.location ||
        event.location.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesCategory && matchesDate && matchesLocation;
    });
  }

  clearFilters() {
    this.filterForm.reset();
    this.filteredEvents = [...this.events];
  }

  async registerForEvent(event: IEvent) {
    const isAuthenticated = await firstValueFrom(
      this.authService.isAuthenticated$
    );
    if (!isAuthenticated) {
      this.snackBar.open('Please log in to register for events', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;

    this.eventService
      .registerForEvent(event.id || '')
      .pipe(
        catchError((error) => {
          const errorMessage =
            error.error?.message ||
            'Failed to register for event. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        if (response) {
          this.snackBar.open('Successfully registered for event!', 'Close', {
            duration: 3000,
          });
          this.loadEvents(); // Reload events to get updated data
        }
      });
  }

  joinWaitlist(eventId: string) {
    this.eventService
      .joinWaitlist(eventId)
      .pipe(
        catchError((error) => {
          const errorMessage =
            error.error?.message ||
            'Failed to join waitlist. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.snackBar.open('Successfully joined the waitlist!', 'Close', {
            duration: 3000,
          });
          this.loadEvents();
        }
      });
  }

  getAvailableSpots(event: IEvent): number {
    return event.maxParticipants - (event.registeredParticipants?.length || 0);
  }

  isEventFull(event: IEvent): boolean {
    return event.currentParticipants >= event.maxParticipants;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  getStatusColor(status: EventStatus): string {
    const statusColors: { [key in EventStatus]?: string } = {
      [EventStatus.UPCOMING]: 'primary',
      [EventStatus.ONGOING]: 'accent',
      [EventStatus.COMPLETED]: 'basic',
      [EventStatus.CANCELLED]: 'warn',
      [EventStatus.DRAFT]: 'basic',
      [EventStatus.PENDING]: 'accent',
      [EventStatus.APPROVED]: 'primary',
      [EventStatus.ACTIVE]: 'primary',
      [EventStatus.PUBLISHED]: 'primary',
    };
    return statusColors[status] || 'basic';
  }

  getDurationHours(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
  }

  canEditEvent(event: IEvent): boolean {
    return (
      this.isAdmin ||
      (this.isOrganizer &&
        event.organizationId === this.authService.getCurrentOrganizationId())
    );
  }

  canDeleteEvent(event: IEvent): boolean {
    return (
      this.isAdmin ||
      (this.isOrganizer &&
        event.organizationId === this.authService.getCurrentOrganizationId())
    );
  }

  canCreateEvent(): boolean {
    return this.isAdmin || this.isOrganizer;
  }

  canViewParticipants(event: IEvent): boolean {
    return (
      this.isAdmin ||
      (this.isOrganizer &&
        event.organizationId === this.authService.getCurrentOrganizationId())
    );
  }

  deleteEvent(event: IEvent): void {
    if (!event.id) {
      this.snackBar.open('Invalid event ID', 'Close', { duration: 3000 });
      return;
    }

    if (
      confirm(
        'Are you sure you want to delete this event? This action cannot be undone.'
      )
    ) {
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          this.snackBar.open('Event deleted successfully', 'Close', {
            duration: 3000,
          });
          this.loadEvents(); // Reload the events list
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to delete event',
            'Close',
            { duration: 3000 }
          );
        },
      });
    }
  }

  updateStatus(event: IEvent): void {
    if (!this.isAdmin) {
      this.snackBar.open(
        'Only administrators can update event status',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    if (event.status === EventStatus.DRAFT) {
      this.updateEventStatus(event, EventStatus.PENDING);
    } else if (event.status === EventStatus.PENDING) {
      this.updateEventStatus(event, EventStatus.APPROVED);
    } else if (event.status === EventStatus.APPROVED) {
      this.updateEventStatus(event, EventStatus.ACTIVE);
    } else if (event.status === EventStatus.ACTIVE) {
      this.updateEventStatus(event, EventStatus.COMPLETED);
    } else if (event.status === EventStatus.COMPLETED) {
      this.updateEventStatus(event, EventStatus.DRAFT);
    }
  }

  private updateEventStatus(event: IEvent, newStatus: EventStatus): void {
    this.eventService.updateEventStatus(event.id!, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Event status updated successfully', 'Close', {
          duration: 3000,
        });
        this.loadEvents();
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to update event status',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  getStatusClass(status: EventStatus): string {
    switch (status) {
      case EventStatus.ACTIVE:
      case EventStatus.ONGOING:
      case EventStatus.UPCOMING:
        return 'bg-green-100 text-green-800';
      case EventStatus.PENDING:
      case EventStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case EventStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case EventStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  }
}
