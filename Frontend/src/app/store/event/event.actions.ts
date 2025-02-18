import { createAction, props } from '@ngrx/store';
import { IEvent, IEventFeedback, IEventFilters, IEventRegistration, EventStatus, IEventStats } from '../../core/models/event.types';

export const loadEvents = createAction(
  '[Event] Load Events',
  props<{ filters: IEventFilters; page: number; size: number }>()
);

export const loadEventsSuccess = createAction(
  '[Event] Load Events Success',
  props<{ events: IEvent[]; totalElements: number }>()
);

export const loadEventsFailure = createAction(
  '[Event] Load Events Failure',
  props<{ error: any }>()
);

export const loadEventById = createAction(
  '[Event] Load Event By Id',
  props<{ id: string }>()
);

export const loadEventByIdSuccess = createAction(
  '[Event] Load Event By Id Success',
  props<{ event: IEvent }>()
);

export const loadEventByIdFailure = createAction(
  '[Event] Load Event By Id Failure',
  props<{ error: any }>()
);

export const registerForEvent = createAction(
  '[Event] Register For Event',
  props<{ eventId: string }>()
);

export const registerForEventSuccess = createAction(
  '[Event] Register For Event Success',
  props<{ registration: IEventRegistration }>()
);

export const registerForEventFailure = createAction(
  '[Event] Register For Event Failure',
  props<{ error: any }>()
);

export const submitFeedback = createAction(
  '[Event] Submit Feedback',
  props<{ eventId: string; feedback: Partial<IEventFeedback> }>()
);

export const submitFeedbackSuccess = createAction(
  '[Event] Submit Feedback Success',
  props<{ feedback: IEventFeedback }>()
);

export const submitFeedbackFailure = createAction(
  '[Event] Submit Feedback Failure',
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

// Create Event Actions
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

// Update Event Actions
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

// Delete Event Actions
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

// Cancel Registration Actions
export const cancelRegistration = createAction(
  '[Event] Cancel Registration',
  props<{ eventId: string }>()
);

export const cancelRegistrationSuccess = createAction(
  '[Event] Cancel Registration Success'
);

export const cancelRegistrationFailure = createAction(
  '[Event] Cancel Registration Failure',
  props<{ error: any }>()
);

// Waitlist Actions
export const joinWaitlist = createAction(
  '[Event] Join Waitlist',
  props<{ eventId: string }>()
);

export const joinWaitlistSuccess = createAction(
  '[Event] Join Waitlist Success'
);

export const joinWaitlistFailure = createAction(
  '[Event] Join Waitlist Failure',
  props<{ error: any }>()
);

export const leaveWaitlist = createAction(
  '[Event] Leave Waitlist',
  props<{ eventId: string }>()
);

export const leaveWaitlistSuccess = createAction(
  '[Event] Leave Waitlist Success'
);

export const leaveWaitlistFailure = createAction(
  '[Event] Leave Waitlist Failure',
  props<{ error: any }>()
);

// Cancel Event Actions
export const cancelEvent = createAction(
  '[Event] Cancel Event',
  props<{ id: string; reason: string }>()
);

export const cancelEventSuccess = createAction(
  '[Event] Cancel Event Success',
  props<{ event: IEvent }>()
);

export const cancelEventFailure = createAction(
  '[Event] Cancel Event Failure',
  props<{ error: any }>()
);

// Event Stats Actions
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

// Filter Actions
export const updateFilters = createAction(
  '[Event] Update Filters',
  props<{ filters: IEventFilters }>()
);

// Unregister Event Actions
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