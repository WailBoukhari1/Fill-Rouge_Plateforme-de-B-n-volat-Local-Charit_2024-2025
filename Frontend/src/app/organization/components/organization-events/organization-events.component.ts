import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { EventService } from '../../../feature/event/services/event.service';

@Component({
  selector: 'app-organization-events',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './organization-events.component.html'
})
export class OrganizationEventsComponent implements OnInit {
  // TODO: Implement organization events component
} 