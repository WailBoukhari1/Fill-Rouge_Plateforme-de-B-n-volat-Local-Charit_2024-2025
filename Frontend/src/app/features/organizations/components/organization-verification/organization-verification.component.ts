import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-organization-verification',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './organization-verification.component.html'
})
export class OrganizationVerificationComponent {
  // TODO: Implement organization verification component
} 