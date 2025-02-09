import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { eventReducer } from './app/features/events/store/event.reducer';
import { EventEffects } from './app/features/events/store/event.effects';
import { authReducer } from './app/store/auth/auth.reducer';
import { AuthEffects } from './app/store/auth/auth.effects';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideStore({ 
      events: eventReducer,
      auth: authReducer
    }),
    provideEffects([EventEffects, AuthEffects])
  ]
}).catch(err => console.error(err));
