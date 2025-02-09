import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-skills-availability',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Skills & Availability</h2>
      
      <section class="mb-6">
        <h3 class="text-xl mb-3">My Skills</h3>
        <mat-chip-listbox>
          <mat-chip *ngFor="let skill of skills">{{skill}}</mat-chip>
        </mat-chip-listbox>
      </section>

      <section>
        <h3 class="text-xl mb-3">Availability</h3>
        <form [formGroup]="availabilityForm">
          <mat-form-field class="w-full">
            <mat-label>Preferred Days</mat-label>
            <mat-select formControlName="days" multiple>
              <mat-option *ngFor="let day of weekDays" [value]="day">{{day}}</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </section>
    </div>
  `
})
export class SkillsAvailabilityComponent {
  skills = ['Teaching', 'First Aid', 'Organization', 'Leadership'];
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  availabilityForm: FormGroup;

  constructor(fb: FormBuilder) {
    this.availabilityForm = fb.group({
      days: [[]]
    });
  }
} 