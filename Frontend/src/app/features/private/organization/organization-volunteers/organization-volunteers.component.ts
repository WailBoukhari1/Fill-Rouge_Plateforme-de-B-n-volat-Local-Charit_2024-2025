import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organization-volunteers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="organization-volunteers">
      <h2>Organization Volunteers</h2>
      <!-- Volunteers content will go here -->
    </div>
  `,
  styles: [`
    .organization-volunteers {
      padding: 20px;
    }
  `]
})
export class OrganizationVolunteersComponent {} 