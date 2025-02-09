import { createReducer, on } from '@ngrx/store';
import { EventState, initialEventState } from './event.state';
import { EventActions } from './event.actions';

export const eventReducer = createReducer(
  initialEventState,
  
  // Load Events
  on(EventActions.loadEvents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(EventActions.loadEventsSuccess, (state, { events }) => ({
    ...state,
    events,
    loading: false,
    error: null
  })),
  
  on(EventActions.loadEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Event
  on(EventActions.createEvent, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.createEventSuccess, (state, { event }) => ({
    ...state,
    events: [...state.events, event],
    loading: false,
    error: null
  })),

  on(EventActions.createEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Event
  on(EventActions.updateEvent, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.updateEventSuccess, (state, { event }) => ({
    ...state,
    events: state.events.map(e => e.id === event.id ? event : e),
    loading: false,
    error: null
  })),

  on(EventActions.updateEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Event
  on(EventActions.deleteEvent, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.deleteEventSuccess, (state, { id }) => ({
    ...state,
    events: state.events.filter(event => event.id !== id),
    loading: false,
    error: null
  })),

  on(EventActions.deleteEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 