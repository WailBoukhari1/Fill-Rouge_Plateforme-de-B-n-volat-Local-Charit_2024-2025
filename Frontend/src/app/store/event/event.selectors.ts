import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventState } from './event.reducer';
import { IEvent, EventStatus } from '../../core/models/event.types';

export const selectEventState = createFeatureSelector<EventState>('event');

export const selectEvents = createSelector(
  selectEventState,
  (state: EventState) => state.events
);

export const selectSelectedEvent = createSelector(
  selectEventState,
  (state: EventState) => state.selectedEvent
);

export const selectUpcomingEvents = createSelector(
  selectEventState,
  (state: EventState) => state.upcomingEvents
);

export const selectRegisteredEvents = createSelector(
  selectEventState,
  (state: EventState) => state.registeredEvents
);

export const selectWaitlistedEvents = createSelector(
  selectEventState,
  (state: EventState) => state.waitlistedEvents
);

export const selectEventLoading = createSelector(
  selectEventState,
  (state: EventState) => state.loading
);

export const selectEventError = createSelector(
  selectEventState,
  (state: EventState) => state.error
);

export const selectTotalElements = createSelector(
  selectEventState,
  (state: EventState) => state.totalElements
);

export const selectAvailableEvents = createSelector(
  selectEvents,
  (events: IEvent[]) => events.filter(event => 
    event.status === EventStatus.APPROVED &&
    !event.isCancelled &&
    new Date(event.startDate) > new Date() &&
    event.registeredParticipants.size < event.maxParticipants
  )
);

export const selectEventById = (eventId: string) => createSelector(
  selectEvents,
  (events) => events.find(event => event.id === eventId)
);

export const selectIsEventFull = (eventId: string) => createSelector(
  selectEventById(eventId),
  (event?: IEvent) => event ? event.registeredParticipants.size >= event.maxParticipants : false
);

export const selectCanRegister = (eventId: string) => createSelector(
  selectEventById(eventId),
  (event?: IEvent) => event ? (
    event.status === EventStatus.APPROVED &&
    !event.isCancelled &&
    new Date(event.startDate) > new Date() &&
    event.registeredParticipants.size < event.maxParticipants
  ) : false
);

export const selectEventFilters = createSelector(
  selectEventState,
  (state) => state.filters
); 