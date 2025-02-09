import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { VolunteerService } from '../../services/volunteer.service';
import { Event } from '../../../../core/models/event.model';

@Component({
  selector: 'app-volunteer-events',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './volunteer-events.component.html'
})
export class VolunteerEventsComponent implements OnInit {
  // TODO: Implement volunteer events component
} 