import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-volunteer-skills',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatFormFieldModule],
  templateUrl: './volunteer-skills.component.html'
})
export class VolunteerSkillsComponent {
  // TODO: Implement volunteer skills component
} 