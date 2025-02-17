import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { EventService } from '../../core/services/event.service';
import { EventActions } from './event.actions';
import { selectEventFilters } from './event.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class EventEffects {
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvents),
      mergeMap(({ filters, page, size }) =>
        this.eventService.getEvents(filters, page, size).pipe(
          map(response => EventActions.loadEventsSuccess({
            events: response.content,
            total: response.totalElements
          })),
          catchError(error => of(EventActions.loadEventsFailure({ error: error.message })))
        )
      )
    )
  );

  loadEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvent),
      mergeMap(({ id }) =>
        this.eventService.getEventById(id).pipe(
          map(event => EventActions.loadEventSuccess({ event })),
          catchError(error => of(EventActions.loadEventFailure({ error: error.message })))
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
          map(() => {
            this.snackBar.open('Successfully registered for event', 'Close', { duration: 3000 });
            return EventActions.registerForEventSuccess();
          }),
          catchError(error => of(EventActions.registerForEventFailure({ error: error.message })))
        )
      )
    )
  );

  unregisterFromEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.unregisterFromEvent),
      mergeMap(({ eventId }) =>
        this.eventService.unregisterFromEvent(eventId).pipe(
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
      mergeMap(({ id, status }) =>
        this.eventService.updateEventStatus(id, status).pipe(
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
        this.eventService.submitFeedback(eventId, feedback).pipe(
          map(submittedFeedback => {
            this.snackBar.open('Feedback submitted successfully', 'Close', { duration: 3000 });
            return EventActions.submitFeedbackSuccess({ feedback: submittedFeedback });
          }),
          catchError(error => of(EventActions.submitFeedbackFailure({ error: error.message })))
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

  constructor(
    private actions$: Actions,
    private eventService: EventService,
    private store: Store,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
} 