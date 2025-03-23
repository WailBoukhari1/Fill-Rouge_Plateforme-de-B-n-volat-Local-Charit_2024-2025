import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IEvent, EventStatus } from '../../../core/models/event.types';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="event-card h-full flex flex-col">
      <div class="relative">
        <img 
          [src]="event.imageUrl || 'assets/images/event-placeholder.jpg'" 
          [alt]="event.title"
          class="w-full h-40 object-cover rounded-t-md"
        />
        
        <div class="absolute top-2 right-2">
          <mat-chip 
            [color]="getStatusInfo(event.status).color" 
            selected
            class="!py-1 !px-2 text-xs font-medium"
            [matTooltip]="getStatusTooltip(event)">
            <mat-icon class="text-base mr-1">{{ getStatusInfo(event.status).icon }}</mat-icon>
            {{ getStatusInfo(event.status).displayName }}
          </mat-chip>
        </div>
      </div>
      
      <mat-card-content class="flex-grow">
        <h3 class="text-lg font-semibold mt-2 mb-1 line-clamp-2">{{ event.title }}</h3>
        
        <div class="text-gray-600 text-sm mb-2">
          <div class="flex items-center mb-1">
            <mat-icon class="text-base mr-1">event</mat-icon>
            {{ event.startDate | date: 'MMM d, y' }}
          </div>
          <div class="flex items-center mb-1">
            <mat-icon class="text-base mr-1">location_on</mat-icon>
            <span class="line-clamp-1">{{ event.location }}</span>
          </div>
          <div class="flex items-center">
            <mat-icon class="text-base mr-1">group</mat-icon>
            {{ event.currentParticipants || 0 }}/{{ event.maxParticipants }}
          </div>
        </div>
        
        <p class="text-sm line-clamp-3 mb-3">{{ event.description }}</p>
      </mat-card-content>
      
      <mat-card-actions class="flex justify-between items-center">
        <button 
          mat-stroked-button 
          color="primary" 
          [routerLink]="['/events', event.id]">
          View Details
        </button>
        
        <button 
          *ngIf="canRegisterForEvent(event)"
          mat-raised-button 
          color="primary" 
          (click)="register.emit(event)">
          Register
        </button>
        
        <button 
          *ngIf="event.isRegistered && !isEventCompleted(event)" 
          mat-stroked-button 
          color="warn" 
          (click)="unregister.emit(event)">
          Cancel Registration
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .event-card {
      transition: transform 0.2s;
    }
    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
  `]
})
export class EventCardComponent {
  @Input() event!: IEvent;
  @Output() register = new EventEmitter<IEvent>();
  @Output() unregister = new EventEmitter<IEvent>();
  
  constructor(private eventService: EventService) {}
  
  getStatusInfo(status: EventStatus | string) {
    return this.eventService.getEventStatusInfo(status);
  }
  
  canRegisterForEvent(event: IEvent): boolean {
    return this.eventService.canRegisterForEvent(event);
  }
  
  isEventCompleted(event: IEvent): boolean {
    return this.eventService.isEventCompleted(event);
  }
  
  getStatusTooltip(event: IEvent): string {
    const statusInfo = this.getStatusInfo(event.status);
    
    switch (event.status) {
      case EventStatus.PENDING:
        return 'This event is awaiting approval';
      case EventStatus.ACTIVE:
        return 'This event is open for registration';
      case EventStatus.FULL:
        return 'This event has reached maximum capacity';
      case EventStatus.ONGOING:
        return 'This event is currently happening';
      case EventStatus.COMPLETED:
        return 'This event has ended';
      case EventStatus.CANCELLED:
        return 'This event has been cancelled';
      case EventStatus.REJECTED:
        return 'This event has been rejected';
      default:
        return statusInfo.displayName;
    }
  }
} 