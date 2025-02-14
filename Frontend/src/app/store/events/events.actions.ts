import { createAction, props } from '@ngrx/store';
import { Event } from '../../core/models/event.model';
import { Page } from '../../core/models/page.model';
import { EventStatus } from '../../core/models/event-status.enum';

// Load All Events
export const loadEvents = createAction(
  '[Events] Load Events',
  props<{ page: number; size: number; }>()
);

export const loadEventsSuccess = createAction(
  '[Events] Load Events Success',
  props<{ events: Page<Event> }>()
);

export const loadEventsFailure = createAction(
  '[Events] Load Events Failure',
  props<{ error: string }>()
);

// Search Events
export const searchEvents = createAction(
  '[Events] Search Events',
  props<{
    query?: string;
    categories?: string[];
    location?: string;
    radius?: number;
    status?: EventStatus[];
    pendingApproval?: boolean;
    isDraft?: boolean;
    isOwner?: boolean;
    hasRegistrations?: boolean;
    isRegistered?: boolean;
    skillMatch?: boolean;
    availableSpots?: boolean;
    registrationOpen?: boolean;
    page: number;
    size: number;
  }>()
);

export const searchEventsSuccess = createAction(
  '[Events] Search Events Success',
  props<{ events: Page<Event> }>()
);

export const searchEventsFailure = createAction(
  '[Events] Search Events Failure',
  props<{ error: string }>()
);

// Load Categories
export const loadCategories = createAction(
  '[Events] Load Categories'
);

export const loadCategoriesSuccess = createAction(
  '[Events] Load Categories Success',
  props<{ categories: string[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Events] Load Categories Failure',
  props<{ error: string }>()
);

// Set Search Filters
export const setSearchFilters = createAction(
  '[Events] Set Search Filters',
  props<{
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
  }>()
);

// Clear Search Filters
export const clearSearchFilters = createAction(
  '[Events] Clear Search Filters'
);

// Reset Events State
export const resetEventsState = createAction(
  '[Events] Reset State'
); 