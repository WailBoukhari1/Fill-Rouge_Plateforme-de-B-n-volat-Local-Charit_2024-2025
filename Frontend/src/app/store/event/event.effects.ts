import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, tap, finalize, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventStatus } from '../../core/models/event.types';
import * as EventActions from './event.actions';
import { selectEventFilters } from './event.selectors';

@Injectable()
export class EventEffects {
  loadEvents$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(EventActions.loadEvents),
      switchMap(({ filters, page, size }) =>
        this.eventService.getEvents(filters, page, size).pipe(
          map(events => EventActions.loadEventsSuccess({ events })),
          catchError(error => of(EventActions.loadEventsFailure({ error: error.message })))
        )
      )
    );
  });

  loadEventById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEventById),
      mergeMap(({ id }) =>
        this.eventService.getEventById(id).pipe(
          map(event => EventActions.loadEventByIdSuccess({ event })),
          catchError(error => of(EventActions.loadEventByIdFailure({ error })))
        )
      )
    )
  );

  createEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.createEvent),
      switchMap(({ event }) =>
        this.eventService.createEvent(event).pipe(
          map(createdEvent => EventActions.createEventSuccess({ event: createdEvent })),
          catchError(error => of(EventActions.createEventFailure({ error })))
        )
      )
    )
  );

  createEventSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.createEventSuccess),
      tap(() => {
        this.snackBar.open('Event created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/organization/events']);
      })
    ),
    { dispatch: false }
  );

  updateEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEvent),
      switchMap(({ id, event }) =>
        this.eventService.updateEvent(id, event).pipe(
          map(updatedEvent => EventActions.updateEventSuccess({ event: updatedEvent })),
          catchError(error => of(EventActions.updateEventFailure({ error })))
        )
      )
    )
  );

  updateEventSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEventSuccess),
      tap(() => {
        this.snackBar.open('Event updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/organization/events']);
      })
    ),
    { dispatch: false }
  );

  deleteEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.deleteEvent),
      switchMap(({ id }) =>
        this.eventService.deleteEvent(id).pipe(
          map(() => EventActions.deleteEventSuccess({ id })),
          catchError(error => of(EventActions.deleteEventFailure({ error })))
        )
      )
    )
  );

  deleteEventSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.deleteEventSuccess),
      tap(() => {
        this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
      })
    ),
    { dispatch: false }
  );

  registerForEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.registerForEvent),
      mergeMap(({ eventId }) =>
        this.eventService.registerForEvent(eventId).pipe(
          map(registration => EventActions.registerForEventSuccess({ registration })),
          catchError(error => of(EventActions.registerForEventFailure({ error })))
        )
      )
    )
  );

  unregisterFromEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.unregisterFromEvent),
      mergeMap(({ eventId }) =>
        this.eventService.cancelRegistration(eventId).pipe(
          map(() => {
            this.snackBar.open('Successfully unregistered from event', 'Close', { duration: 3000 });
            return EventActions.unregisterFromEventSuccess();
          }),
          catchError(error => of(EventActions.unregisterFromEventFailure({ error: error.message })))
        )
      )
    )
  );

  joinWaitlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.joinWaitlist),
      mergeMap(({ eventId }) =>
        this.eventService.joinWaitlist(eventId).pipe(
          map(() => {
            this.snackBar.open('Successfully joined waitlist', 'Close', { duration: 3000 });
            return EventActions.joinWaitlistSuccess();
          }),
          catchError(error => of(EventActions.joinWaitlistFailure({ error: error.message })))
        )
      )
    )
  );

  leaveWaitlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.leaveWaitlist),
      mergeMap(({ eventId }) =>
        this.eventService.leaveWaitlist(eventId).pipe(
          map(() => {
            this.snackBar.open('Successfully left waitlist', 'Close', { duration: 3000 });
            return EventActions.leaveWaitlistSuccess();
          }),
          catchError(error => of(EventActions.leaveWaitlistFailure({ error: error.message })))
        )
      )
    )
  );

  updateEventStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEventStatus),
      switchMap(({ eventId, status }) =>
        this.eventService.updateEventStatus(eventId, status as EventStatus).pipe(
          map(updatedEvent => EventActions.updateEventStatusSuccess({ event: updatedEvent })),
          catchError(error => of(EventActions.updateEventStatusFailure({ error })))
        )
      )
    )
  );

  updateEventStatusSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEventStatusSuccess),
      tap(() => {
        this.snackBar.open('Event status updated successfully', 'Close', { duration: 3000 });
      })
    ),
    { dispatch: false }
  );

  cancelEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.cancelEvent),
      mergeMap(({ id, reason }) =>
        this.eventService.cancelEvent(id, reason).pipe(
          map(event => {
            this.snackBar.open('Event cancelled successfully', 'Close', { duration: 3000 });
            return EventActions.cancelEventSuccess({ event });
          }),
          catchError(error => of(EventActions.cancelEventFailure({ error })))
        )
      )
    )
  );

  submitFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.submitFeedback),
      mergeMap(({ eventId, feedback }) =>
        this.eventService.submitEventFeedback(eventId, feedback).pipe(
          map(submittedFeedback => EventActions.submitFeedbackSuccess({ feedback: submittedFeedback })),
          catchError(error => of(EventActions.submitFeedbackFailure({ error })))
        )
      )
    )
  );

  loadEventStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEventStats),
      mergeMap(({ eventId }) =>
        this.eventService.getEventStats(eventId).pipe(
          map(stats => EventActions.loadEventStatsSuccess({ stats })),
          catchError(error => of(EventActions.loadEventStatsFailure({ error: error.message })))
        )
      )
    )
  );

  // Reload events when filters change
  updateFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateFilters),
      withLatestFrom(this.store.select(selectEventFilters)),
      map(([_, filters]) => EventActions.loadEvents({ 
        filters, 
        page: 0, 
        size: 10 
      }))
    )
  );

  loadUpcomingEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadUpcomingEvents),
      mergeMap(() =>
        this.eventService.getUpcomingEvents().pipe(
          map(events => EventActions.loadUpcomingEventsSuccess({ events })),
          catchError(error => of(EventActions.loadUpcomingEventsFailure({ error })))
        )
      )
    )
  );

  loadRegisteredEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadRegisteredEvents),
      mergeMap(() =>
        this.eventService.getRegisteredEvents().pipe(
          map(events => EventActions.loadRegisteredEventsSuccess({ events })),
          catchError(error => of(EventActions.loadRegisteredEventsFailure({ error })))
        )
      )
    )
  );

  loadWaitlistedEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadWaitlistedEvents),
      mergeMap(() =>
        this.eventService.getWaitlistedEvents().pipe(
          map(events => EventActions.loadWaitlistedEventsSuccess({ events })),
          catchError(error => of(EventActions.loadWaitlistedEventsFailure({ error })))
        )
      )
    )
  );

  handleError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        EventActions.createEventFailure,
        EventActions.updateEventFailure,
        EventActions.deleteEventFailure,
        EventActions.loadEventsFailure,
        EventActions.loadEventByIdFailure,
        EventActions.registerForEventFailure,
        EventActions.submitFeedbackFailure,
        EventActions.updateEventStatusFailure,
        EventActions.loadUpcomingEventsFailure,
        EventActions.loadRegisteredEventsFailure,
        EventActions.loadWaitlistedEventsFailure
      ),
      tap(action => {
        const errorMessage = action.error?.message || 'An error occurred';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      })
    ),
    { dispatch: false }
  );

  // Reload events after successful creation or update
  reloadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        EventActions.createEventSuccess,
        EventActions.updateEventSuccess,
        EventActions.deleteEventSuccess
      ),
      withLatestFrom(this.store.select(selectEventFilters)),
      map(([_, filters]) => EventActions.loadEvents({ 
        filters, 
        page: 0, 
        size: 10 
      }))
    )
  );

  loadEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvent),
      mergeMap(action =>
        this.eventService.getEventById(action.id).pipe(
          map(event => EventActions.loadEventSuccess({ event })),
          catchError(error => of(EventActions.loadEventFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private eventService: EventService,
    private store: Store,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
} 