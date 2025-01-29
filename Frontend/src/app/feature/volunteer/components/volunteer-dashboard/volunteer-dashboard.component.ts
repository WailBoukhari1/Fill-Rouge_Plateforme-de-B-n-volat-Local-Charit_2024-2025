import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { VolunteerService } from '../../services/volunteer.service';
import { VolunteerStats } from '../../models/volunteer-stats.model';

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './volunteer-dashboard.component.html'
})
export class VolunteerDashboardComponent implements OnInit {
  // TODO: Implement volunteer dashboard component
} 