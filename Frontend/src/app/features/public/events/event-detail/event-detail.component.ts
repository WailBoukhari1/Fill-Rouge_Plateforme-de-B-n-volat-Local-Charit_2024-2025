import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventService } from '../../../../core/services/event.service';
import { IEvent } from '../../../../core/models/event.types';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (isLoading) {
      <div class="flex justify-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      } @else if (error) {
      <div class="text-center">
        <h2 class="text-2xl text-red-600">{{ error }}</h2>
      </div>
      } @else if (event) {
      <mat-card>
        <mat-card-content>
          <h1 class="text-3xl font-bold mb-4">{{ event.title }}</h1>

          <div class="flex gap-2 mb-4">
            <mat-chip color="primary">{{ event.category }}</mat-chip>
            <mat-chip>{{ event.status }}</mat-chip>
          </div>

          <p class="text-gray-600 mb-6">{{ event.description }}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-xl font-semibold mb-3">Event Details</h2>
              <div class="space-y-2">
                <div class="flex items-center">
                  <mat-icon class="mr-2">calendar_today</mat-icon>
                  <span>{{ event.startDate | date : 'medium' }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2">location_on</mat-icon>
                  <span>{{ event.location }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2">group</mat-icon>
                  <span
                    >{{ event.currentParticipants }}/{{
                      event.maxParticipants
                    }}
                    participants</span
                  >
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-xl font-semibold mb-3">Contact Information</h2>
              <div class="space-y-2">
                <div class="flex items-center">
                  <mat-icon class="mr-2">person</mat-icon>
                  <span>{{ event.contactPerson }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2">email</mat-icon>
                  <span>{{ event.contactEmail }}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="mr-2">phone</mat-icon>
                  <span>{{ event.contactPhone }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions class="flex justify-end p-4">
          <button
            mat-button
            color="primary"
            (click)="registerForEvent()"
            [disabled]="event.isRegistered"
          >
            {{ event.isRegistered ? 'Already Registered' : 'Register Now' }}
          </button>
        </mat-card-actions>
      </mat-card>
      }
    </div>
  `,
})
export class EventDetailComponent implements OnInit {
  event?: IEvent;
  isLoading = true;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.error = 'Event ID not found';
      this.isLoading = false;
      return;
    }
    this.loadEvent(eventId!);
  }

  private loadEvent(eventId: string): void {
    this.isLoading = true;
    this.eventService.getEventById(eventId).subscribe({
      next: (event: IEvent) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load event details';
        this.isLoading = false;
        console.error('Error loading event:', error);
      },
    });
  }

  registerForEvent(): void {
    if (!this.event || this.event.isRegistered) return;

    this.eventService.registerForEvent(this.event.id!).subscribe({
      next: (updatedEvent: IEvent) => {
        this.event = updatedEvent;
      },
      error: (error) => {
        console.error('Error registering for event:', error);
      },
    });
  }
}
