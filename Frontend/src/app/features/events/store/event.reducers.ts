import { createReducer, on } from '@ngrx/store';
import { EventState, initialEventState } from './event.state';
import { EventActions } from './event.actions';

export const eventReducer = createReducer(
  initialEventState,
  
  // Load Events
  on(EventActions.loadEvents, (state): EventState => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(EventActions.loadEventsSuccess, (state, { events }): EventState => ({
    ...state,
    events,
    loading: false,
  })),
  
  on(EventActions.loadEventsFailure, (state, { error }): EventState => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Single Event
  on(EventActions.loadEvent, (state): EventState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EventActions.loadEventSuccess, (state, { event }): EventState => ({
    ...state,
    selectedEvent: event,
    loading: false,
  })),

  on(EventActions.loadEventFailure, (state, { error }): EventState => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Event
  on(EventActions.createEvent, (state): EventState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EventActions.createEventSuccess, (state, { event }): EventState => ({
    ...state,
    events: [...state.events, event],
    loading: false,
  })),

  on(EventActions.createEventFailure, (state, { error }): EventState => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Event
  on(EventActions.updateEvent, (state): EventState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EventActions.updateEventSuccess, (state, { event }): EventState => ({
    ...state,
    events: state.events.map(e => e.id === event.id ? event : e),
    selectedEvent: event,
    loading: false,
  })),

  on(EventActions.updateEventFailure, (state, { error }): EventState => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Event
  on(EventActions.deleteEvent, (state): EventState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EventActions.deleteEventSuccess, (state, { id }): EventState => ({
    ...state,
    events: state.events.filter(event => event.id !== id),
    loading: false,
  })),

  on(EventActions.deleteEventFailure, (state, { error }): EventState => ({
    ...state,
    loading: false,
    error,
  })),

  // Register for Event
  on(EventActions.registerForEvent, (state): EventState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EventActions.registerForEventSuccess, (state, { event }): EventState => ({
    ...state,
    events: state.events.map(e => e.id === event.id ? event : e),
    selectedEvent: event,
    loading: false,
  })),

  on(EventActions.registerForEventFailure, (state, { error }): EventState => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear Events
  on(EventActions.clearEvents, (): EventState => ({
    ...initialEventState,
  }))
);
