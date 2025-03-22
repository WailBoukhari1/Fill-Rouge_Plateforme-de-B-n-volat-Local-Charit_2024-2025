import { createReducer, on } from '@ngrx/store';
import { IEvent, EventStatus } from '../../core/models/event.types';
import { Page } from '../../core/models/page.model';
import * as EventActions from './event.actions';

export interface EventState {
  events: Page<IEvent>;
  selectedEvent: IEvent | null;
  loading: boolean;
  error: any;
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
  loading: false,
  error: null,
  filters: {}
};

export const eventReducer = createReducer(
  initialState,
  
  // Load Events
  on(EventActions.loadEvents, state => ({
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

  // Load Event Details
  on(EventActions.loadEventDetails, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.loadEventDetailsSuccess, (state, { event }) => ({
    ...state,
    selectedEvent: event,
    loading: false,
    error: null
  })),
  on(EventActions.loadEventDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Event
  on(EventActions.createEvent, state => ({
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
  on(EventActions.updateEvent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.updateEventSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e._id === event._id ? event : e)
    },
    selectedEvent: state.selectedEvent?._id === event._id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.updateEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Event
  on(EventActions.deleteEvent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.deleteEventSuccess, (state, { id }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.filter(e => e._id !== id),
      totalElements: state.events.totalElements - 1
    },
    selectedEvent: state.selectedEvent?._id === id ? null : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.deleteEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Event Status
  on(EventActions.updateEventStatus, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.updateEventStatusSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e._id === event._id ? event : e)
    },
    selectedEvent: state.selectedEvent?._id === event._id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.updateEventStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Register for Event
  on(EventActions.registerForEvent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.registerForEventSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e._id === event._id ? event : e)
    },
    selectedEvent: state.selectedEvent?._id === event._id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.registerForEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cancel Event Registration
  on(EventActions.cancelEventRegistration, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.cancelEventRegistrationSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e._id === event._id ? event : e)
    },
    selectedEvent: state.selectedEvent?._id === event._id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.cancelEventRegistrationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Submit Event Feedback
  on(EventActions.submitEventFeedback, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.submitEventFeedbackSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e._id === event._id ? event : e)
    },
    selectedEvent: state.selectedEvent?._id === event._id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.submitEventFeedbackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Register for Event with Details
  on(EventActions.registerForEventWithDetails, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.registerForEventWithDetailsSuccess, (state, { event }) => ({
    ...state,
    events: {
      ...state.events,
      content: state.events.content.map(e => e._id === event._id ? event : e)
    },
    selectedEvent: state.selectedEvent?._id === event._id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),
  on(EventActions.registerForEventWithDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 