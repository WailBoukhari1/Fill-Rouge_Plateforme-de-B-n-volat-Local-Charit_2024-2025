import { Pipe, PipeTransform } from '@angular/core';
import { EventStatus } from '../../../core/models/event.model';

@Pipe({
  name: 'eventStatus',
  standalone: true
})
export class EventStatusPipe implements PipeTransform {
  // TODO: Implement event status pipe
} 