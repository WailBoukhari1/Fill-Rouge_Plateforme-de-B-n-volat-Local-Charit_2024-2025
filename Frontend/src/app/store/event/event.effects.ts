import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, tap, finalize, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventStatus, IEvent, IEventFeedback, IEventRegistration } from '../../core/models/event.types';
import { Event } from '../../core/models/event.model';
import { Page } from '../../core/models/page.model';
import * as EventActions from './event.actions';
import { selectEventFilters } from './event.selectors';
import { EventState } from './event.reducer';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  status: number;
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

@Injectable()
export class EventEffects {
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEvents),
      tap(action => {
        console.log('LoadEvents action dispatched:', action);
      }),
      mergeMap(action => {
        console.log('Loading events with filters:', action.filters);
        return this.eventService.getEvents({
          ...action.filters,
          page: action.page,
          size: action.size
        }).pipe(
          tap(page => {
            console.log('Page object before success action:', page);
            console.log('Page content:', page.content);
            console.log('Page metadata:', {
              totalElements: page.totalElements,
              totalPages: page.totalPages,
              size: page.size,
              number: page.number,
              first: page.first,
              last: page.last,
              empty: page.empty
            });
          }),
          map(page => {
            console.log('Dispatching loadEventsSuccess with page:', page);
            return EventActions.loadEventsSuccess({ events: page });
          }),
          catchError(error => {
            console.error('Error loading events:', error);
            return of(EventActions.loadEventsFailure({ error }));
          })
        );
      })
    )
  );

  loadEventDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.loadEventDetails),
      mergeMap(action =>
        this.eventService.getEventById(action.id).pipe(
          map(event => EventActions.loadEventDetailsSuccess({ event })),
          catchError(error => of(EventActions.loadEventDetailsFailure({ error })))
        )
      )
    )
  );

  createEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.createEvent),
      mergeMap(action =>
        this.eventService.createEvent(action.event).pipe(
          map(event => EventActions.createEventSuccess({ event })),
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
      mergeMap(action =>
        this.eventService.updateEvent(action.id, action.event).pipe(
          map(event => EventActions.updateEventSuccess({ event })),
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
      mergeMap(action =>
        this.eventService.deleteEvent(action.id).pipe(
          map(() => EventActions.deleteEventSuccess({ id: action.id })),
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
      switchMap(({ eventId }) =>
        this.eventService.registerForEvent(eventId).pipe(
          map(event => EventActions.registerForEventSuccess({ event })),
          catchError(error => of(EventActions.registerForEventFailure({ error })))
        )
      )
    )
  );

  registerForEventWithDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.registerForEventWithDetails),
      switchMap(({ eventId, specialRequirements, notes }) => {
        // Get the current user data to populate the registration request
        const userId = localStorage.getItem('userId');
        const firstName = localStorage.getItem('firstName') || '';
        const lastName = localStorage.getItem('lastName') || '';
        const email = localStorage.getItem('email') || '';
        const phoneNumber = localStorage.getItem('phoneNumber') || '';
        
        // Create a complete registration request
        const registrationRequest = {
          firstName,
          lastName,
          email,
          phoneNumber,
          specialRequirements,
          notes,
          termsAccepted: true,
          eventId,
          userId
        };
        
        return this.eventService.registerWithDetails(eventId, registrationRequest).pipe(
          map(event => EventActions.registerForEventWithDetailsSuccess({ event })),
          catchError(error => of(EventActions.registerForEventWithDetailsFailure({ error })))
        );
      })
    )
  );

  cancelEventRegistration$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.cancelEventRegistration),
      mergeMap(action =>
        this.eventService.cancelRegistration(action.eventId).pipe(
          map(() => EventActions.cancelEventRegistrationSuccess({ event: {} as IEvent })),
          catchError(error => of(EventActions.cancelEventRegistrationFailure({ error })))
        )
      )
    )
  );

  submitEventFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.submitEventFeedback),
      mergeMap(action =>
        this.eventService.submitEventFeedback(action.eventId, { rating: action.rating, feedback: action.feedback }).pipe(
          map(feedback => EventActions.submitEventFeedbackSuccess({ event: feedback as unknown as IEvent })),
          catchError(error => of(EventActions.submitEventFeedbackFailure({ error })))
        )
      )
    )
  );

  updateEventStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEventStatus),
      mergeMap(action =>
        this.eventService.updateEventStatus(action.id, action.status).pipe(
          map(event => EventActions.updateEventStatusSuccess({ event })),
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
        EventActions.loadEventDetailsFailure,
        EventActions.registerForEventFailure,
        EventActions.submitEventFeedbackFailure,
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

  updateEventBanner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.updateEventBanner),
      switchMap(({ id, bannerImage }) =>
        this.eventService.updateEventBanner(id, bannerImage).pipe(
          map(event => EventActions.updateEventBannerSuccess({ event })),
          catchError(error => of(EventActions.updateEventBannerFailure({ error })))
        )
      )
    )
  );

  // Add success effects for registration actions
  registerForEventSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.registerForEventSuccess),
      map(({ event }) => {
        const userId = localStorage.getItem('userId') || '';
        
        if (event.waitlistedParticipants?.includes(userId)) {
          if (event.registeredParticipants && event.registeredParticipants.length >= event.maxParticipants) {
            this.snackBar.open('Event is full. You have been added to the waitlist.', 'Close', { duration: 5000 });
          } else {
            this.snackBar.open('Your registration requires approval. You are on the waitlist pending approval.', 'Close', { duration: 5000 });
          }
        } else if (event.registeredParticipants?.includes(userId)) {
          this.snackBar.open('Successfully registered for the event!', 'Close', { duration: 5000 });
        }
        
        return EventActions.setLoading({ loading: false });
      })
    )
  );

  registerForEventWithDetailsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.registerForEventWithDetailsSuccess),
      map(({ event }) => {
        const userId = localStorage.getItem('userId') || '';
        
        if (event.waitlistedParticipants?.includes(userId)) {
          if (event.registeredParticipants && event.registeredParticipants.length >= event.maxParticipants) {
            this.snackBar.open('Event is full. You have been added to the waitlist with your details.', 'Close', { duration: 5000 });
          } else {
            this.snackBar.open('Your registration with details requires approval. You are on the waitlist pending approval.', 'Close', { duration: 5000 });
          }
        } else if (event.registeredParticipants?.includes(userId)) {
          this.snackBar.open('Successfully registered for the event with your requirements!', 'Close', { duration: 5000 });
        }
        
        return EventActions.setLoading({ loading: false });
      })
    )
  );

  unregisterFromEventSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventActions.unregisterFromEventSuccess),
      tap(() => {
        this.snackBar.open('You have been removed from the event.', 'Close', { duration: 3000 });
      }),
      map(() => EventActions.setLoading({ loading: false }))
    )
  );

  constructor(
    private actions$: Actions,
    private eventService: EventService,
    private store: Store<{ event: EventState }>,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
} 