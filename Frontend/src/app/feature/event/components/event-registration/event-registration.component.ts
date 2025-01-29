import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Event } from '../../../../core/models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './event-registration.component.html'
})
export class EventRegistrationComponent {
  // TODO: Implement event registration component
} 