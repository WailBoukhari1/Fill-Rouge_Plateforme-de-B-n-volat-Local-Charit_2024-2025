import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventState } from './event.state';

export const selectEventState = createFeatureSelector<EventState>('events');

export const selectAllEvents = createSelector(
  selectEventState,
  (state: EventState) => state.events
);

export const selectSelectedEvent = createSelector(
  selectEventState,
  (state: EventState) => state.selectedEvent
);

export const selectEventsLoading = createSelector(
  selectEventState,
  (state: EventState) => state.loading
);

export const selectEventsError = createSelector(
  selectEventState,
  (state: EventState) => state.error
);

export const selectPastEvents = createSelector(
  selectAllEvents,
  (events) => events.filter(event => new Date(event.startDate) < new Date())
);

export const selectUpcomingEvents = createSelector(
  selectAllEvents,
  (events) => events.filter(event => new Date(event.startDate) >= new Date())
);
