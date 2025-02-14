import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventsState } from './events.reducer';

export const selectEventsState = createFeatureSelector<EventsState>('events');

export const selectAllEvents = createSelector(
  selectEventsState,
  (state) => state.events
);

export const selectCategories = createSelector(
  selectEventsState,
  (state) => state.categories
);

export const selectSearchFilters = createSelector(
  selectEventsState,
  (state) => state.searchFilters
);

export const selectEventsLoading = createSelector(
  selectEventsState,
  (state) => state.loading
);

export const selectEventsError = createSelector(
  selectEventsState,
  (state) => state.error
);

export const selectHasEvents = createSelector(
  selectAllEvents,
  (events) => {
    if (!events?.content) return false;
    return events.content.length > 0;
  }
);

export const selectTotalEvents = createSelector(
  selectAllEvents,
  (events) => events?.totalElements ?? 0
);

export const selectCurrentPage = createSelector(
  selectAllEvents,
  (events) => events?.number ?? 0
);

export const selectPageSize = createSelector(
  selectAllEvents,
  (events) => events?.size ?? 10
); 