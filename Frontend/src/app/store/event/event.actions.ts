import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { createAction, props } from '@ngrx/store';
import { EventService } from '../../core/services/event.service';
import { IEvent, EventCategory, EventStatus } from '../../core/models/event.types';
import { Page } from '../../core/models/page.model';
import { EventRequest } from '../../core/models/event-request.model';
import { IEventFeedback, IEventFilters, IEventRegistration, IEventStats } from '../../core/models/event.types';

@Injectable()
export class EventEffects {
  constructor(
    private actions$: Actions,
    private eventService: EventService
  ) {}

  updateEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateEvent),
      switchMap(({ id, event }) => {
        const userId = localStorage.getItem('userId') || '';
        const eventRequest: EventRequest = {
          userId,
          organizationId: event.organizationId || '',
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          startDate: event.startDate || new Date(),
          endDate: event.endDate || new Date(),
          maxParticipants: event.maxParticipants || 0,
          category: event.category as EventCategory || EventCategory.OTHER,
          status: event.status as EventStatus,
          coordinates: event.coordinates,
          contactPerson: event.contactPerson,
          contactEmail: event.contactEmail,
          contactPhone: event.contactPhone,
          waitlistEnabled: event.waitlistEnabled,
          maxWaitlistSize: event.maxWaitlistSize,
          requiredSkills: event.requiredSkills,
          isVirtual: event.isVirtual,
          requiresApproval: event.requiresApproval,
          difficulty: event.difficulty,
          tags: event.tags,
          minimumAge: event.minimumAge,
          requiresBackground: event.requiresBackground,
          isSpecialEvent: event.isSpecialEvent,
          pointsAwarded: event.pointsAwarded,
          durationHours: event.durationHours
        };
        
        return this.eventService.updateEvent(id, eventRequest).pipe(
          map(updatedEvent => updateEventSuccess({ event: updatedEvent })),
          catchError(error => of(updateEventFailure({ error })))
        );
      })
    )
  );
}

export const loadEvents = createAction(
  '[Event] Load Events',
  props<{ filters?: any; page?: number; size?: number }>()
);

export const loadEventsSuccess = createAction(
  '[Event] Load Events Success',
  props<{ events: Page<IEvent> }>()
);

export const loadEventsFailure = createAction(
  '[Event] Load Events Failure',
  props<{ error: any }>()
);

export const loadEventDetails = createAction(
  '[Event] Load Event Details',
  props<{ id: string }>()
);

export const loadEventDetailsSuccess = createAction(
  '[Event] Load Event Details Success',
  props<{ event: IEvent }>()
);

export const loadEventDetailsFailure = createAction(
  '[Event] Load Event Details Failure',
  props<{ error: any }>()
);

export const registerForEvent = createAction(
  '[Event] Register for Event',
  props<{ eventId: string }>()
);

export const registerForEventSuccess = createAction(
  '[Event] Register for Event Success',
  props<{ event: IEvent }>()
);

export const registerForEventFailure = createAction(
  '[Event] Register for Event Failure',
  props<{ error: any }>()
);

export const submitEventFeedback = createAction(
  '[Event] Submit Event Feedback',
  props<{ eventId: string; rating: number; feedback: string }>()
);

export const submitEventFeedbackSuccess = createAction(
  '[Event] Submit Event Feedback Success',
  props<{ event: IEvent }>()
);

export const submitEventFeedbackFailure = createAction(
  '[Event] Submit Event Feedback Failure',
  props<{ error: any }>()
);

export const updateEventStatus = createAction(
  '[Event] Update Event Status',
  props<{ eventId: string; status: EventStatus }>()
);

export const updateEventStatusSuccess = createAction(
  '[Event] Update Event Status Success',
  props<{ event: IEvent }>()
);

export const updateEventStatusFailure = createAction(
  '[Event] Update Event Status Failure',
  props<{ error: any }>()
);

export const loadUpcomingEvents = createAction('[Event] Load Upcoming Events');

export const loadUpcomingEventsSuccess = createAction(
  '[Event] Load Upcoming Events Success',
  props<{ events: IEvent[] }>()
);

export const loadUpcomingEventsFailure = createAction(
  '[Event] Load Upcoming Events Failure',
  props<{ error: any }>()
);

export const loadRegisteredEvents = createAction('[Event] Load Registered Events');

export const loadRegisteredEventsSuccess = createAction(
  '[Event] Load Registered Events Success',
  props<{ events: IEvent[] }>()
);

export const loadRegisteredEventsFailure = createAction(
  '[Event] Load Registered Events Failure',
  props<{ error: any }>()
);

export const loadWaitlistedEvents = createAction('[Event] Load Waitlisted Events');

