import { createReducer, on } from '@ngrx/store';
import { Event } from '../../core/models/event.model';
import { Page } from '../../core/models/page.model';
import { EventStatus } from '../../core/models/event-status.enum';
import * as EventsActions from './events.actions';

export interface EventsState {
  events: Page<Event> | null;
  categories: string[];
  searchFilters: {
    query?: string;
    categories?: string[];
    location?: string;
    radius?: number;
    status?: EventStatus[];
    isDraft?: boolean;
    isOwner?: boolean;
    hasRegistrations?: boolean;
    isRegistered?: boolean;
    skillMatch?: boolean;
    availableSpots?: boolean;
    registrationOpen?: boolean;
    pendingApproval?: boolean;
  };
  loading: boolean;
  error: string | null;
}

export const initialState: EventsState = {
  events: null,
  categories: [],
  searchFilters: {},
  loading: false,
  error: null
};

export const eventsReducer = createReducer(
  initialState,

  // Load Events
  on(EventsActions.loadEvents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventsActions.loadEventsSuccess, (state, { events }) => ({
    ...state,
    events,
    loading: false,
    error: null
  })),

  on(EventsActions.loadEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Search Events
  on(EventsActions.searchEvents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventsActions.searchEventsSuccess, (state, { events }) => ({
    ...state,
    events,
    loading: false,
    error: null
  })),

  on(EventsActions.searchEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Categories
  on(EventsActions.loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(EventsActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false,
    error: null
  })),

  on(EventsActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Set Search Filters
  on(EventsActions.setSearchFilters, (state, filters) => ({
    ...state,
    searchFilters: {
      ...state.searchFilters,
      ...filters
    }
  })),

  // Clear Search Filters
  on(EventsActions.clearSearchFilters, (state) => ({
    ...state,
    searchFilters: {}
  })),

  // Reset State
  on(EventsActions.resetEventsState, () => initialState)
); 