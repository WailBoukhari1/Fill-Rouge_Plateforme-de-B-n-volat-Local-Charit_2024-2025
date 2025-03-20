import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventState } from './event.reducer';
import { IEvent, EventStatus } from '../../core/models/event.types';

export const selectEventState = createFeatureSelector<EventState>('event');

export const selectEvents = createSelector(
  selectEventState,
  (state: EventState) => state.events
);

export const selectEventContent = createSelector(
  selectEvents,
  (events) => events?.content || []
);

export const selectEventTotalElements = createSelector(
  selectEvents,
  (events) => events?.totalElements || 0
);

export const selectEventTotalPages = createSelector(
  selectEvents,
  (events) => events?.totalPages || 0
);

export const selectEventCurrentPage = createSelector(
  selectEvents,
  (events) => events?.number || 0
);

export const selectEventPageSize = createSelector(
  selectEvents,
  (events) => events?.size || 10
);

export const selectSelectedEvent = createSelector(
  selectEventState,
  (state: EventState) => state.selectedEvent
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

export const selectUpcomingEvents = createSelector(
  selectEventContent,
  (events: IEvent[]) => events.filter(event => 
    event.startDate > new Date() && event.status === EventStatus.UPCOMING
  )
);

export const selectOngoingEvents = createSelector(
  selectEventContent,
  (events: IEvent[]) => events.filter(event => 
    event.status === EventStatus.ONGOING
  )
);

export const selectCompletedEvents = createSelector(
  selectEventContent,
  (events: IEvent[]) => events.filter(event => 
    event.status === EventStatus.COMPLETED
  )
);

export const selectRegisteredEvents = createSelector(
  selectEventContent,
  (events: IEvent[]) => events.filter(event => 
    event.registeredParticipants.length > 0
  )
);

export const selectWaitlistedEvents = createSelector(
  selectEventContent,
  (events: IEvent[]) => events.filter(event => 
    event.waitlistedParticipants.length > 0
  )
);

export const selectEventStats = createSelector(
  selectEventContent,
  (events: IEvent[]) => ({
    total: events.length,
    upcoming: events.filter(e => e.startDate > new Date() && e.status === EventStatus.UPCOMING).length,
    ongoing: events.filter(e => e.status === EventStatus.ONGOING).length,
    completed: events.filter(e => e.status === EventStatus.COMPLETED).length,
    registered: events.filter(e => e.registeredParticipants.length > 0).length
  })
); 