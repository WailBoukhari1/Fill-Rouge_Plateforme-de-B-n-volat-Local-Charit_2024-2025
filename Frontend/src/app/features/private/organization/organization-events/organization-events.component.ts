import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organization-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="organization-events">
      <h2>Organization Events</h2>
      <!-- Events content will go here -->
    </div>
  `,
  styles: [`
    .organization-events {
      padding: 20px;
    }
  `]
})
export class OrganizationEventsComponent {} 