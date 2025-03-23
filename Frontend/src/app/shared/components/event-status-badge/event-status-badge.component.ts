import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EventStatus } from '../../../core/models/event.types';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-status-badge',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <mat-chip
      [color]="statusInfo.color"
      selected
      [matTooltip]="tooltip || getDefaultTooltip()"
      [class]="size === 'large' ? 'text-base' : 'text-sm'">
      <mat-icon [class]="size === 'large' ? 'mr-2' : 'mr-1 text-base'">{{ statusInfo.icon }}</mat-icon>
      {{ statusInfo.displayName }}
    </mat-chip>
  `,
  styles: []
})
export class EventStatusBadgeComponent {
  @Input() status!: EventStatus | string;
  @Input() tooltip?: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  constructor(private eventService: EventService) {}
  
  get statusInfo() {
    return this.eventService.getEventStatusInfo(this.status);
  }
  
  getDefaultTooltip(): string {
    switch (this.status) {
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
        return this.statusInfo.displayName;
    }
  }
} 