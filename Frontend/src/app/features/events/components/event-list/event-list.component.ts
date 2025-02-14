import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Subject, BehaviorSubject, combineLatest, map } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as EventsActions from '../../../../store/events/events.actions';
import * as EventsSelectors from '../../../../store/events/events.selectors';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    EventCardComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Events</h1>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <form [formGroup]="searchForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Search events</mat-label>
            <input matInput formControlName="query" placeholder="Search by title or description">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Categories -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Categories</mat-label>
            <mat-select formControlName="categories" multiple>
              <mat-option *ngFor="let category of categories$ | async" [value]="category">
                {{category}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Location -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" placeholder="Enter location">
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>

          <!-- Radius -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Radius (km)</mat-label>
            <input matInput type="number" formControlName="radius" min="0" max="100">
          </mat-form-field>
        </form>

        <!-- Filter Actions -->
        <div class="flex justify-end mt-4">
          <button mat-stroked-button color="warn" (click)="clearFilters()" class="mr-2">
            Clear Filters
          </button>
          <button mat-raised-button color="primary" (click)="applyFilters()">
            Apply Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center my-8">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="text-red-500 text-center my-4">
        {{ error }}
      </div>

      <!-- Events Grid -->
      <div *ngIf="!(loading$ | async) && (hasEvents$ | async)" 
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-event-card
          *ngFor="let event of events$ | async"
          [event]="event"
        ></app-event-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!(loading$ | async) && !(hasEvents$ | async)" 
           class="text-center my-8">
        <mat-icon class="text-gray-400 text-6xl mb-4">event_busy</mat-icon>
        <p class="text-gray-600">No events found</p>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="totalEvents$ | async"
        [length]="totalEvents$ | async"
        [pageSize]="pageSize$ | async"
        [pageIndex]="pageIndex$ | async"
        [pageSizeOptions]="[6, 12, 24, 48]"
        (page)="onPageChange($event)"
        class="mt-8"
      ></mat-paginator>
    </div>
  `
})
export class EventListComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  private destroy$ = new Subject<void>();
  protected pageSize$ = new BehaviorSubject<number>(12);
  protected pageIndex$ = new BehaviorSubject<number>(0);

  events$ = this.store.select(EventsSelectors.selectAllEvents).pipe(
    map(page => page?.content ?? [])
  );
  loading$ = this.store.select(EventsSelectors.selectEventsLoading);
  error$ = this.store.select(EventsSelectors.selectEventsError);
  hasEvents$ = this.store.select(EventsSelectors.selectHasEvents);
  totalEvents$ = this.store.select(EventsSelectors.selectTotalEvents);
  categories$ = this.store.select(EventsSelectors.selectCategories);

  constructor(
    private store: Store,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initSearchForm();
    this.loadEvents();
    this.store.dispatch(EventsActions.loadCategories());

    // Setup pagination changes
    combineLatest([
      this.pageSize$,
      this.pageIndex$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([size, page]) => {
      this.loadEvents();
    });

    // Setup search form changes
    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex$.next(0); // Reset to first page
      this.loadEvents();
    });
  }

  private initSearchForm() {
    this.searchForm = this.fb.group({
      query: [''],
      categories: [[]],
      location: [''],
      radius: [10]
    });
  }

  private loadEvents() {
    const filters = this.searchForm.value;
    this.store.dispatch(EventsActions.loadEvents({
      ...filters,
      page: this.pageIndex$.getValue(),
      size: this.pageSize$.getValue()
    }));
  }

  clearFilters() {
    this.searchForm.reset({
      query: '',
      categories: [],
      location: '',
      radius: 10
    });
    this.pageIndex$.next(0);
  }

  applyFilters() {
    this.pageIndex$.next(0);
    this.loadEvents();
  }

  onPageChange(event: PageEvent) {
    this.pageSize$.next(event.pageSize);
    this.pageIndex$.next(event.pageIndex);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(EventsActions.resetEventsState());
  }
}