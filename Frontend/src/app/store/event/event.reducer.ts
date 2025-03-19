import { createReducer, on } from '@ngrx/store';
import { Event } from '../../core/models/event.model';
import { Page } from '../../core/models/page.model';
import * as EventActions from './event.actions';

export interface EventState {
  events: Page<Event>;
  selectedEvent: Event | null;
  upcomingEvents: Event[];
  registeredEvents: Event[];
  waitlistedEvents: Event[];
  loading: boolean;
  error: string | null;
  filters: any;
}

export const initialState: EventState = {
  events: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true
  },
  selectedEvent: null,
  upcomingEvents: [],
  registeredEvents: [],
  waitlistedEvents: [],
  loading: false,
  error: null,
  filters: {}
};

export const eventReducer = createReducer(
  initialState,
  
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
    events: {
      ...state.events,
      content: [...state.events.content, event],
      totalElements: state.events.totalElements + 1
    },
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
    events: {
      ...state.events,
      content: state.events.content.map(e => e.id === event.id ? event : e)
    },
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
    events: {
      ...state.events,
      content: state.events.content.filter(event => event.id !== id),
      totalElements: state.events.totalElements - 1
    },
    loading: false,
    error: null
  })),

  on(EventActions.deleteEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Event Status
  on(EventActions.updateEventStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.updateEventStatusSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e.id === event.id ? event : e)
    },
    loading: false,
    error: null
  })),

  on(EventActions.updateEventStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Select Event
  on(EventActions.selectEvent, (state, { event }) => ({
    ...state,
    selectedEvent: event
  })),

  // Clear Selected Event
  on(EventActions.clearSelectedEvent, (state) => ({
    ...state,
    selectedEvent: null
  })),

  on(EventActions.loadEvent, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.loadEventSuccess, (state, { event }) => ({
    ...state,
    selectedEvent: event,
    loading: false,
    error: null
  })),

  on(EventActions.loadEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 