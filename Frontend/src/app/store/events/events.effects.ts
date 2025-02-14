import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { EventService } from '../../core/services/event.service';
import * as EventsActions from './events.actions';
import * as EventsSelectors from './events.selectors';

@Injectable()
export class EventsEffects {
  // Load Events
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.loadEvents),
      tap(action => console.log('Load Events Action:', action)),
      switchMap(({ page, size }) =>
        this.eventService.getAllEvents({ page, size }).pipe(
          tap(events => console.log('Load Events Response:', events)),
          map(events => EventsActions.loadEventsSuccess({ events })),
          catchError(error => {
            console.error('Load Events Error:', error);
            return of(EventsActions.loadEventsFailure({ 
              error: error?.error?.message || error?.message || 'Failed to load events' 
            }));
          })
        )
      )
    )
  );

  // Search Events
  searchEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.searchEvents),
      tap(action => console.log('Search Events Action:', action)),
      switchMap((action) => {
        // Clean up undefined values and prepare search parameters
        const searchParams = Object.entries(action).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length === 0) {
              return acc;
            }
            acc[key] = value;
          }
          return acc;
        }, {} as any);

        console.log('Cleaned search parameters:', searchParams);

        return this.eventService.searchEvents(searchParams).pipe(
          tap(response => console.log('Search Events API Response:', response)),
          map(events => EventsActions.searchEventsSuccess({ events })),
          catchError(error => {
            console.error('Search Events Error:', error);
            return of(EventsActions.searchEventsFailure({ 
              error: error?.error?.message || error?.message || 'Failed to search events' 
            }));
          })
        );
      })
    )
  );

  // Load Categories
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.loadCategories),
      tap(() => console.log('Loading categories')),
      switchMap(() =>
        this.eventService.getCategories().pipe(
          tap(categories => console.log('Categories loaded:', categories)),
          map(categories => EventsActions.loadCategoriesSuccess({ categories })),
          catchError(error => {
            console.error('Load Categories Error:', error);
            return of(EventsActions.loadCategoriesFailure({ 
              error: error?.error?.message || error?.message || 'Failed to load categories' 
            }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private eventService: EventService
  ) {}
} 