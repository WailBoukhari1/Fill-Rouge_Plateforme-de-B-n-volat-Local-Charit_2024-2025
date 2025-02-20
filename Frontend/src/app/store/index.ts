import { ActionReducerMap } from '@ngrx/store';
import { VolunteerState } from './volunteer/volunteer.state';
import { volunteerReducer } from './volunteer/volunteer.reducer';
import { AuthState } from './auth/auth.state';
import { authReducer } from './auth/auth.reducer';

export interface AppState {
  volunteer: VolunteerState;
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  volunteer: volunteerReducer,
  auth: authReducer
}; 