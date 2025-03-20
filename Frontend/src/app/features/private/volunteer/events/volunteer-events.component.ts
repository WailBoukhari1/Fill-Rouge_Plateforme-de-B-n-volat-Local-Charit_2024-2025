import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { EventService } from '../../../../core/services/event.service';
import { IEvent, EventStatus } from '../../../../core/models/event.types';
import * as EventActions from '../../../../store/event/event.actions';
import * as EventSelectors from '../../../../store/event/event.selectors';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-volunteer-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-tab-group>
        <mat-tab label="Upcoming Events">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            @for (event of upcomingEvents; track event._id) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ event.title }}</mat-card-title>
                  <mat-card-subtitle>{{ event.organizationId }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="p-4">
                  <p class="mb-2">{{ event.description }}</p>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">calendar_today</mat-icon>
                    <span>{{ event.startDate | date:'medium' }}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">location_on</mat-icon>
                    <span>{{ event.location }}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">group</mat-icon>
                    <span>{{ event.registeredParticipants.length }}/{{ event.maxParticipants }} participants</span>
                  </div>
                  <div class="mt-2">
                    <mat-chip-listbox>
                      @for (skill of event.requiredSkills; track skill) {
                        <mat-chip>{{ skill }}</mat-chip>
                      }
                    </mat-chip-listbox>
                  </div>
                </mat-card-content>
                <mat-card-actions class="p-4">
                  @if (!isRegistered(event) && !isWaitlisted(event)) {
                    <button mat-raised-button color="primary" 
                            [disabled]="event.registeredParticipants.length >= event.maxParticipants"
                            (click)="event._id && registerForEvent(event._id)">
                      {{ event.registeredParticipants.length >= event.maxParticipants ? 'Join Waitlist' : 'Register' }}
                    </button>
                  } @else if (isRegistered(event)) {
                    <button mat-raised-button color="warn" 
                            (click)="event._id && cancelRegistration(event._id)">
                      Cancel Registration
                    </button>
                  } @else if (isWaitlisted(event)) {
                    <button mat-raised-button color="accent" 
                            (click)="event._id && leaveWaitlist(event._id)">
                      Leave Waitlist
                    </button>
                  }
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </mat-tab>

        <mat-tab label="My Events">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            @for (event of registeredEvents; track event._id) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ event.title }}</mat-card-title>
                  <mat-card-subtitle>{{ event.organizationId }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="p-4">
                  <p class="mb-2">{{ event.description }}</p>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">calendar_today</mat-icon>
                    <span>{{ event.startDate | date:'medium' }}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">location_on</mat-icon>
                    <span>{{ event.location }}</span>
                  </div>
                  <div class="mt-2">
                    <mat-chip-listbox>
                      <mat-chip [color]="getStatusColor(event.status)">
                        {{ event.status }}
                      </mat-chip>
                    </mat-chip-listbox>
                  </div>
                </mat-card-content>
                <mat-card-actions class="p-4">
                  @if (isEventInProgress(event)) {
                    <button mat-raised-button color="warn" 
                            (click)="event._id && cancelRegistration(event._id)">
                      Cancel Registration
                    </button>
                  }
                  @if (isEventCompleted(event)) {
                    <button mat-raised-button color="primary" 
                            [routerLink]="['/dashboard/feedback', event._id]">
                      Provide Feedback
                    </button>
                  }
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </mat-tab>

        <mat-tab label="Waitlisted">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            @for (event of waitlistedEvents; track event._id) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ event.title }}</mat-card-title>
                  <mat-card-subtitle>{{ event.organizationId }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="p-4">
                  <p class="mb-2">{{ event.description }}</p>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">calendar_today</mat-icon>
                    <span>{{ event.startDate | date:'medium' }}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">location_on</mat-icon>
                    <span>{{ event.location }}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <mat-icon class="text-gray-500 mr-2">people_alt</mat-icon>
                    <span>Position in waitlist: {{ getWaitlistPosition(event) }}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions class="p-4">
                  <button mat-raised-button color="warn" 
                          (click)="event._id && leaveWaitlist(event._id)">
                    Leave Waitlist
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class VolunteerEventsComponent implements OnInit, OnDestroy {
  upcomingEvents: IEvent[] = [];
  registeredEvents: IEvent[] = [];
  waitlistedEvents: IEvent[] = [];
  loading = false;
  private subscriptions = new Subscription();

  constructor(
    private store: Store,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadEvents(): void {
    this.loading = true;
    this.store.dispatch(EventActions.loadUpcomingEvents());
    this.store.dispatch(EventActions.loadRegisteredEvents());
    this.store.dispatch(EventActions.loadWaitlistedEvents());

    this.subscriptions.add(
      this.store.select(EventSelectors.selectUpcomingEvents).subscribe(
        events => {
          this.upcomingEvents = events;
          this.loading = false;
        },
        error => {
          console.error('Error loading upcoming events:', error);
          this.loading = false;
        }
      )
    );

    this.subscriptions.add(
      this.store.select(EventSelectors.selectRegisteredEvents).subscribe(
        events => {
          this.registeredEvents = events;
          this.loading = false;
        },
        error => {
          console.error('Error loading registered events:', error);
          this.loading = false;
        }
      )
    );

    this.subscriptions.add(
      this.store.select(EventSelectors.selectWaitlistedEvents).subscribe(
        events => {
          this.waitlistedEvents = events;
          this.loading = false;
        },
        error => {
          console.error('Error loading waitlisted events:', error);
          this.loading = false;
        }
      )
    );
  }

  registerForEvent(eventId: string): void {
    this.store.dispatch(EventActions.registerForEvent({ eventId }));
  }

  cancelRegistration(eventId: string): void {
    this.store.dispatch(EventActions.unregisterFromEvent({ eventId }));
  }

  leaveWaitlist(eventId: string): void {
    this.store.dispatch(EventActions.unregisterFromEvent({ eventId }));
  }

  isRegistered(event: IEvent): boolean {
    const userId = this.getCurrentUserId();
    return event.registeredParticipants.includes(userId);
  }

  isWaitlisted(event: IEvent): boolean {
    const userId = this.getCurrentUserId();
    return event.waitlistedParticipants.includes(userId);
  }

  isEventInProgress(event: IEvent): boolean {
    const now = new Date();
    return event.status !== EventStatus.CANCELLED &&
           event.status === EventStatus.ACTIVE &&
           now >= new Date(event.startDate) &&
           now <= new Date(event.endDate);
  }

  isEventCompleted(event: IEvent): boolean {
    return event.status !== EventStatus.CANCELLED &&
           event.status === EventStatus.COMPLETED &&
           new Date() > new Date(event.endDate);
  }

  getWaitlistPosition(event: IEvent): number {
    const userId = this.getCurrentUserId();
    const waitlistArray = Array.from(event.waitlistedParticipants);
    return waitlistArray.indexOf(userId) + 1;
  }

  getStatusColor(status: EventStatus): string {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'primary';
      case EventStatus.COMPLETED:
        return 'accent';
      case EventStatus.CANCELLED:
        return 'warn';
      case EventStatus.PENDING:
        return 'basic';
      case EventStatus.APPROVED:
        return 'accent';
      case EventStatus.DRAFT:
        return 'basic';
      case EventStatus.UPCOMING:
        return 'accent';
      case EventStatus.ONGOING:
        return 'primary';
      case EventStatus.PUBLISHED:
        return 'primary';
      default:
        return 'basic';
    }
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || '';
  }
} 