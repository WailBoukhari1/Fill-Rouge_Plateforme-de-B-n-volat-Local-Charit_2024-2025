import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EventFilters } from '../../models/event.model';

@Component({
  selector: 'app-event-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './event-filters.component.html'
})
export class EventFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<EventFilters>();
  
  filterForm: FormGroup;
  commonSkills = [
    'Teaching',
    'Mentoring',
    'Healthcare',
    'Technology',
    'Environment',
    'Social Work',
    'Construction',
    'Arts & Culture',
    'Sports & Recreation',
    'Administration'
  ];

  radiusOptions = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      location: [''],
      skills: [[]],
      radius: [10]
    });
  }

  ngOnInit(): void {
    // Emit filter changes after a short delay to prevent too many API calls
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(filters => {
      this.filtersChange.emit(filters);
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      location: '',
      skills: [],
      radius: 10
    });
  }
} 