export const loadWaitlistedEventsSuccess = createAction(
  '[Event] Load Waitlisted Events Success',
  props<{ events: IEvent[] }>()
);

export const loadWaitlistedEventsFailure = createAction(
  '[Event] Load Waitlisted Events Failure',
  props<{ error: any }>()
);

export const createEvent = createAction(
  '[Event] Create Event',
  props<{ event: Partial<IEvent> }>()
);

export const createEventSuccess = createAction(
  '[Event] Create Event Success',
  props<{ event: IEvent }>()
);

export const createEventFailure = createAction(
  '[Event] Create Event Failure',
  props<{ error: any }>()
);

export const updateEvent = createAction(
  '[Event] Update Event',
  props<{ id: string; event: Partial<IEvent> }>()
);

export const updateEventSuccess = createAction(
  '[Event] Update Event Success',
  props<{ event: IEvent }>()
);

export const updateEventFailure = createAction(
  '[Event] Update Event Failure',
  props<{ error: any }>()
);

export const deleteEvent = createAction(
  '[Event] Delete Event',
  props<{ id: string }>()
);

export const deleteEventSuccess = createAction(
  '[Event] Delete Event Success',
  props<{ id: string }>()
);

export const deleteEventFailure = createAction(
  '[Event] Delete Event Failure',
  props<{ error: any }>()
);

export const cancelEventRegistration = createAction(
  '[Event] Cancel Event Registration',
  props<{ eventId: string }>()
);

export const cancelEventRegistrationSuccess = createAction(
  '[Event] Cancel Event Registration Success',
  props<{ event: IEvent }>()
);

export const cancelEventRegistrationFailure = createAction(
  '[Event] Cancel Event Registration Failure',
  props<{ error: any }>()
);

export const loadEventStats = createAction(
  '[Event] Load Event Stats',
  props<{ eventId: string }>()
);

export const loadEventStatsSuccess = createAction(
  '[Event] Load Event Stats Success',
  props<{ stats: IEventStats }>()
);

export const loadEventStatsFailure = createAction(
  '[Event] Load Event Stats Failure',
  props<{ error: any }>()
);

export const updateFilters = createAction(
  '[Event] Update Filters',
  props<{ filters: IEventFilters }>()
);

export const unregisterFromEvent = createAction(
  '[Event] Unregister From Event',
  props<{ eventId: string }>()
);

export const unregisterFromEventSuccess = createAction(
  '[Event] Unregister From Event Success'
);

export const unregisterFromEventFailure = createAction(
  '[Event] Unregister From Event Failure',
  props<{ error: any }>()
);

export const setLoading = createAction(
  '[Event] Set Loading State',
  props<{ loading: boolean }>()
);

export const selectEvent = createAction(
  '[Event] Select Event',
  props<{ event: IEvent | null }>()
);

export const clearSelectedEvent = createAction(
  '[Event] Clear Selected Event'
);

export const loadEvent = createAction(
  '[Event] Load Event',
  props<{ id: string }>()
);

export const loadEventSuccess = createAction(
  '[Event] Load Event Success',
  props<{ event: IEvent }>()
);

export const loadEventFailure = createAction(
  '[Event] Load Event Failure',
  props<{ error: any }>()
);

export const updateEventBanner = createAction(
  '[Event] Update Event Banner',
  props<{ id: string; bannerImage: string }>()
);

export const updateEventBannerSuccess = createAction(
  '[Event] Update Event Banner Success',
  props<{ event: IEvent }>()
);

export const updateEventBannerFailure = createAction(
  '[Event] Update Event Banner Failure',
  props<{ error: any }>()
);

export const registerForEventWithDetails = createAction(
  '[Event] Register for Event With Details',
  props<{ eventId: string; specialRequirements: string; notes: string }>()
);

export const registerForEventWithDetailsSuccess = createAction(
  '[Event] Register for Event With Details Success',
  props<{ event: IEvent }>()
);

export const registerForEventWithDetailsFailure = createAction(
  '[Event] Register for Event With Details Failure',
  props<{ error: any }>()
);

export const approveEvent = createAction(
  '[Event] Approve Event',
  props<{ eventId: string }>()
);

export const approveEventSuccess = createAction(
  '[Event] Approve Event Success',
  props<{ event: IEvent }>()
);

export const approveEventFailure = createAction(
  '[Event] Approve Event Failure',
  props<{ error: any }>()
);

export const rejectEvent = createAction(
  '[Event] Reject Event',
  props<{ eventId: string; reason: string }>()
);

export const rejectEventSuccess = createAction(
  '[Event] Reject Event Success',
  props<{ event: IEvent }>()
);

export const rejectEventFailure = createAction(
  '[Event] Reject Event Failure',
  props<{ error: any }>()
); 