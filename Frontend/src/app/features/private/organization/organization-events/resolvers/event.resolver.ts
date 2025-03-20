import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take, map, catchError, switchMap } from 'rxjs/operators';
import { EventService } from '../../../../../core/services/event.service';
import * as EventActions from '../../../../../store/event/event.actions';
import { selectSelectedEvent } from '../../../../../store/event/event.selectors';
import { IEvent } from '../../../../../core/models/event.types';

@Injectable({ providedIn: 'root' })
export class EventResolver implements Resolve<IEvent | null> {
  constructor(
    private store: Store,
    private eventService: EventService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IEvent | null> {
    const eventId = route.params['id'];
    console.log('EventResolver: Resolving event with ID:', eventId);
    
    if (!eventId) {
      console.error('EventResolver: No event ID provided in route params');
      return of(null);
    }

    // First check if event exists in store
    return this.store.select(selectSelectedEvent).pipe(
      take(1),
      switchMap(event => {
        if (event && event._id === eventId) {
          console.log('EventResolver: Event found in store:', event);
          return of(event);
        }
        
        // If not in store, fetch from API
        console.log('EventResolver: Event not found in store, fetching from API:', eventId);
        return this.eventService.getEventById(eventId).pipe(
          map(event => {
            console.log('EventResolver: Event fetched from API:', event);
            if (event) {
              // Dispatch the correct action to update the store
              this.store.dispatch(EventActions.loadEventDetailsSuccess({ event }));
              return event;
            }
            console.error('EventResolver: No event found in API response');
            return null;
          }),
          catchError(error => {
            console.error('EventResolver: Error fetching event:', error);
            return of(null);
          })
        );
      })
    );
  }
} 