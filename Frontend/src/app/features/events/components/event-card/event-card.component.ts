import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipListbox } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Event } from '../../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatChipListbox
  ],
  template: `
    <mat-card class="h-full flex flex-col">
      <img
        *ngIf="event.imageUrl"
        [src]="event.imageUrl"
        [alt]="event.title"
        class="h-48 w-full object-cover"
      >
      <div *ngIf="!event.imageUrl" class="h-48 bg-gray-200 flex items-center justify-center">
        <mat-icon class="text-gray-400 text-6xl">event</mat-icon>
      </div>

      <mat-card-content class="flex-grow p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-xl font-semibold">{{event.title}}</h3>
          <mat-chip-listbox *ngIf="event.status">
            <mat-chip [color]="getStatusColor(event.status)" selected>
              {{event.status}}
            </mat-chip>
          </mat-chip-listbox>
        </div>

        <p class="text-gray-600 mb-4 line-clamp-2">{{event.description}}</p>

        <div class="flex items-center gap-2 text-gray-500 mb-2">
          <mat-icon>location_on</mat-icon>
          <span>{{event.location}}</span>
        </div>

        <div class="flex items-center gap-2 text-gray-500 mb-2">
          <mat-icon>event</mat-icon>
          <span>{{event.startDate | date:'medium'}}</span>
        </div>

        <div *ngIf="event.organizationName" class="flex items-center gap-2 text-gray-500">
          <mat-icon>business</mat-icon>
          <span>{{event.organizationName}}</span>
        </div>

        <div *ngIf="event.category" class="mt-4">
          <mat-chip-listbox>
            <mat-chip>{{event.category}}</mat-chip>
          </mat-chip-listbox>
        </div>
      </mat-card-content>

      <mat-card-actions class="p-4 pt-0">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            {{event.registrationCount || 0}}/{{event.maxParticipants || '∞'}} registered
          </div>
          <button
            mat-raised-button
            color="primary"
            [routerLink]="['/events', event.id]"
          >
            View Details
          </button>
        </div>
      </mat-card-actions>
    </mat-card>
  `
})
export class EventCardComponent {
  @Input() event!: Event;

  getStatusColor(status: string): string {
    switch (status) {
      case 'UPCOMING':
        return 'primary';
      case 'IN_PROGRESS':
        return 'accent';
      case 'COMPLETED':
        return 'warn';
      case 'CANCELLED':
        return 'warn';
      default:
        return 'primary';
    }
  }
} 