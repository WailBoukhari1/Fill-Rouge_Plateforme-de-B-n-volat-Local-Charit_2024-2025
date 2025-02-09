import { EventResponse } from '@core/models/event.model';

export interface EventState {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  loading: boolean;
  error: string | null;
}

export const initialEventState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
};
