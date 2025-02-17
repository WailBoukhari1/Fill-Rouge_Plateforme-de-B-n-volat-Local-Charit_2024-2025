import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Event, EventState, initialEventState } from './event.state';
import { EventActions } from './event.actions';

export const eventAdapter: EntityAdapter<Event> = createEntityAdapter<Event>({
  selectId: (event: Event) => event.id,
  sortComparer: (a: Event, b: Event) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
});

export const initialState: EventState = {
  events: [],
  selectedEvent: null,
  eventStats: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 0,
    pageSize: 10,
    totalItems: 0
  }
};

export const eventReducer = createReducer(
  initialState,

  // Load Events
  on(EventActions.loadEvents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.loadEventsSuccess, (state, { events, total }) => ({
    ...state,
    events,
    loading: false,
    error: null,
    pagination: {
      ...state.pagination,
      totalItems: total
    }
  })),

  on(EventActions.loadEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Event
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
  })),

  // Create Event
  on(EventActions.createEvent, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.createEventSuccess, (state, { event }) => ({
    ...state,
    events: [event, ...state.events],
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
    selectedEvent: state.selectedEvent?.id === event.id ? event : state.selectedEvent,
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
    selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
    loading: false,
    error: null
  })),

  on(EventActions.deleteEventFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Event Status
  on(EventActions.updateEventStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.updateEventStatusSuccess, (state, { event }) => ({
    ...state,
    events: state.events.map(e => e.id === event.id ? event : e),
    selectedEvent: state.selectedEvent?.id === event.id ? event : state.selectedEvent,
    loading: false,
    error: null
  })),

  on(EventActions.updateEventStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Event Stats
  on(EventActions.loadEventStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventActions.loadEventStatsSuccess, (state, { stats }) => ({
    ...state,
    eventStats: stats,
    loading: false,
    error: null
  })),

  on(EventActions.loadEventStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Filters
  on(EventActions.updateFilters, (state, { filters }) => ({
    ...state,
    filters
  })),

  // Clear State
  on(EventActions.clearSelectedEvent, (state) => ({
    ...state,
    selectedEvent: null
  })),

  on(EventActions.clearEventError, (state) => ({
    ...state,
    error: null
  })),

  on(EventActions.resetEventState, () => initialState)
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = eventAdapter.getSelectors(); 