import { ActionReducerMap } from '@ngrx/store';
import { authReducer } from './auth/auth.reducer';
import { AuthState } from './auth/auth.state';
import { EventState } from './event/event.reducer';
import { eventReducer } from './event/event.reducer';

export interface AppState {
  auth: AuthState;
  event: EventState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  event: eventReducer
}; 