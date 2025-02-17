import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventState } from './event.state';

export const selectEventState = createFeatureSelector<EventState>('event');

export const selectEvents = createSelector(
  selectEventState,
  (state: EventState) => state.events
);

export const selectSelectedEvent = createSelector(
  selectEventState,
  (state: EventState) => state.selectedEvent
);

export const selectEventStats = createSelector(
  selectEventState,
  (state: EventState) => state.eventStats
);

export const selectEventLoading = createSelector(
  selectEventState,
  (state: EventState) => state.loading
);

export const selectEventError = createSelector(
  selectEventState,
  (state: EventState) => state.error
);

export const selectEventFilters = createSelector(
  selectEventState,
  (state: EventState) => state.filters
);

export const selectEventPagination = createSelector(
  selectEventState,
  (state: EventState) => state.pagination
);

export const selectTotalEvents = createSelector(
  selectEventPagination,
  (pagination) => pagination.totalItems
);

export const selectCurrentPage = createSelector(
  selectEventPagination,
  (pagination) => pagination.currentPage
);

export const selectPageSize = createSelector(
  selectEventPagination,
  (pagination) => pagination.pageSize
);

export const selectHasEvents = createSelector(
  selectEvents,
  (events) => events.length > 0
);

export const selectIsEventFull = createSelector(
  selectSelectedEvent,
  (event) => event ? event.registeredParticipants >= event.maxParticipants : false
);

export const selectCanRegister = createSelector(
  selectSelectedEvent,
  (event) => {
    if (!event) return false;
    return !event.isCancelled &&
           event.status === 'UPCOMING' &&
           event.registeredParticipants < event.maxParticipants &&
           new Date(event.registrationDeadline) > new Date();
  }
); 