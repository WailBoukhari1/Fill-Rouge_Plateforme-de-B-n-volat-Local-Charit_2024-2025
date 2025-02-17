import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Event, EventStats, EventFilters, EventFeedback } from '../../core/models/event.model';

export const EventActions = createActionGroup({
  source: 'Event',
  events: {
    // Load Events
    'Load Events': props<{ filters: EventFilters; page: number; size: number }>(),
    'Load Events Success': props<{ events: Event[]; total: number }>(),
    'Load Events Failure': props<{ error: string }>(),

    // Load Single Event
    'Load Event': props<{ id: string }>(),
    'Load Event Success': props<{ event: Event }>(),
    'Load Event Failure': props<{ error: string }>(),

    // Create Event
    'Create Event': props<{ event: Partial<Event> }>(),
    'Create Event Success': props<{ event: Event }>(),
    'Create Event Failure': props<{ error: string }>(),

    // Update Event
    'Update Event': props<{ id: string; event: Partial<Event> }>(),
    'Update Event Success': props<{ event: Event }>(),
    'Update Event Failure': props<{ error: string }>(),

    // Delete Event
    'Delete Event': props<{ id: string }>(),
    'Delete Event Success': props<{ id: string }>(),
    'Delete Event Failure': props<{ error: string }>(),

    // Event Registration
    'Register For Event': props<{ eventId: string }>(),
    'Register For Event Success': emptyProps(),
    'Register For Event Failure': props<{ error: string }>(),

    // Event Unregistration
    'Unregister From Event': props<{ eventId: string }>(),
    'Unregister From Event Success': emptyProps(),
    'Unregister From Event Failure': props<{ error: string }>(),

    // Waitlist Actions
    'Join Waitlist': props<{ eventId: string }>(),
    'Join Waitlist Success': emptyProps(),
    'Join Waitlist Failure': props<{ error: string }>(),

    'Leave Waitlist': props<{ eventId: string }>(),
    'Leave Waitlist Success': emptyProps(),
    'Leave Waitlist Failure': props<{ error: string }>(),

    // Event Status
    'Update Event Status': props<{ id: string; status: string }>(),
    'Update Event Status Success': props<{ event: Event }>(),
    'Update Event Status Failure': props<{ error: string }>(),

    // Event Cancellation
    'Cancel Event': props<{ id: string; reason: string }>(),
    'Cancel Event Success': props<{ event: Event }>(),
    'Cancel Event Failure': props<{ error: string }>(),

    // Event Feedback
    'Submit Feedback': props<{ eventId: string; feedback: Partial<EventFeedback> }>(),
    'Submit Feedback Success': props<{ feedback: EventFeedback }>(),
    'Submit Feedback Failure': props<{ error: string }>(),

    // Event Stats
    'Load Event Stats': props<{ eventId: string }>(),
    'Load Event Stats Success': props<{ stats: EventStats }>(),
    'Load Event Stats Failure': props<{ error: string }>(),

    // Clear State
    'Clear Selected Event': emptyProps(),
    'Clear Event Error': emptyProps(),
    'Reset Event State': emptyProps(),

    // Update Filters
    'Update Filters': props<{ filters: EventFilters }>(),
  }
}); 