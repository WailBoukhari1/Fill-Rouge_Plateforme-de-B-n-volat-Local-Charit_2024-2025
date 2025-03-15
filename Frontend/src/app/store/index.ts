import { ActionReducerMap } from '@ngrx/store';
import { authReducer } from './auth/auth.reducer';
import { AuthState } from './auth/auth.state';
import { EventState } from './event/event.reducer';
import { eventReducer } from './event/event.reducer';
import { VolunteerState } from './volunteer/volunteer.state';
import { volunteerReducer } from './volunteer/volunteer.reducer';

export interface AppState {
  auth: AuthState;
  event: EventState;
  volunteer: VolunteerState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  event: eventReducer,
  volunteer: volunteerReducer
}; 