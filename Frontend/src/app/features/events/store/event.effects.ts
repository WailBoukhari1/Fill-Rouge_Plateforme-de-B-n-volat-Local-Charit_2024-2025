import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { EventService } from '../services/event.service';
import { EventActions } from './event.actions';
import { EventRequest, EventResponse } from '../../../core/models/event.model';

@Injectable()
export class EventEffects {
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvents),
      mergeMap(({ filters }) =>
        this.eventService.getAllEvents(filters).pipe(
          map((events: EventResponse[]) => EventActions.loadEventsSuccess({ events })),
          catchError((error) =>
            of(EventActions.loadEventsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loadEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvent),
      mergeMap(({ id }) =>
        this.eventService.getEvent(id).pipe(
          map((event: EventResponse) => EventActions.loadEventSuccess({ event })),
          catchError((error) =>
            of(EventActions.loadEventFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.createEvent),
      mergeMap(({ event }) =>
        this.eventService.createEvent(event).pipe(
          map((createdEvent: EventResponse) => EventActions.createEventSuccess({ event: createdEvent })),
          catchError((error) =>
            of(EventActions.createEventFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEvent),
      mergeMap(({ id, event }) =>
        this.eventService.updateEvent(id, event).pipe(
          map((updatedEvent: EventResponse) => EventActions.updateEventSuccess({ event: updatedEvent })),
          catchError((error) =>
            of(EventActions.updateEventFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.deleteEvent),
      mergeMap(({ id }) =>
        this.eventService.deleteEvent(id).pipe(
          map(() => EventActions.deleteEventSuccess({ id })),
          catchError((error) =>
            of(EventActions.deleteEventFailure({ error: error.message }))
          )
        )
      )
    )
  );

  registerForEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.registerForEvent),
      mergeMap(({ eventId }) =>
        this.eventService.registerForEvent(eventId).pipe(
          map((event: EventResponse) => EventActions.registerForEventSuccess({ event })),
          catchError((error) =>
            of(EventActions.registerForEventFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private eventService: EventService
  ) {}
}
