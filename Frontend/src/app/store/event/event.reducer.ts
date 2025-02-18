import { createReducer, on } from '@ngrx/store';
import { IEvent } from '../../core/models/event.types';
import * as EventActions from './event.actions';
import { IEventFilters } from '../../core/models/event.types';

export interface EventState {
  events: IEvent[];
  selectedEvent: IEvent | null;
  upcomingEvents: IEvent[];
  registeredEvents: IEvent[];
  waitlistedEvents: IEvent[];
  loading: boolean;
  error: any;
  totalElements: number;
  filters: IEventFilters;
}

export const initialState: EventState = {
  events: [],
  selectedEvent: null,
  upcomingEvents: [],
  registeredEvents: [],
  waitlistedEvents: [],
  loading: false,
  error: null,
  totalElements: 0,
  filters: {
    search: '',
    category: undefined,
    startDate: undefined,
    endDate: undefined,
    location: '',
    radius: 0,
    skills: [],
    status: undefined,
    organizationId: '',
    tags: []
  }
};

export const eventReducer = createReducer(
  initialState,
  
  // Load Events
  on(EventActions.loadEvents, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.loadEventsSuccess, (state, { events, totalElements }) => ({
    ...state,
    events,
    totalElements,
    loading: false,
    error: null
  })),
  on(EventActions.loadEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Event By Id
  on(EventActions.loadEventById, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.loadEventByIdSuccess, (state, { event }) => ({
    ...state,
    selectedEvent: event,
    loading: false,
    error: null
  })),
  on(EventActions.loadEventByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Register For Event
  on(EventActions.registerForEvent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.registerForEventSuccess, state => ({
    ...state,
    loading: false,
    error: null
  })),
  on(EventActions.registerForEventFailure, (state, { error }) => ({
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
    selectedEvent: event,
    events: state.events.map(e => e.id === event.id ? event : e),
    loading: false,
    error: null
  })),
  on(EventActions.updateEventStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Upcoming Events
  on(EventActions.loadUpcomingEvents, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.loadUpcomingEventsSuccess, (state, { events }) => ({
    ...state,
    upcomingEvents: events,
    loading: false,
    error: null
  })),
  on(EventActions.loadUpcomingEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Registered Events
  on(EventActions.loadRegisteredEvents, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.loadRegisteredEventsSuccess, (state, { events }) => ({
    ...state,
    registeredEvents: events,
    loading: false,
    error: null
  })),
  on(EventActions.loadRegisteredEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Waitlisted Events
  on(EventActions.loadWaitlistedEvents, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EventActions.loadWaitlistedEventsSuccess, (state, { events }) => ({
    ...state,
    waitlistedEvents: events,
    loading: false,
    error: null
  })),
  on(EventActions.loadWaitlistedEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 