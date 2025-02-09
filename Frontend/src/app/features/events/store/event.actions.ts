import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Event } from '../../../core/models/event.model';
import { EventFilters } from '../models/event.model';

export const EventActions = createActionGroup({
  source: 'Events',
  events: {
    // Load Events
    'Load Events': props<{ filters?: EventFilters }>(),
    'Load Events Success': props<{ events: Event[] }>(),
    'Load Events Failure': props<{ error: string }>(),

    // Load Single Event
    'Load Event': props<{ id: string }>(),
    'Load Event Success': props<{ event: Event }>(),
    'Load Event Failure': props<{ error: string }>(),

    // Create Event
    'Create Event': props<{ event: Omit<Event, 'id'> }>(),
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

    // Register for Event
    'Register For Event': props<{ eventId: string }>(),
    'Register For Event Success': props<{ event: Event }>(),
    'Register For Event Failure': props<{ error: string }>(),

    // Clear Events State
    'Clear Events': emptyProps(),
  },
});
