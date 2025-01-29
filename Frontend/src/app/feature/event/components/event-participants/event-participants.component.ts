import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-participants',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './event-participants.component.html'
})
export class EventParticipantsComponent {
  // TODO: Implement event participants component
} 