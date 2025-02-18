import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventStatus } from '../../core/models/event.types';
import * as EventActions from './event.actions';
import { selectEventFilters } from './event.selectors';

@Injectable()
export class EventEffects {
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvents),
      mergeMap(({ filters, page, size }) =>
        this.eventService.getEvents(filters, page, size).pipe(
          map(response => EventActions.loadEventsSuccess({
            events: response.content,
            totalElements: response.totalElements
          })),
          catchError(error => of(EventActions.loadEventsFailure({ error })))
        )
      )
    )
  );

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
      mergeMap(({ event }) =>
        this.eventService.createEvent(event).pipe(
          map(createdEvent => {
            this.snackBar.open('Event created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard/events', createdEvent.id]);
            return EventActions.createEventSuccess({ event: createdEvent });
          }),
          catchError(error => of(EventActions.createEventFailure({ error: error.message })))
        )
      )
    )
  );

  updateEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEvent),
      mergeMap(({ id, event }) =>
        this.eventService.updateEvent(id, event).pipe(
          map(updatedEvent => {
            this.snackBar.open('Event updated successfully', 'Close', { duration: 3000 });
            return EventActions.updateEventSuccess({ event: updatedEvent });
          }),
          catchError(error => of(EventActions.updateEventFailure({ error: error.message })))
        )
      )
    )
  );

  deleteEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.deleteEvent),
      mergeMap(({ id }) =>
        this.eventService.deleteEvent(id).pipe(
          map(() => {
            this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard/events']);
            return EventActions.deleteEventSuccess({ id });
          }),
          catchError(error => of(EventActions.deleteEventFailure({ error: error.message })))
        )
      )
    )
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
      mergeMap(({ eventId, status }) =>
        this.eventService.updateEventStatus(eventId, status as EventStatus).pipe(
          map(event => {
            this.snackBar.open('Event status updated successfully', 'Close', { duration: 3000 });
            return EventActions.updateEventStatusSuccess({ event });
          }),
          catchError(error => of(EventActions.updateEventStatusFailure({ error: error.message })))
        )
      )
    )
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
          catchError(error => of(EventActions.cancelEventFailure({ error: error.message })))
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
        EventActions.loadEventsFailure,
        EventActions.loadEventByIdFailure,
        EventActions.registerForEventFailure,
        EventActions.submitFeedbackFailure,
        EventActions.updateEventStatusFailure,
        EventActions.loadUpcomingEventsFailure,
        EventActions.loadRegisteredEventsFailure,
        EventActions.loadWaitlistedEventsFailure
      ),
      tap(({ error }) => {
        this.snackBar.open(
          error.message || 'An error occurred',
          'Close',
          { duration: 5000 }
        );
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private eventService: EventService,
    private store: Store,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
} 