import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { EventFilters } from '@core/models/event.model';
import { EventRequest, EventResponse } from '@core/models/event.model';

export const EventActions = createActionGroup({
  source: 'Events',
  events: {
    // Load Events
    'Load Events': props<{ filters?: EventFilters }>(),
    'Load Events Success': props<{ events: EventResponse[] }>(),
    'Load Events Failure': props<{ error: string }>(),

    // Load Single Event
    'Load Event': props<{ id: string }>(),
    'Load Event Success': props<{ event: EventResponse }>(),
    'Load Event Failure': props<{ error: string }>(),

    // Create Event
    'Create Event': props<{ event: EventRequest }>(),
    'Create Event Success': props<{ event: EventResponse }>(),
    'Create Event Failure': props<{ error: any }>(),

    // Update Event
    'Update Event': props<{ id: string, event: EventRequest }>(),
    'Update Event Success': props<{ event: EventResponse }>(),
    'Update Event Failure': props<{ error: any }>(),

    // Delete Event
    'Delete Event': props<{ id: string }>(),
    'Delete Event Success': props<{ id: string }>(),
    'Delete Event Failure': props<{ error: string }>(),

    // Register for Event
    'Register For Event': props<{ eventId: string }>(),
    'Register For Event Success': props<{ event: EventResponse }>(),
    'Register For Event Failure': props<{ error: string }>(),

    // Clear Events State
    'Clear Events': emptyProps(),
  },
});
