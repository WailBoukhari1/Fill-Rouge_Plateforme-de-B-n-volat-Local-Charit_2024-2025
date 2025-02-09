import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-event-search',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Find Events</h2>
      
      <form [formGroup]="searchForm" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field>
            <mat-label>Search Keywords</mat-label>
            <input matInput formControlName="keywords">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Location</mat-label>
            <input matInput formControlName="location">
          </mat-form-field>

          <button mat-raised-button color="primary">Search</button>
        </div>
      </form>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let event of events">
          <mat-card-header>
            <mat-card-title>{{event.title}}</mat-card-title>
            <mat-card-subtitle>{{event.date | date}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{event.description}}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">View Details</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `
})
export class EventSearchComponent {
  searchForm: FormGroup;
  events = [
    {
      title: 'Beach Cleanup',
      date: '2024-03-15',
      description: 'Join us for a community beach cleanup event.'
    },
    {
      title: 'Food Drive',
      date: '2024-03-20',
      description: 'Help collect food donations for local food banks.'
    }
  ];

  constructor(fb: FormBuilder) {
    this.searchForm = fb.group({
      keywords: [''],
      location: ['']
    });
  }
} 